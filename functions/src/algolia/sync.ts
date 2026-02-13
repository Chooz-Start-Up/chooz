import { onDocumentWritten } from "firebase-functions/v2/firestore";

/**
 * Syncs item data to Algolia when items are created, updated, or deleted.
 * Triggers on: restaurants/{restaurantId}/menus/{menuId}/categories/{categoryId}/items/{itemId}
 */
export const onItemWrite = onDocumentWritten(
  "restaurants/{restaurantId}/menus/{menuId}/categories/{categoryId}/items/{itemId}",
  async (event) => {
    const { restaurantId, menuId, categoryId, itemId } = event.params;

    // TODO: Initialize Algolia client
    // const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
    // const index = algoliaClient.initIndex('menuItems');

    const after = event.data?.after?.data();

    if (!after) {
      // Item was deleted — remove from Algolia
      console.log(`Item ${itemId} deleted, removing from Algolia index`);
      // await index.deleteObject(itemId);
      return;
    }

    // Item was created or updated — upsert to Algolia
    console.log(`Syncing item ${itemId} to Algolia`, {
      restaurantId,
      menuId,
      categoryId,
    });

    // TODO: Fetch restaurant data for denormalization
    // TODO: Build MenuItemSearchRecord and save to Algolia
    // await index.saveObject({ objectID: itemId, ...record });
  },
);
