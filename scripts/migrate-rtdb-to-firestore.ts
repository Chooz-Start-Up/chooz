/**
 * Migration script: Firebase Realtime DB → Cloud Firestore
 *
 * Reads data from the old RTDB structure and writes to the new
 * Firestore subcollection hierarchy.
 *
 * Old RTDB structure:
 *   /users/{uid}/restaurants/{restaurantKey}   → user-restaurant mapping
 *   /restaurants/{restaurantKey}               → restaurant details
 *   /restaurantList/{restaurantKey}            → lightweight listing
 *   /restaurantMenuList/{restaurantKey}/menus  → nested menu hierarchy
 *
 * New Firestore structure:
 *   users/{uid}
 *   restaurants/{restaurantId}
 *   restaurants/{restaurantId}/menus/{menuId}
 *   restaurants/{restaurantId}/menus/{menuId}/categories/{categoryId}
 *   restaurants/{restaurantId}/menus/{menuId}/categories/{categoryId}/items/{itemId}
 *
 * Usage:
 *   npx tsx scripts/migrate-rtdb-to-firestore.ts
 *
 * Prerequisites:
 *   - GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account JSON
 *   - Or run from a machine with default application credentials
 */

import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ── Config ──────────────────────────────────────────────────────────

const FIREBASE_DATABASE_URL =
  process.env.FIREBASE_DATABASE_URL ??
  "https://chooz-1a9aa-default-rtdb.firebaseio.com";
const DRY_RUN = process.argv.includes("--dry-run");

// ── Types for old RTDB data ─────────────────────────────────────────

interface OldItem {
  _itemName?: string;
  _price?: number;
  _description?: string;
  _ingredients?: string;
}

interface OldCategory {
  _categoryName?: string;
  _description?: string;
  _items?: OldItem[];
}

interface OldMenu {
  _menuName?: string;
  _categories?: OldCategory[];
}

interface OldRestaurant {
  id?: string;
  restaurantName?: string;
  description?: string;
  isPublished?: boolean;
  phoneNumber?: string;
  ownerName?: string;
  address?: string;
  hours?: string;
}

// ── Stats ───────────────────────────────────────────────────────────

const stats = {
  restaurants: { migrated: 0, skipped: 0, errors: 0 },
  menus: { migrated: 0 },
  categories: { migrated: 0 },
  items: { migrated: 0 },
  users: { migrated: 0, skipped: 0 },
};

// ── Helpers ─────────────────────────────────────────────────────────

function parseIngredients(raw: string | undefined): string[] {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseAddress(raw: string | undefined): string {
  if (!raw) return "";
  // Old format: "street\ncity\nstate\nzip" → join with ", "
  return raw.replace(/\n/g, ", ");
}

function generateId(): string {
  return getFirestore().collection("_").doc().id;
}

// ── Migration ───────────────────────────────────────────────────────

async function migrateRestaurants() {
  const rtdb = getDatabase();
  const firestore = getFirestore();

  console.log("\n📋 Reading restaurants from RTDB...");
  const restaurantsSnap = await rtdb.ref("/restaurants").once("value");
  const restaurants: Record<string, OldRestaurant> = restaurantsSnap.val() ?? {};
  console.log(`   Found ${Object.keys(restaurants).length} restaurants`);

  console.log("📋 Reading menu data from RTDB...");
  const menuListSnap = await rtdb.ref("/restaurantMenuList").once("value");
  const menuList: Record<string, { menus?: OldMenu[] }> = menuListSnap.val() ?? {};

  for (const [restaurantKey, restaurant] of Object.entries(restaurants)) {
    try {
      // Check if already migrated
      const existingDoc = await firestore.doc(`restaurants/${restaurantKey}`).get();
      if (existingDoc.exists) {
        console.log(`   ⏭  Restaurant "${restaurant.restaurantName}" already exists, skipping`);
        stats.restaurants.skipped++;
        continue;
      }

      console.log(`\n🍽  Migrating restaurant: "${restaurant.restaurantName}" (${restaurantKey})`);

      if (DRY_RUN) {
        stats.restaurants.migrated++;
        continue;
      }

      // Write restaurant document
      const batch = firestore.batch();
      const restaurantRef = firestore.doc(`restaurants/${restaurantKey}`);

      batch.set(restaurantRef, {
        name: restaurant.restaurantName ?? "",
        description: restaurant.description ?? "",
        ownerUid: null, // Will be linked during user migration
        ownershipStatus: "verified", // Existing owner-managed restaurants
        claimedBy: null,
        claimDate: null,
        verifiedDate: FieldValue.serverTimestamp(),
        isPublished: restaurant.isPublished ?? false,
        phone: restaurant.phoneNumber ?? "",
        address: parseAddress(restaurant.address),
        geoHash: "", // Needs geocoding — run separately
        latitude: 0,
        longitude: 0,
        hours: {}, // Old format is a plain string — needs manual restructuring
        tags: [],
        bannerImageUrl: null,
        logoImageUrl: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      await batch.commit();
      stats.restaurants.migrated++;

      // Migrate menus for this restaurant
      const menuData = menuList[restaurantKey];
      if (menuData?.menus) {
        await migrateMenus(restaurantKey, menuData.menus);
      }
    } catch (error) {
      console.error(`   ❌ Error migrating restaurant ${restaurantKey}:`, error);
      stats.restaurants.errors++;
    }
  }
}

async function migrateMenus(restaurantId: string, menus: OldMenu[]) {
  const firestore = getFirestore();

  for (let menuIndex = 0; menuIndex < menus.length; menuIndex++) {
    const menu = menus[menuIndex];
    if (!menu) continue;

    const menuId = generateId();
    const menuRef = firestore.doc(
      `restaurants/${restaurantId}/menus/${menuId}`,
    );

    await menuRef.set({
      name: menu._menuName ?? `Menu ${menuIndex + 1}`,
      sortOrder: menuIndex,
      isActive: true,
      availableFrom: null,
      availableTo: null,
      availableDays: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    stats.menus.migrated++;

    console.log(`   📑 Menu: "${menu._menuName}"`);

    // Migrate categories
    if (menu._categories) {
      await migrateCategories(restaurantId, menuId, menu._categories);
    }
  }
}

async function migrateCategories(
  restaurantId: string,
  menuId: string,
  categories: OldCategory[],
) {
  const firestore = getFirestore();

  for (let catIndex = 0; catIndex < categories.length; catIndex++) {
    const category = categories[catIndex];
    if (!category) continue;

    const categoryId = generateId();
    const categoryRef = firestore.doc(
      `restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}`,
    );

    await categoryRef.set({
      name: category._categoryName ?? `Category ${catIndex + 1}`,
      description: category._description ?? "",
      sortOrder: catIndex,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    stats.categories.migrated++;

    // Migrate items
    if (category._items) {
      await migrateItems(restaurantId, menuId, categoryId, category._items);
    }
  }
}

async function migrateItems(
  restaurantId: string,
  menuId: string,
  categoryId: string,
  items: OldItem[],
) {
  const firestore = getFirestore();
  const batch = firestore.batch();

  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    const item = items[itemIndex];
    if (!item) continue;

    const itemId = generateId();
    const itemRef = firestore.doc(
      `restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}/items/${itemId}`,
    );

    batch.set(itemRef, {
      name: item._itemName ?? `Item ${itemIndex + 1}`,
      description: item._description ?? "",
      price: typeof item._price === "number" ? item._price : 0,
      ingredients: parseIngredients(item._ingredients),
      tags: [],
      imageUrl: null,
      isAvailable: true,
      sortOrder: itemIndex,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    stats.items.migrated++;
  }

  await batch.commit();
}

async function migrateUsers() {
  const rtdb = getDatabase();
  const firestore = getFirestore();

  console.log("\n👤 Reading user-restaurant mappings from RTDB...");
  const usersSnap = await rtdb.ref("/users").once("value");
  const users: Record<string, { restaurants?: Record<string, { id: string }> }> =
    usersSnap.val() ?? {};

  for (const [uid, userData] of Object.entries(users)) {
    const existingUser = await firestore.doc(`users/${uid}`).get();
    if (existingUser.exists) {
      console.log(`   ⏭  User ${uid} already exists, skipping`);
      stats.users.skipped++;
      continue;
    }

    if (DRY_RUN) {
      stats.users.migrated++;
      continue;
    }

    // Create a minimal user document
    await firestore.doc(`users/${uid}`).set({
      uid,
      email: "", // Not stored in RTDB — will be populated on next login
      displayName: "",
      authProvider: "email",
      role: "owner", // Users in old system were all owners
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    stats.users.migrated++;

    // Link restaurants to this owner
    if (userData.restaurants) {
      for (const restaurantMapping of Object.values(userData.restaurants)) {
        const restaurantId = restaurantMapping.id;
        if (!restaurantId) continue;

        const restaurantRef = firestore.doc(`restaurants/${restaurantId}`);
        const restaurantDoc = await restaurantRef.get();
        if (restaurantDoc.exists) {
          await restaurantRef.update({
            ownerUid: uid,
            claimedBy: uid,
          });
          console.log(`   🔗 Linked restaurant ${restaurantId} to user ${uid}`);
        }
      }
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Chooz RTDB → Firestore Migration");
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}`);
  console.log(`   Database URL: ${FIREBASE_DATABASE_URL}`);
  console.log("─".repeat(50));

  // Initialize Firebase Admin
  const app = initializeApp({
    databaseURL: FIREBASE_DATABASE_URL,
  });

  await migrateRestaurants();
  await migrateUsers();

  console.log("\n" + "─".repeat(50));
  console.log("📊 Migration Summary:");
  console.log(`   Restaurants: ${stats.restaurants.migrated} migrated, ${stats.restaurants.skipped} skipped, ${stats.restaurants.errors} errors`);
  console.log(`   Menus:       ${stats.menus.migrated} migrated`);
  console.log(`   Categories:  ${stats.categories.migrated} migrated`);
  console.log(`   Items:       ${stats.items.migrated} migrated`);
  console.log(`   Users:       ${stats.users.migrated} migrated, ${stats.users.skipped} skipped`);
  console.log("\n✅ Migration complete!");

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
