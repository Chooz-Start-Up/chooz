"use client";

import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Item } from "@chooz/shared";

type ItemFormData = Omit<Item, "id" | "createdAt" | "updatedAt" | "sortOrder">;

interface ItemEditDialogProps {
  open: boolean;
  item: Item | null; // null = create mode
  onClose: () => void;
  onSave: (data: ItemFormData) => Promise<void>;
}

const emptyForm: ItemFormData = {
  name: "",
  description: "",
  price: 0,
  ingredients: [],
  tags: [],
  imageUrl: null,
  isAvailable: true,
};

export function ItemEditDialog({ open, item, onClose, onSave }: ItemEditDialogProps) {
  const [form, setForm] = useState<ItemFormData>(emptyForm);
  const [priceText, setPriceText] = useState("0.00");
  const [saving, setSaving] = useState(false);
  const [chipInput, setChipInput] = useState({ ingredients: "", tags: "" });
  const nameRef = useRef<HTMLInputElement>(null);

  const isCreate = !item;

  useEffect(() => {
    if (open) {
      if (item) {
        setForm({
          name: item.name,
          description: item.description,
          price: item.price,
          ingredients: [...item.ingredients],
          tags: [...item.tags],
          imageUrl: item.imageUrl,
          isAvailable: item.isAvailable,
        });
        setPriceText(item.price.toFixed(2));
      } else {
        setForm(emptyForm);
        setPriceText("0.00");
      }
      setChipInput({ ingredients: "", tags: "" });
    }
  }, [open, item]);

  const doSave = async (keepOpen: boolean) => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSave({ ...form, name: form.name.trim() });
      if (keepOpen) {
        // Reset form for next item
        setForm(emptyForm);
        setPriceText("0.00");
        setChipInput({ ingredients: "", tags: "" });
        // Re-focus name field
        setTimeout(() => nameRef.current?.focus(), 50);
      } else {
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePriceChange = (value: string) => {
    setPriceText(value);
    const parsed = parseFloat(value);
    setForm((f) => ({ ...f, price: isNaN(parsed) ? 0 : Math.max(0, Math.round(parsed * 100) / 100) }));
  };

  const handlePriceBlur = () => {
    setPriceText(form.price.toFixed(2));
  };

  const addChip = (field: "ingredients" | "tags") => {
    const val = chipInput[field].trim();
    if (!val || form[field].includes(val)) return;
    setForm((f) => ({ ...f, [field]: [...f[field], val] }));
    setChipInput((c) => ({ ...c, [field]: "" }));
  };

  const removeChip = (field: "ingredients" | "tags", idx: number) => {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{item ? "Edit Item" : "New Item"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
        <TextField
          inputRef={nameRef}
          label="Name"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          size="small"
          autoFocus
        />

        <TextField
          label="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          size="small"
          multiline
          rows={2}
        />

        <TextField
          label="Price"
          type="number"
          value={priceText}
          onChange={(e) => handlePriceChange(e.target.value)}
          onBlur={handlePriceBlur}
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            inputProps: { min: 0, step: 0.01 },
          }}
        />

        {/* Ingredients chip array */}
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Ingredients
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
            {form.ingredients.map((ing, i) => (
              <Chip key={i} label={ing} size="small" onDelete={() => removeChip("ingredients", i)} />
            ))}
          </Box>
          <TextField
            size="small"
            placeholder="Type and press Enter"
            value={chipInput.ingredients}
            onChange={(e) => setChipInput((c) => ({ ...c, ingredients: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addChip("ingredients");
              }
            }}
            fullWidth
          />
        </Box>

        {/* Tags chip array */}
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Tags
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
            {form.tags.map((tag, i) => (
              <Chip key={i} label={tag} size="small" onDelete={() => removeChip("tags", i)} />
            ))}
          </Box>
          <TextField
            size="small"
            placeholder="Type and press Enter"
            value={chipInput.tags}
            onChange={(e) => setChipInput((c) => ({ ...c, tags: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addChip("tags");
              }
            }}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        {isCreate && (
          <Button
            onClick={() => doSave(true)}
            variant="outlined"
            disabled={saving || !form.name.trim()}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Save & Add Another"}
          </Button>
        )}
        <Button
          onClick={() => doSave(false)}
          variant="contained"
          disabled={saving || !form.name.trim()}
        >
          {saving ? <CircularProgress size={20} color="inherit" /> : item ? "Save" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
