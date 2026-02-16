"use client";

import { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Popover from "@mui/material/Popover";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import SettingsIcon from "@mui/icons-material/Settings";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import type { Category, Item } from "@chooz/shared";
import { InlineEdit } from "./InlineEdit";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { ItemCard, STATUS_BADGES } from "./ItemCard";
import { ItemEditDialog } from "./ItemEditDialog";

interface CategorySectionProps {
  restaurantId: string;
  category: Category;
  index: number;
  items: Item[];
  onRenameCategory: (name: string) => Promise<void>;
  onUpdateCategory: (data: Partial<Category>) => Promise<void>;
  onDeleteCategory: () => Promise<void>;
  onCreateItem: (data: Omit<Item, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onUpdateItem: (itemId: string, data: Partial<Item>) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
}

export function CategorySection({
  restaurantId,
  category,
  index,
  items,
  onRenameCategory,
  onUpdateCategory,
  onDeleteCategory,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
}: CategorySectionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [createItemOpen, setCreateItemOpen] = useState(false);
  const [deleteItemTarget, setDeleteItemTarget] = useState<Item | null>(null);
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(null);

  // Inline quick-add state
  const [quickName, setQuickName] = useState("");
  const [quickPrice, setQuickPrice] = useState("");
  const [quickAdding, setQuickAdding] = useState(false);
  const quickNameRef = useRef<HTMLInputElement>(null);

  const handleQuickAdd = async () => {
    const name = quickName.trim();
    if (!name) return;
    const price = parseFloat(quickPrice) || 0;
    setQuickAdding(true);
    try {
      await onCreateItem({
        name,
        description: "",
        price: Math.round(Math.max(0, price) * 100) / 100,
        ingredients: [],
        tags: [],
        imageUrl: null,
        isAvailable: true,
        sortOrder: items.length,
      });
      setQuickName("");
      setQuickPrice("");
      setTimeout(() => quickNameRef.current?.focus(), 50);
    } finally {
      setQuickAdding(false);
    }
  };

  return (
    <Draggable draggableId={category.id} index={index}>
      {(dragProvided, snapshot) => (
        <Paper
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          variant="outlined"
          sx={{
            mb: 2,
            border: snapshot.isDragging ? "2px solid" : "1px solid",
            borderColor: snapshot.isDragging ? "primary.main" : "divider",
          }}
        >
          {/* Category header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "grey.50",
            }}
          >
            <Box {...dragProvided.dragHandleProps} sx={{ display: "flex" }}>
              <DragIndicatorIcon color="action" />
            </Box>
            <Typography
              variant="subtitle1"
              sx={{ flex: 1, fontWeight: 600, minWidth: 0, opacity: category.isVisible ? 1 : 0.5 }}
              noWrap
            >
              {category.name}
            </Typography>
            {!category.isVisible && (
              <VisibilityOffIcon fontSize="small" sx={{ color: "text.disabled" }} />
            )}
            <Typography variant="caption" color="text.secondary">
              {items.length} {items.length === 1 ? "item" : "items"}
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => setSettingsAnchor(e.currentTarget)}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Items list */}
          <Droppable droppableId={`items-${category.id}`} type="ITEM">
            {(droppableProvided) => (
              <Box
                ref={droppableProvided.innerRef}
                {...droppableProvided.droppableProps}
                sx={{ px: 1, pt: 1, pb: 0, minHeight: 0 }}
              >
                {items.map((item, idx) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    index={idx}
                    onEdit={() => setEditingItem(item)}
                    onDelete={() => setDeleteItemTarget(item)}
                    onBadgeChange={(badge) => {
                      const badgeValues = STATUS_BADGES.map((b) => b.value as string);
                      const tags = item.tags.filter((t) => !badgeValues.includes(t));
                      if (badge !== "available") tags.push(badge);
                      onUpdateItem(item.id, { tags });
                    }}
                    onToggleVisibility={() => {
                      onUpdateItem(item.id, { isAvailable: !item.isAvailable });
                    }}
                  />
                ))}
                {droppableProvided.placeholder}
              </Box>
            )}
          </Droppable>

          {/* Inline quick-add row + Add Item button */}
          <Box sx={{ px: 1, pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              inputRef={quickNameRef}
              size="small"
              placeholder="Item name"
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleQuickAdd();
              }}
              disabled={quickAdding}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              placeholder="0.00"
              value={quickPrice}
              onChange={(e) => setQuickPrice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleQuickAdd();
              }}
              disabled={quickAdding}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { min: 0, step: 0.01 },
              }}
              sx={{ width: 120 }}
            />
            <Button
              size="small"
              variant="contained"
              onClick={handleQuickAdd}
              disabled={quickAdding || !quickName.trim()}
            >
              Add
            </Button>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setCreateItemOpen(true)}
            >
              Full Form
            </Button>
          </Box>

          {/* Category settings popover */}
          <Popover
            open={!!settingsAnchor}
            anchorEl={settingsAnchor}
            onClose={() => setSettingsAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Box sx={{ p: 2, minWidth: 280 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Category Name
              </Typography>
              <InlineEdit
                value={category.name}
                onSave={onRenameCategory}
                variant="body1"
              />
            </Box>
            <Divider />
            <Box sx={{ px: 2, py: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={category.isVisible}
                    onChange={(_, checked) => onUpdateCategory({ isVisible: checked })}
                  />
                }
                label="Visible on Menu"
              />
            </Box>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Button
                color="error"
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => {
                  setSettingsAnchor(null);
                  setDeleteOpen(true);
                }}
              >
                Delete Category
              </Button>
            </Box>
          </Popover>

          {/* Delete category dialog */}
          <DeleteConfirmDialog
            open={deleteOpen}
            title="Delete Category"
            description={`This will delete "${category.name}" and all ${items.length} ${items.length === 1 ? "item" : "items"} within it.`}
            confirmText={category.name}
            onClose={() => setDeleteOpen(false)}
            onConfirm={onDeleteCategory}
          />

          {/* Delete item dialog */}
          <DeleteConfirmDialog
            open={!!deleteItemTarget}
            title="Delete Item"
            description={deleteItemTarget ? `Delete "${deleteItemTarget.name}"?` : ""}
            onClose={() => setDeleteItemTarget(null)}
            onConfirm={() =>
              deleteItemTarget ? onDeleteItem(deleteItemTarget.id) : Promise.resolve()
            }
          />

          {/* Create/Edit item dialog */}
          <ItemEditDialog
            open={createItemOpen || !!editingItem}
            restaurantId={restaurantId}
            item={editingItem}
            onClose={() => {
              setCreateItemOpen(false);
              setEditingItem(null);
            }}
            onSave={async (data) => {
              if (editingItem) {
                await onUpdateItem(editingItem.id, data);
              } else {
                await onCreateItem({ ...data, sortOrder: items.length });
              }
            }}
          />
        </Paper>
      )}
    </Draggable>
  );
}
