"use client";

import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";
import type { Restaurant } from "@chooz/shared";
import { TagsSelect } from "@/components/restaurant/TagsSelect";

interface RestaurantEditDialogProps {
  restaurant: Restaurant | null;
  open: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    data: Partial<Omit<Restaurant, "id" | "createdAt">>,
  ) => Promise<void>;
}

export function RestaurantEditDialog({
  restaurant,
  open,
  onClose,
  onSave,
}: RestaurantEditDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name);
      setDescription(restaurant.description);
      setTags(restaurant.tags);
      setIsPublished(restaurant.isPublished);
    }
  }, [restaurant]);

  const handleSave = async () => {
    if (!restaurant) return;
    setSaving(true);
    try {
      await onSave(restaurant.id, { name, description, tags, isPublished });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Restaurant</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
          <TagsSelect value={tags} onChange={setTags} />
          <FormControlLabel
            control={
              <Switch
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
            }
            label="Published"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !name.trim()}
          startIcon={saving ? <CircularProgress size={20} /> : undefined}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
