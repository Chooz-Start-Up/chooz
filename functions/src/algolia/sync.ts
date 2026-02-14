import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { defineString } from "firebase-functions/params";
import { getFirestore } from "firebase-admin/firestore";
import { algoliasearch } from "algoliasearch";

const ALGOLIA_APP_ID = defineString("ALGOLIA_APP_ID");
const ALGOLIA_ADMIN_KEY = defineString("ALGOLIA_ADMIN_KEY");

const INDEX_NAME = "menuItems";

/**
 * Syncs item data to Algolia when items are created, updated, or deleted.
 * Triggers on: restaurants/{restaurantId}/menus/{menuId}/categories/{categoryId}/items/{itemId}
 *
 * Each Algolia record is a denormalized MenuItemSearchRecord that includes
 * restaurant name, address, and geo coordinates for geo-search.
 */
export const onItemWrite = onDocumentWritten(
  "restaurants/{restaurantId}/menus/{menuId}/categories/{categoryId}/items/{itemId}",
  async (event) => {
    const { restaurantId, menuId, categoryId, itemId } = event.params;
    const client = algoliasearch(ALGOLIA_APP_ID.value(), ALGOLIA_ADMIN_KEY.value());

    const after = event.data?.after?.data();

    if (!after) {
      // Item was deleted — remove from Algolia
      console.log(`Item ${itemId} deleted, removing from Algolia index`);
      await client.deleteObject({ indexName: INDEX_NAME, objectID: itemId });
      return;
    }

    // Fetch parent documents for denormalization
    const db = getFirestore();

    const [restaurantSnap, menuSnap, categorySnap] = await Promise.all([
      db.doc(`restaurants/${restaurantId}`).get(),
      db.doc(`restaurants/${restaurantId}/menus/${menuId}`).get(),
      db.doc(`restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}`).get(),
    ]);

    const restaurant = restaurantSnap.data();
    const menu = menuSnap.data();
    const category = categorySnap.data();

    if (!restaurant) {
      console.error(`Restaurant ${restaurantId} not found, skipping sync`);
      return;
    }

    const record = {
      objectID: itemId,
      itemName: after.name ?? "",
      description: after.description ?? "",
      price: after.price ?? 0,
      ingredients: after.ingredients ?? [],
      tags: after.tags ?? [],

      restaurantId,
      restaurantName: restaurant.name ?? "",
      restaurantAddress: restaurant.address ?? "",
      _geoloc: {
        lat: restaurant.latitude ?? 0,
        lng: restaurant.longitude ?? 0,
      },

      menuName: menu?.name ?? "",
      categoryName: category?.name ?? "",
    };

    console.log(`Syncing item ${itemId} to Algolia`, {
      restaurantId,
      menuId,
      categoryId,
    });

    await client.saveObject({ indexName: INDEX_NAME, body: record });
  },
);
