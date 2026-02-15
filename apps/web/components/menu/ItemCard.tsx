"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Draggable } from "@hello-pangea/dnd";
import type { Item } from "@chooz/shared";
import { useState } from "react";

export const STATUS_BADGES = [
  { value: "available", label: "Available", color: "success" as const },
  { value: "sold-out", label: "Sold Out", color: "error" as const },
  { value: "new", label: "New", color: "info" as const },
  { value: "best-seller", label: "Best Seller", color: "warning" as const },
  { value: "limited-time", label: "Limited Time", color: "secondary" as const },
] as const;

function getItemBadge(item: Item) {
  const badge = item.tags.find((t) => STATUS_BADGES.some((b) => b.value === t));
  if (badge) return STATUS_BADGES.find((b) => b.value === badge)!;
  return STATUS_BADGES[0]; // Available
}

interface ItemCardProps {
  item: Item;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onBadgeChange: (badge: string) => void;
  onToggleVisibility: () => void;
}

export function ItemCard({ item, index, onEdit, onDelete, onBadgeChange, onToggleVisibility }: ItemCardProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const badge = getItemBadge(item);

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            display: "grid",
            gridTemplateColumns: "24px 1fr 72px 120px 96px",
            alignItems: "center",
            gap: 1,
            p: 1,
            pl: 0.5,
            borderRadius: 1,
            border: "1px solid",
            borderColor: snapshot.isDragging ? "primary.main" : "divider",
            bgcolor: snapshot.isDragging ? "action.hover" : "background.paper",
            mb: 0.5,
          }}
        >
          {/* Drag handle */}
          <Box {...provided.dragHandleProps} sx={{ display: "flex", alignItems: "center" }}>
            <DragIndicatorIcon fontSize="small" color="action" />
          </Box>

          {/* Name / description */}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
              {item.name}
            </Typography>
            {item.description && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {item.description}
              </Typography>
            )}
          </Box>

          {/* Price */}
          <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "nowrap", textAlign: "right" }}>
            ${item.price.toFixed(2)}
          </Typography>

          {/* Status badge */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Chip
              label={badge.label}
              size="small"
              color={badge.value === "limited-time" ? undefined : badge.color}
              variant="outlined"
              deleteIcon={<ArrowDropDownIcon />}
              onDelete={(e) => setAnchorEl(e.currentTarget.closest(".MuiChip-root") as HTMLElement)}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                cursor: "pointer",
                ...(badge.value === "limited-time" && {
                  color: "#e91e8a",
                  borderColor: "#e91e8a",
                }),
              }}
            />
            <Menu
              anchorEl={anchorEl}
              open={!!anchorEl}
              onClose={() => setAnchorEl(null)}
            >
              {STATUS_BADGES.map((b) => (
                <MenuItem
                  key={b.value}
                  selected={b.value === badge.value}
                  onClick={() => {
                    onBadgeChange(b.value);
                    setAnchorEl(null);
                  }}
                >
                  {b.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton size="small" onClick={onToggleVisibility} title={item.isAvailable ? "Hide item" : "Show item"}>
              {item.isAvailable ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" color="disabled" />}
            </IconButton>
            <IconButton size="small" onClick={onEdit} title="Edit item">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onDelete} title="Delete item">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}
    </Draggable>
  );
}
