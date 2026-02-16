"use client";

import { useState, useEffect, useRef } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MuiMenuItem from "@mui/material/MenuItem";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import GrassIcon from "@mui/icons-material/Grass";
import GrainIcon from "@mui/icons-material/Grain";
import ImageIcon from "@mui/icons-material/Image";
import SpaIcon from "@mui/icons-material/Spa";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { storageService } from "@chooz/services";
import type { Item } from "@chooz/shared";
import { DIETARY_ATTRIBUTES, SPICE_LEVELS } from "@chooz/shared";

const DIETARY_ICON_MAP: Record<string, React.ElementType> = {
  Spa: SpaIcon,
  Grass: GrassIcon,
  Whatshot: WhatshotIcon,
  Grain: GrainIcon,
  WarningAmber: WarningAmberIcon,
  WaterDrop: WaterDropIcon,
};

type ItemFormData = Omit<Item, "id" | "createdAt" | "updatedAt" | "sortOrder">;

interface ItemEditDialogProps {
  open: boolean;
  restaurantId: string;
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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export function ItemEditDialog({ open, restaurantId, item, onClose, onSave }: ItemEditDialogProps) {
  const [form, setForm] = useState<ItemFormData>(emptyForm);
  const [priceText, setPriceText] = useState("0.00");
  const [saving, setSaving] = useState(false);
  const [chipInput, setChipInput] = useState({ ingredients: "", tags: "" });
  const nameRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [deleteImageConfirm, setDeleteImageConfirm] = useState(false);

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
      setImageError(null);
      setDeleteImageConfirm(false);
    }
  }, [open, item]);

  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("Image must be under 5 MB.");
      return;
    }

    setImageError(null);
    setImageLoading(true);
    try {
      // Delete old image if replacing
      if (form.imageUrl) {
        try {
          await storageService.deleteImageByUrl(form.imageUrl);
        } catch {
          // Best-effort cleanup
        }
      }
      const imageId = crypto.randomUUID();
      const url = await storageService.uploadItemImage(restaurantId, imageId, file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch {
      setImageError("Failed to upload image. Please try again.");
    } finally {
      setImageLoading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImageRemove = async () => {
    if (!form.imageUrl) return;
    setImageLoading(true);
    setImageError(null);
    try {
      await storageService.deleteImageByUrl(form.imageUrl);
    } catch {
      // Best-effort cleanup
    }
    setForm((f) => ({ ...f, imageUrl: null }));
    setImageLoading(false);
  };

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
        setImageError(null);
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
    <Dialog open={open} onClose={saving || imageLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{item ? "Edit Item" : "New Item"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
        {/* Image upload */}
        <Box>
          {imageError && (
            <Alert severity="error" onClose={() => setImageError(null)} sx={{ mb: 1 }}>
              {imageError}
            </Alert>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageSelect(file);
            }}
          />

          {form.imageUrl ? (
            <Box sx={{ position: "relative", width: "100%", height: 200 }}>
              <Box
                component="img"
                src={form.imageUrl}
                alt="Item image"
                sx={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
              {imageLoading && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(0,0,0,0.4)",
                    borderRadius: 1,
                  }}
                >
                  <CircularProgress size={28} sx={{ color: "white" }} />
                </Box>
              )}
              {!imageLoading && (
                <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    title="Replace image"
                    sx={{ bgcolor: "rgba(255,255,255,0.85)", "&:hover": { bgcolor: "white" } }}
                  >
                    <ImageIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setDeleteImageConfirm(true)}
                    title="Remove image"
                    sx={{ bgcolor: "rgba(255,255,255,0.85)", "&:hover": { bgcolor: "white" } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          ) : (
            <Box
              onClick={() => !imageLoading && fileInputRef.current?.click()}
              sx={{
                width: "100%",
                height: 120,
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: imageLoading ? "default" : "pointer",
                "&:hover": imageLoading ? {} : { borderColor: "primary.main", bgcolor: "action.hover" },
              }}
            >
              {imageLoading ? (
                <CircularProgress size={28} />
              ) : (
                <>
                  <CameraAltIcon color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Add photo
                  </Typography>
                </>
              )}
            </Box>
          )}
        </Box>

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

        {/* Dietary attributes */}
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Dietary
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {DIETARY_ATTRIBUTES.map((attr) => {
              const IconComp = DIETARY_ICON_MAP[attr.icon];
              if (attr.value === "spicy") {
                const spicyTag = form.tags.find((t) => t.startsWith("spicy-"));
                const isChecked = !!spicyTag;
                const currentLevel = spicyTag ? parseInt(spicyTag.split("-")[1], 10) : 1;
                return (
                  <Box key={attr.value} sx={{ display: "flex", alignItems: "center" }}>
                    <FormControlLabel
                      control={<Checkbox size="small" checked={isChecked} onChange={(e) => {
                        setForm((f) => {
                          const tags = f.tags.filter((t) => !t.startsWith("spicy-"));
                          if (e.target.checked) tags.push("spicy-1");
                          return { ...f, tags };
                        });
                      }} />}
                      label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <IconComp sx={{ fontSize: 16, color: attr.color }} />
                          <span>{attr.label}</span>
                        </Box>
                      }
                      sx={{ mr: 0 }}
                    />
                    {isChecked && (
                      <FormControl size="small" sx={{ ml: 0.5, minWidth: 56 }}>
                        <Select
                          value={currentLevel}
                          onChange={(e) => {
                            const level = e.target.value as number;
                            setForm((f) => ({
                              ...f,
                              tags: [...f.tags.filter((t) => !t.startsWith("spicy-")), `spicy-${level}`],
                            }));
                          }}
                          sx={{ height: 28, fontSize: "0.8rem" }}
                        >
                          {SPICE_LEVELS.map((lvl) => (
                            <MuiMenuItem key={lvl} value={lvl}>
                              {"🌶️".repeat(lvl)}
                            </MuiMenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                );
              }

              const isChecked = form.tags.includes(attr.value);
              return (
                <FormControlLabel
                  key={attr.value}
                  control={<Checkbox size="small" checked={isChecked} onChange={(e) => {
                    setForm((f) => ({
                      ...f,
                      tags: e.target.checked
                        ? [...f.tags, attr.value]
                        : f.tags.filter((t) => t !== attr.value),
                    }));
                  }} />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <IconComp sx={{ fontSize: 16, color: attr.color }} />
                      <span>{attr.label}</span>
                    </Box>
                  }
                  sx={{ mr: 0 }}
                />
              );
            })}
          </Box>
        </Box>

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
            placeholder="Chicken, garlic, olive oil..."
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
            placeholder="Spicy, gluten-free, vegan..."
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
        <Button onClick={onClose} disabled={saving || imageLoading}>
          Cancel
        </Button>
        {isCreate && (
          <Button
            onClick={() => doSave(true)}
            variant="outlined"
            disabled={saving || imageLoading || !form.name.trim()}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Save & Add Another"}
          </Button>
        )}
        <Button
          onClick={() => doSave(false)}
          variant="contained"
          disabled={saving || imageLoading || !form.name.trim()}
        >
          {saving ? <CircularProgress size={20} color="inherit" /> : item ? "Save" : "Create"}
        </Button>
      </DialogActions>

      {/* Delete image confirmation */}
      <Dialog open={deleteImageConfirm} onClose={() => setDeleteImageConfirm(false)} maxWidth="xs">
        <DialogTitle>Remove Image</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to remove this image?
          </Typography>
          {form.imageUrl && (
            <Box
              component="img"
              src={form.imageUrl}
              alt="Image to remove"
              sx={{
                width: "100%",
                maxHeight: 200,
                objectFit: "cover",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteImageConfirm(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              setDeleteImageConfirm(false);
              await handleImageRemove();
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
