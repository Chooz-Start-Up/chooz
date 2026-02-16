"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import { Droppable } from "@hello-pangea/dnd";
import type { Category, Item } from "@chooz/shared";
import { CategorySection } from "./CategorySection";

interface CategoryListProps {
  restaurantId: string;
  categories: Category[];
  items: Record<string, Item[]>; // keyed by categoryId
  onAddCategory: (name: string) => Promise<void>;
  onRenameCategory: (catId: string, name: string) => Promise<void>;
  onUpdateCategory: (catId: string, data: Partial<Category>) => Promise<void>;
  onDeleteCategory: (catId: string) => Promise<void>;
  onCreateItem: (catId: string, data: Omit<Item, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onUpdateItem: (catId: string, itemId: string, data: Partial<Item>) => Promise<void>;
  onDeleteItem: (catId: string, itemId: string) => Promise<void>;
}

export function CategoryList({
  restaurantId,
  categories,
  items,
  onAddCategory,
  onRenameCategory,
  onUpdateCategory,
  onDeleteCategory,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
}: CategoryListProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    await onAddCategory(name);
    setNewName("");
    setAdding(false);
  };

  return (
    <Box>
      <Droppable droppableId="categories" type="CATEGORY">
        {(provided) => (
          <Box ref={provided.innerRef} {...provided.droppableProps}>
            {categories.map((cat, idx) => (
              <CategorySection
                key={cat.id}
                restaurantId={restaurantId}
                category={cat}
                index={idx}
                items={items[cat.id] ?? []}
                onRenameCategory={(name) => onRenameCategory(cat.id, name)}
                onUpdateCategory={(data) => onUpdateCategory(cat.id, data)}
                onDeleteCategory={() => onDeleteCategory(cat.id)}
                onCreateItem={(data) => onCreateItem(cat.id, data)}
                onUpdateItem={(itemId, data) => onUpdateItem(cat.id, itemId, data)}
                onDeleteItem={(itemId) => onDeleteItem(cat.id, itemId)}
              />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>

      <Box sx={{ mt: 1 }}>
        {adding ? (
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              autoFocus
              size="small"
              placeholder="Appetizers, Entrees, Desserts"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") {
                  setAdding(false);
                  setNewName("");
                }
              }}
              sx={{ flex: 1 }}
            />
            <Button variant="contained" size="small" onClick={handleAdd} disabled={!newName.trim()}>
              Add
            </Button>
          </Box>
        ) : (
          <Button startIcon={<AddIcon />} onClick={() => setAdding(true)}>
            Add Category
          </Button>
        )}
      </Box>
    </Box>
  );
}
