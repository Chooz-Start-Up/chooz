"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import GrassIcon from "@mui/icons-material/Grass";
import GrainIcon from "@mui/icons-material/Grain";
import ImageIcon from "@mui/icons-material/Image";
import SpaIcon from "@mui/icons-material/Spa";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import type { Category, Item, Menu } from "@chooz/shared";
import { STATUS_BADGES } from "@/components/menu/ItemCard";
import { isMenuAvailable } from "./menuUtils";

const DIETARY_ICON_MAP: Record<string, { Icon: React.ElementType; color: string; label: string }> = {
  "vegan":            { Icon: SpaIcon,          color: "#4caf50", label: "Vegan" },
  "vegetarian":       { Icon: GrassIcon,         color: "#8bc34a", label: "Vegetarian" },
  "gluten-free":      { Icon: GrainIcon,         color: "#ff9800", label: "Gluten-Free" },
  "contains-peanuts": { Icon: WarningAmberIcon,  color: "#e65100", label: "Contains Peanuts" },
  "dairy-free":       { Icon: WaterDropIcon,     color: "#29b6f6", label: "Dairy-Free" },
};

function getStatusBadge(tags: string[]) {
  const match = tags.find((t) => STATUS_BADGES.some((b) => b.value === t));
  return match ? STATUS_BADGES.find((b) => b.value === match)! : STATUS_BADGES[0];
}

function StatusBadge({ tags }: { tags: string[] }) {
  const badge = getStatusBadge(tags);
  if (badge.value === "available") return null;
  return (
    <Chip
      label={badge.label}
      size="small"
      color={badge.value === "limited-time" ? undefined : badge.color}
      sx={{
        fontSize: "0.65rem",
        height: 18,
        fontWeight: 600,
        ...(badge.value === "limited-time" && { bgcolor: "#e91e8a", color: "white" }),
      }}
    />
  );
}

function DietaryIcons({ tags }: { tags: string[] }) {
  const spicyTag = tags.find((t) => t.startsWith("spicy-"));
  const dietaryTags = tags.filter((t) => t in DIETARY_ICON_MAP);
  if (!spicyTag && dietaryTags.length === 0) return null;

  const spicyLevel = spicyTag ? parseInt(spicyTag.split("-")[1], 10) : 0;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
      {spicyLevel > 0 &&
        Array.from({ length: spicyLevel }, (_, i) => (
          <Tooltip key={i} title={`Spicy (level ${spicyLevel})`} arrow>
            <WhatshotIcon sx={{ fontSize: 16, color: "#f44336" }} />
          </Tooltip>
        ))}
      {dietaryTags.map((t) => {
        const { Icon, color, label } = DIETARY_ICON_MAP[t];
        return (
          <Tooltip key={t} title={label} arrow>
            <Icon sx={{ fontSize: 16, color }} />
          </Tooltip>
        );
      })}
    </Box>
  );
}

interface MenuContentProps {
  menu: Menu | undefined;
  categories: Category[];
  items: Record<string, Item[]>;
  loading: boolean;
}

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

function ItemDetailDialog({ item, onClose }: { item: Item | null; onClose: () => void }) {
  if (!item) return null;

  const spicyTag = item.tags.find((t) => t.startsWith("spicy-"));
  const spicyLevel = spicyTag ? parseInt(spicyTag.split("-")[1], 10) : 0;
  const dietaryTags = item.tags.filter((t) => t in DIETARY_ICON_MAP);
  const otherTags = item.tags.filter((t) => !t.startsWith("spicy-") && !(t in DIETARY_ICON_MAP));
  const ingredients = item.ingredients.filter(Boolean);
  const hasDietarySection = spicyLevel > 0 || dietaryTags.length > 0;

  return (
    <Dialog open={!!item} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Close button */}
      <IconButton
        onClick={onClose}
        size="small"
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
          bgcolor: item.imageUrl ? "rgba(0,0,0,0.45)" : "action.hover",
          color: item.imageUrl ? "white" : "text.primary",
          "&:hover": { bgcolor: item.imageUrl ? "rgba(0,0,0,0.65)" : "action.selected" },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      {/* Image */}
      {item.imageUrl && (
        <Box
          component="img"
          src={item.imageUrl}
          alt={item.name}
          sx={{ width: "100%", height: 260, objectFit: "cover", display: "block" }}
        />
      )}

      <DialogContent sx={{ pt: item.imageUrl ? 2 : 4 }}>
        {/* Name + price */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              {item.name}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <StatusBadge tags={item.tags} />
            </Box>
          </Box>
          {item.price > 0 && (
            <Typography variant="h6" sx={{ fontWeight: 700, flexShrink: 0 }}>
              {formatPrice(item.price)}
            </Typography>
          )}
        </Box>

        {/* Description */}
        {item.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            {item.description}
          </Typography>
        )}

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "text.secondary" }}>
              Ingredients
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {ingredients.join(", ")}
            </Typography>
          </Box>
        )}

        {/* Dietary considerations */}
        {hasDietarySection && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "text.secondary" }}>
              Dietary Info
            </Typography>
            <Box sx={{ mt: 0.75, display: "flex", flexDirection: "column", gap: 0.75 }}>
              {spicyLevel > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ display: "flex" }}>
                    {Array.from({ length: spicyLevel }, (_, i) => (
                      <WhatshotIcon key={i} sx={{ fontSize: 16, color: "#f44336" }} />
                    ))}
                  </Box>
                  <Typography variant="body2" >Spicy</Typography>
                </Box>
              )}
              {dietaryTags.map((t) => {
                const { Icon, color, label } = DIETARY_ICON_MAP[t];
                return (
                  <Box key={t} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Icon sx={{ fontSize: 16, color, flexShrink: 0 }} />
                    <Typography variant="body2">{label}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Other tags */}
        {otherTags.length > 0 && (
          <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {otherTags.map((t) => (
              <Chip key={t} label={t} size="small" variant="outlined" />
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ItemRow({ item, isLast, onClick }: { item: Item; isLast: boolean; onClick: () => void }) {
  return (
    <>
      <Box
        onClick={onClick}
        sx={{
          display: "flex",
          gap: 2,
          py: 1.75,
          alignItems: "flex-start",
          opacity: item.tags.includes("sold-out") ? 0.5 : 1,
          filter: item.tags.includes("sold-out") ? "grayscale(0.4)" : "none",
          cursor: "pointer",
          mx: -2,
          px: 2,
          borderRadius: 1,
          "&:hover": { bgcolor: "grey.50" },
        }}
      >
        {/* Text — name, description, dietary icons */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {item.name}
            </Typography>
            <StatusBadge tags={item.tags} />
          </Box>

          {item.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.25,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.description}
            </Typography>
          )}

          <DietaryIcons tags={item.tags ?? []} />
        </Box>

        {/* Right — price + image indicator */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1, flexShrink: 0 }}>
          {item.price > 0 && (
            <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
              {formatPrice(item.price)}
            </Typography>
          )}
          {item.imageUrl && (
            <Tooltip title="View photo" arrow>
              <ImageIcon sx={{ fontSize: 18, color: "#D11D27", opacity: 0.8 }} />
            </Tooltip>
          )}
        </Box>
      </Box>
      {!isLast && <Divider />}
    </>
  );
}

function CategoryHeader({ category }: { category: Category }) {
  return (
    <Box>
      <Box sx={{ px: 2, py: 0.75, bgcolor: "#D11D27", borderRadius: "8px 8px 0 0" }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 800, letterSpacing: 0.5, fontSize: "0.9rem", color: "white" }}
        >
          {category.name}
        </Typography>
      </Box>
      {category.description && (
        <Box sx={{ px: 2, pt: 0.75 }}>
          <Typography variant="body2" color="text.secondary">
            {category.description}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function MenuSkeleton() {
  return (
    <Box>
      {Array.from({ length: 3 }).map((_, ci) => (
        <Box key={ci}>
          <Box sx={{ px: 2, pt: 3, pb: 1 }}>
            <Skeleton width={100} height={16} />
          </Box>
          {Array.from({ length: 3 }).map((_, ii) => (
            <Box key={ii} sx={{ px: 2 }}>
              <Box sx={{ display: "flex", gap: 2, py: 1.75 }}>
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="45%" height={18} />
                  <Skeleton width="80%" height={14} sx={{ mt: 0.5 }} />
                </Box>
                <Skeleton width={40} height={18} />
              </Box>
              {ii < 2 && <Divider />}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

export function MenuContent({ menu, categories, items, loading }: MenuContentProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  if (loading) return <MenuSkeleton />;

  return (
    <Box pb={2}>
      {menu && !isMenuAvailable(menu) && (
        <Alert severity="info" sx={{ mx: 2, mt: 2, borderRadius: 2 }}>
          This menu isn&apos;t available right now
        </Alert>
      )}

      {categories.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 6 }}>
          No items in this menu yet.
        </Typography>
      ) : (
        categories.map((category, catIndex) => {
          const categoryItems = (items[category.id] ?? []).filter((item) => item.isAvailable);
          return (
            <Box key={category.id} sx={catIndex > 0 ? { mt: 2 } : undefined}>
              <CategoryHeader category={category} />
              <Box sx={{ px: 2 }}>
                {categoryItems.map((item, idx) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    isLast={idx === categoryItems.length - 1}
                    onClick={() => setSelectedItem(item)}
                  />
                ))}
              </Box>
            </Box>
          );
        })
      )}

      <ItemDetailDialog item={selectedItem} onClose={() => setSelectedItem(null)} />
    </Box>
  );
}
