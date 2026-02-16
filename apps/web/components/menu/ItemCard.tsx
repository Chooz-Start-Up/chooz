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
import GrassIcon from "@mui/icons-material/Grass";
import GrainIcon from "@mui/icons-material/Grain";
import SpaIcon from "@mui/icons-material/Spa";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import Tooltip from "@mui/material/Tooltip";
import { Draggable } from "@hello-pangea/dnd";
import type { Item } from "@chooz/shared";
import { useState } from "react";

const DIETARY_ICON_MAP: Record<string, { Icon: React.ElementType; color: string; label: string }> = {
  "vegan": { Icon: SpaIcon, color: "#4caf50", label: "Vegan" },
  "vegetarian": { Icon: GrassIcon, color: "#8bc34a", label: "Vegetarian" },
  "gluten-free": { Icon: GrainIcon, color: "#ff9800", label: "Gluten-Free" },
  "contains-peanuts": { Icon: WarningAmberIcon, color: "#e65100", label: "Contains Peanuts" },
  "dairy-free": { Icon: WaterDropIcon, color: "#29b6f6", label: "Dairy-Free" },
};

export const STATUS_BADGES = [
  { value: "available", label: "Available", color: "default" as const },
  { value: "sold-out", label: "Sold Out", color: "error" as const },
  { value: "new", label: "New", color: "info" as const },
  { value: "best-seller", label: "Best Seller", color: "success" as const },
  { value: "leaving-soon", label: "Leaving Soon", color: "warning" as const },
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
            gridTemplateColumns: "24px 1fr 72px 120px 40px 96px",
            alignItems: "center",
            gap: 1,
            p: 1,
            pl: 0.5,
            borderRadius: 1,
            border: "1px solid",
            borderColor: snapshot.isDragging ? "primary.main" : "divider",
            bgcolor: snapshot.isDragging ? "action.hover" : "background.paper",
            mb: 0.5,
            opacity: item.isAvailable ? 1 : 0.45,
          }}
        >
          {/* Drag handle */}
          <Box {...provided.dragHandleProps} sx={{ display: "flex", alignItems: "center" }}>
            <DragIndicatorIcon fontSize="small" color="action" />
          </Box>

          {/* Name / description / dietary icons */}
          <Box sx={{ minWidth: 0, overflow: "hidden" }}>
            <Typography variant="body2" sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.name}
            </Typography>
            {item.description && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.description}
              </Typography>
            )}
            {item.tags.some((t) => t in DIETARY_ICON_MAP || t.startsWith("spicy-")) && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.25, alignItems: "center", mt: 0.25 }}>
                {item.tags
                  .filter((t) => t.startsWith("spicy-"))
                  .slice(0, 1)
                  .map((t) => {
                    const level = parseInt(t.split("-")[1], 10);
                    return Array.from({ length: level }, (_, i) => (
                      <Tooltip key={`spicy-${i}`} title={`Spicy (level ${level})`} arrow>
                        <WhatshotIcon sx={{ fontSize: 16, color: "#f44336" }} />
                      </Tooltip>
                    ));
                  })}
                {item.tags
                  .filter((t) => t in DIETARY_ICON_MAP)
                  .map((t) => {
                    const { Icon, color, label } = DIETARY_ICON_MAP[t];
                    return (
                      <Tooltip key={t} title={label} arrow>
                        <Icon sx={{ fontSize: 16, color }} />
                      </Tooltip>
                    );
                  })}
              </Box>
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
              color={badge.value === "limited-time" || badge.value === "available" ? undefined : badge.color}
              variant="outlined"
              deleteIcon={<ArrowDropDownIcon />}
              onDelete={(e) => setAnchorEl(e.currentTarget.closest(".MuiChip-root") as HTMLElement)}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                cursor: "pointer",
                ...(badge.value === "available" && {
                  color: "text.primary",
                  borderColor: "text.primary",
                }),
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

          {/* Thumbnail */}
          <Box sx={{ width: 36, height: 36, display: "flex", justifyContent: "center" }}>
            {item.imageUrl && (
              <Box
                component="img"
                src={item.imageUrl}
                alt=""
                sx={{ width: 36, height: 36, objectFit: "cover", borderRadius: 0.5 }}
              />
            )}
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
