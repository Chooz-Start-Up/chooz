# Item Image Upload in Menu Builder

## Context

Menu items have an `imageUrl: string | null` field, but there's no UI to upload photos. Restaurant owners need to add food photos to their menu items, following the same immediate-upload pattern used by the profile page's banner/logo upload (`ImageUploadSection`).

Scope: **Items only**, in the **ItemEditDialog** (edit mode). In create mode, the image section will be disabled with a hint to save first and then edit to add a photo.

## Files to Modify (5)

| # | File | Change |
|---|------|--------|
| 1 | `packages/services/src/storage/index.ts` | Add `uploadItemImage()` and `deleteItemImage()` convenience helpers |
| 2 | `apps/web/components/menu/ItemEditDialog.tsx` | Add image upload section (preview, upload/replace, delete) |
| 3 | `apps/web/components/menu/CategorySection.tsx` | Add `restaurantId` + `menuId` props, wire image upload/delete callbacks to dialog |
| 4 | `apps/web/components/menu/CategoryList.tsx` | Thread `restaurantId` + `menuId` props through to CategorySection |
| 5 | `apps/web/app/(dashboard)/edit/page.tsx` | Pass `restaurant.id` and `selectedMenuId` to CategoryList |

No new files needed.

## Design

### 1. Storage Helpers

Add to `packages/services/src/storage/index.ts`, following the `uploadBanner`/`uploadLogo` pattern:

```typescript
export function uploadItemImage(
  restaurantId: string, menuId: string, categoryId: string, itemId: string,
  file: Blob | Uint8Array | ArrayBuffer,
) {
  return uploadImage(
    `restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}/items/${itemId}/image`,
    file,
  );
}

export function deleteItemImage(
  restaurantId: string, menuId: string, categoryId: string, itemId: string,
) {
  return deleteImage(
    `restaurants/${restaurantId}/menus/${menuId}/categories/${categoryId}/items/${itemId}/image`,
  );
}
```

### 2. ItemEditDialog — Image Upload Section

Add two new optional props:
```typescript
onUploadImage?: (file: File) => Promise<string>;  // returns URL
onDeleteImage?: () => Promise<void>;
```

These are only provided in **edit mode** (when `item` is not null). The dialog handles the upload UI internally:

- **Edit mode with existing image:** Shows rectangular preview (4:3 aspect ratio), with replace and delete icon buttons overlaid. Spinner overlay during upload/delete.
- **Edit mode without image:** Shows dashed-border placeholder ("Click to upload photo") — same style as `ImageUploadSection`.
- **Create mode:** Shows a muted hint: "Save the item first to add a photo."

Upload flow (same pattern as `ImageUploadSection`):
1. User selects file via hidden `<input type="file" accept="image/*">`
2. Client-side validation (image MIME type, 5 MB max)
3. Call `onUploadImage(file)` → uploads to Storage + updates Firestore item → returns URL
4. Update local form state: `setForm(f => ({ ...f, imageUrl: url }))`
5. On error, show inline Alert

Delete flow:
1. Call `onDeleteImage()` → deletes from Storage + nulls Firestore item's `imageUrl`
2. Update local form state: `setForm(f => ({ ...f, imageUrl: null }))`

Image changes are **immediate** (persisted on upload/delete), not batched with the Save button. This matches the profile image pattern.

### 3. CategorySection — Wire Callbacks

Add `restaurantId: string` and `menuId: string` to `CategorySectionProps`.

When rendering `ItemEditDialog` in edit mode, provide:
```typescript
onUploadImage={editingItem ? async (file) => {
  const url = await storageService.uploadItemImage(
    restaurantId, menuId, category.id, editingItem.id, file
  );
  await onUpdateItem(editingItem.id, { imageUrl: url });
  return url;
} : undefined}

onDeleteImage={editingItem ? async () => {
  await storageService.deleteItemImage(
    restaurantId, menuId, category.id, editingItem.id
  );
  await onUpdateItem(editingItem.id, { imageUrl: null });
} : undefined}
```

### 4. Prop Threading

`edit/page.tsx` → `CategoryList` → `CategorySection`:
- Add `restaurantId: string` and `menuId: string` to `CategoryListProps`
- Pass `restaurant.id` and `selectedMenuId!` from the edit page
- CategoryList passes them through to each CategorySection

## Implementation Order

1. Add `uploadItemImage` / `deleteItemImage` to storage service
2. Add `restaurantId` + `menuId` props to CategoryList and CategorySection
3. Pass them from the edit page
4. Add image upload UI to ItemEditDialog
5. Wire the upload/delete callbacks in CategorySection
6. Run `pnpm typecheck`

## Verification

1. `pnpm typecheck` passes
2. Navigate to `/edit`, select a menu with items
3. Click edit on an item → dialog shows image placeholder
4. Upload an image → preview appears with replace/delete buttons
5. Close and reopen the dialog → image persists
6. Delete the image → placeholder returns
7. Create a new item → dialog shows "Save first to add a photo" hint
8. Quick-add an item, then edit it → image upload is available
