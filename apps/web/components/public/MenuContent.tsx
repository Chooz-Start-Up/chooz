"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import type { Category, Item, Menu } from "@chooz/shared";
import { isMenuAvailable } from "./menuUtils";

interface MenuContentProps {
  menu: Menu | undefined;
  categories: Category[];
  items: Record<string, Item[]>;
  loading: boolean;
}

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

function ItemRow({ item }: { item: Item }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        py: 1.5,
        opacity: item.isAvailable ? 1 : 0.5,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {item.name}
          </Typography>
          {!item.isAvailable && (
            <Chip label="Unavailable" size="small" sx={{ fontSize: "0.65rem", height: 18 }} />
          )}
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
      </Box>
      {item.price > 0 && (
        <Typography variant="body1" sx={{ fontWeight: 600, flexShrink: 0 }}>
          {formatPrice(item.price)}
        </Typography>
      )}
    </Box>
  );
}

function MenuSkeleton() {
  return (
    <Box sx={{ px: 2 }}>
      {Array.from({ length: 3 }).map((_, ci) => (
        <Box key={ci} sx={{ mt: 3 }}>
          <Skeleton width={120} height={20} />
          <Divider sx={{ my: 1 }} />
          {Array.from({ length: 3 }).map((_, ii) => (
            <Box key={ii} sx={{ display: "flex", justifyContent: "space-between", py: 1.5 }}>
              <Box sx={{ flex: 1 }}>
                <Skeleton width="40%" height={18} />
                <Skeleton width="75%" height={14} sx={{ mt: 0.5 }} />
              </Box>
              <Skeleton width={40} height={18} sx={{ ml: 2 }} />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

export function MenuContent({ menu, categories, items, loading }: MenuContentProps) {
  if (loading) return <MenuSkeleton />;

  return (
    <Box>
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
        categories.map((category) => (
          <Box key={category.id} sx={{ px: 2, mt: 3 }}>
            <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1 }}>
              {category.name}
            </Typography>
            {category.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {category.description}
              </Typography>
            )}
            <Divider sx={{ mt: 0.5 }} />
            {(items[category.id] ?? []).map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </Box>
        ))
      )}
    </Box>
  );
}
