"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Slide from "@mui/material/Slide";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { OperatingHours, Restaurant } from "@chooz/shared";
import { DEFAULT_OPERATING_HOURS } from "@chooz/shared";
import { OperatingHoursInput } from "./OperatingHoursInput";
import { TagsSelect } from "./TagsSelect";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
] as const;

const ZIP_REGEX = /^\d{5}(-\d{4})?$/;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function formatPhone(digits: string): string {
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

export interface RestaurantFormData {
  name: string;
  description: string;
  phone: string;
  address: string;
  hours: OperatingHours;
  tags: string[];
  isPublished: boolean;
}

interface RestaurantFormProps {
  initialData?: Restaurant | null;
  onSubmit: (data: RestaurantFormData) => Promise<void>;
  submitLabel: string;
  submitting: boolean;
  draftKey?: string;
}

interface DraftFields {
  name: string;
  description: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  hours: OperatingHours;
  tags: string[];
  isPublished: boolean;
}

function parseAddress(address: string): { street: string; city: string; state: string; zip: string } {
  const lines = address.split("\n");
  const street = lines[0] ?? "";
  if (lines.length < 2) return { street, city: "", state: "", zip: "" };

  const match = lines[1].match(/^(.+),\s*(\w{2})\s+(.+)$/);
  if (match) {
    return { street, city: match[1], state: match[2], zip: match[3] };
  }
  return { street, city: lines[1], state: "", zip: "" };
}

function buildAddress(street: string, city: string, state: string, zip: string): string {
  return `${street}\n${city}, ${state} ${zip}`;
}

function fieldsFromRestaurant(data: Restaurant | null | undefined): DraftFields {
  const parsed = data ? parseAddress(data.address) : null;
  return {
    name: data?.name ?? "",
    description: data?.description ?? "",
    phone: formatPhone(digitsOnly(data?.phone ?? "")),
    street: parsed?.street ?? "",
    city: parsed?.city ?? "",
    state: parsed?.state ?? "",
    zip: parsed?.zip ?? "",
    hours: data?.hours ?? DEFAULT_OPERATING_HOURS,
    tags: data?.tags ?? [],
    isPublished: data?.isPublished ?? false,
  };
}

function loadDraft(key: string): DraftFields | null {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    return JSON.parse(saved) as DraftFields;
  } catch {
    return null;
  }
}

function serializeFields(f: DraftFields): string {
  return JSON.stringify(f);
}

export function RestaurantForm({ initialData, onSubmit, submitLabel, submitting, draftKey }: RestaurantFormProps) {
  const [restoredFromDraft, setRestoredFromDraft] = useState(false);

  const [init] = useState<DraftFields>(() => {
    if (draftKey) {
      const draft = loadDraft(draftKey);
      if (draft) return draft;
    }
    return fieldsFromRestaurant(initialData);
  });

  const [showDraftBanner] = useState(() => {
    if (!draftKey) return false;
    return loadDraft(draftKey) !== null;
  });

  const [name, setName] = useState(init.name);
  const [description, setDescription] = useState(init.description);
  const [phone, setPhone] = useState(init.phone);
  const [street, setStreet] = useState(init.street);
  const [city, setCity] = useState(init.city);
  const [state, setState] = useState(init.state);
  const [zip, setZip] = useState(init.zip);
  const [hours, setHours] = useState<OperatingHours>(init.hours);
  const [tags, setTags] = useState<string[]>(init.tags);
  const [isPublished, setIsPublished] = useState(init.isPublished);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  // Track the "clean" snapshot — what was last saved (or initial on mount)
  const cleanSnapshot = useRef(serializeFields(fieldsFromRestaurant(initialData)));

  const currentFields: DraftFields = { name, description, phone, street, city, state, zip, hours, tags, isPublished };
  const isDirty = serializeFields(currentFields) !== cleanSnapshot.current;

  // Browser beforeunload warning
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    if (showDraftBanner) setRestoredFromDraft(true);
  }, [showDraftBanner]);

  const isFirstRender = useRef(!showDraftBanner);
  useEffect(() => {
    if (!draftKey) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const draft: DraftFields = { name, description, phone, street, city, state, zip, hours, tags, isPublished };
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [draftKey, name, description, phone, street, city, state, zip, hours, tags, isPublished]);

  const resetToClean = useCallback(() => {
    if (draftKey) localStorage.removeItem(draftKey);
    const defaults = fieldsFromRestaurant(initialData);
    setName(defaults.name);
    setDescription(defaults.description);
    setPhone(defaults.phone);
    setStreet(defaults.street);
    setCity(defaults.city);
    setState(defaults.state);
    setZip(defaults.zip);
    setHours(defaults.hours);
    setTags(defaults.tags);
    setIsPublished(defaults.isPublished);
    setRestoredFromDraft(false);
  }, [draftKey, initialData]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Restaurant name is required";
    if (!description.trim()) next.description = "Description is required";
    const phoneDigits = digitsOnly(phone);
    if (!phoneDigits) {
      next.phone = "Phone number is required";
    } else if (phoneDigits.length !== 10) {
      next.phone = "Enter a valid 10-digit phone number";
    }
    if (zip.trim() && !ZIP_REGEX.test(zip.trim())) {
      next.zip = "Enter a valid ZIP code (e.g. 12345)";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        phone: phone.trim(),
        address: buildAddress(street.trim(), city.trim(), state, zip.trim()),
        hours,
        tags,
        isPublished,
      });
      // Update clean snapshot so form is no longer dirty
      cleanSnapshot.current = serializeFields(currentFields);
      if (draftKey) localStorage.removeItem(draftKey);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <Box component="form" ref={formRef} onSubmit={handleSubmit} sx={{ maxWidth: 720, pb: 10 }}>
        {restoredFromDraft && (
          <Alert
            severity="info"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={resetToClean}>
                Discard
              </Button>
            }
            onClose={() => setRestoredFromDraft(false)}
          >
            Draft restored from your last session.
          </Alert>
        )}
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}

        {/* Basic Info */}
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Basic Info
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your restaurant name and description are visible to customers.
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <TextField
            required
            fullWidth
            label="Restaurant Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ mb: 2.5 }}
          />
          <TextField
            required
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            sx={{ mb: 2.5 }}
          />
          <TextField
            required
            fullWidth
            label="Phone Number"
            value={phone}
            onChange={(e) => {
              const digits = digitsOnly(e.target.value).slice(0, 10);
              setPhone(formatPhone(digits));
            }}
            error={!!errors.phone}
            helperText={errors.phone}
            placeholder="(555) 123-4567"
            inputMode="tel"
          />
        </Paper>

        {/* Address */}
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Address
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Where customers can find your restaurant.
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <TextField
            fullWidth
            label="Street Address"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            error={!!errors.street}
            helperText={errors.street}
            sx={{ mb: 2.5 }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              error={!!errors.city}
              helperText={errors.city}
              sx={{ flex: 2 }}
            />
            <TextField
              select
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              error={!!errors.state}
              helperText={errors.state}
              sx={{ flex: 1 }}
            >
              {US_STATES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="ZIP Code"
              value={zip}
              onChange={(e) => {
                const filtered = e.target.value.replace(/[^\d-]/g, "").slice(0, 10);
                setZip(filtered);
              }}
              error={!!errors.zip}
              helperText={errors.zip}
              inputMode="numeric"
              sx={{ flex: 1 }}
            />
          </Box>
        </Paper>

        {/* Operating Hours */}
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <OperatingHoursInput value={hours} onChange={setHours} />
        </Paper>

        {/* Tags */}
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Tags
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Help customers discover your restaurant by cuisine type and dietary options.
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <TagsSelect value={tags} onChange={setTags} />
        </Paper>

        {/* Visibility */}
        {initialData && (
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Visibility
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Control whether customers can see your restaurant.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={isPublished}
                  onChange={() => setPublishDialogOpen(true)}
                />
              }
              label={isPublished ? "Public" : "Private"}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {isPublished
                ? "Your restaurant is public and visible to customers. They can browse your menu and find you in search results."
                : "Your restaurant is private and hidden from customers. Use this while you're still setting up your menu or making changes you don't want visible yet."}
            </Typography>
          </Paper>
        )}

        {/* Publish confirmation dialog */}
        <Dialog open={publishDialogOpen} onClose={() => setPublishDialogOpen(false)}>
          <DialogTitle>
            {isPublished ? "Make restaurant private?" : "Make restaurant public?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {isPublished
                ? "Your restaurant will become private and hidden from customers. They will no longer be able to find you in search results or browse your menu. You can make it public again at any time."
                : "Your restaurant will become public and visible to all customers. They will be able to find you in search results and browse your menu. Make sure your information and menu are up to date."}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPublishDialogOpen(false)} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setIsPublished(!isPublished);
                setPublishDialogOpen(false);
              }}
              sx={{ textTransform: "none" }}
            >
              {isPublished ? "Make Private" : "Make Public"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Sticky save bar (slides in when form is dirty) */}
      <Slide direction="up" in={isDirty} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              maxWidth: 720,
              mx: "auto",
              px: 3,
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Unsaved changes
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={resetToClean}
                disabled={submitting}
                sx={{ textTransform: "none" }}
              >
                Discard
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleSubmit()}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
                sx={{ textTransform: "none" }}
              >
                {submitting ? "Saving..." : submitLabel}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Slide>
    </>
  );
}
