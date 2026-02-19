import React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import type { OperatingHours } from "@chooz/shared";
import { DAYS_OF_WEEK } from "@chooz/shared";
import type { RestaurantFormData } from "./RestaurantForm";

export interface ChangeItem {
  label: string;
  type: "text" | "image" | "tags" | "hours" | "visibility";
  before?: string | string[];
  after?: string | string[];
  /** Per-day hour diffs (only for type === "hours") */
  hoursDiff?: HoursDayDiff[];
}

interface HoursDayDiff {
  day: string;
  before: string;
  after: string;
}

interface ImageSnapshot {
  banner: string | null;
  logo: string | null;
}

interface ConfirmChangesDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirming: boolean;
  changes: ChangeItem[];
  error?: string | null;
}

function formatValue(item: ChangeItem, value: string | string[] | undefined, side: "before" | "after"): string {
  if (item.type === "image") {
    return (side === "after" ? item.after : item.before) as string ?? "";
  }

  if (item.type === "visibility") {
    return value === "true" ? "Public" : "Private";
  }

  if (item.type === "hours") {
    return "—";
  }

  if (item.type === "tags") {
    if (!value || (Array.isArray(value) && value.length === 0)) return "(none)";
    return Array.isArray(value) ? value.join(", ") : String(value);
  }

  // text
  if (!value || value === "") return "(empty)";
  return String(value);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatTime(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${suffix}`;
}

function formatDayHours(entry: { open: string; close: string; isClosed: boolean }): string {
  if (entry.isClosed) return "Closed";
  return `${formatTime(entry.open)} – ${formatTime(entry.close)}`;
}

function computeHoursDiff(before: OperatingHours, after: OperatingHours): HoursDayDiff[] {
  const diffs: HoursDayDiff[] = [];
  for (const day of DAYS_OF_WEEK) {
    const b = before[day];
    const a = after[day];
    if (!b || !a) continue;
    if (JSON.stringify(b) !== JSON.stringify(a)) {
      diffs.push({ day: capitalize(day), before: formatDayHours(b), after: formatDayHours(a) });
    }
  }
  return diffs;
}

function TagsDiff({ before, after }: { before: string[]; after: string[] }) {
  const added = after.filter((t) => !before.includes(t));
  const removed = before.filter((t) => !after.includes(t));
  return (
    <>
      {added.map((t) => (
        <Typography key={`+${t}`} variant="body2" component="span" sx={{ color: "success.main", mr: 0.5 }}>
          +{t}
        </Typography>
      ))}
      {removed.map((t) => (
        <Typography key={`-${t}`} variant="body2" component="span" sx={{ color: "error.main", mr: 0.5 }}>
          -{t}
        </Typography>
      ))}
    </>
  );
}

export function computeChanges(
  before: RestaurantFormData,
  after: RestaurantFormData,
  imageBefore: ImageSnapshot,
  imageAfter: ImageSnapshot,
): ChangeItem[] {
  const changes: ChangeItem[] = [];

  if (before.name !== after.name) {
    changes.push({ label: "Name", type: "text", before: before.name, after: after.name });
  }

  if (before.description !== after.description) {
    changes.push({ label: "Description", type: "text", before: before.description, after: after.description });
  }

  if (before.phone !== after.phone) {
    changes.push({ label: "Phone", type: "text", before: before.phone, after: after.phone });
  }

  if (before.address !== after.address) {
    changes.push({ label: "Address", type: "text", before: before.address, after: after.address });
  }

  if (JSON.stringify(before.hours) !== JSON.stringify(after.hours)) {
    changes.push({ label: "Operating Hours", type: "hours", hoursDiff: computeHoursDiff(before.hours, after.hours) });
  }

  const tagsBefore = [...before.tags].sort();
  const tagsAfter = [...after.tags].sort();
  if (JSON.stringify(tagsBefore) !== JSON.stringify(tagsAfter)) {
    changes.push({ label: "Tags", type: "tags", before: before.tags, after: after.tags });
  }

  if (before.isPublished !== after.isPublished) {
    changes.push({
      label: "Visibility",
      type: "visibility",
      before: String(before.isPublished),
      after: String(after.isPublished),
    });
  }

  if (imageBefore.banner !== imageAfter.banner) {
    const desc = imageAfter.banner ? "Banner image updated" : "Banner image removed";
    changes.push({ label: "Banner Image", type: "image", after: desc });
  }

  if (imageBefore.logo !== imageAfter.logo) {
    let desc: string;
    if (!imageBefore.logo && imageAfter.logo) desc = "Logo image added";
    else if (imageBefore.logo && !imageAfter.logo) desc = "Logo image removed";
    else desc = "Logo image updated";
    changes.push({ label: "Logo Image", type: "image", after: desc });
  }

  return changes;
}

export function ConfirmChangesDialog({ open, onClose, onConfirm, confirming, changes, error }: ConfirmChangesDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Review Changes</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please review the following changes before saving.
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Field</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Before</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>After</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {changes.map((item) => (
              <TableRow key={item.label}>
                <TableCell sx={{ fontWeight: 500, whiteSpace: "nowrap" }}>{item.label}</TableCell>
                {item.type === "tags" ? (
                  <>
                    <TableCell>
                      <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                        {Array.isArray(item.before) && item.before.length > 0 ? item.before.join(", ") : "(none)"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                        {Array.isArray(item.after) && item.after.length > 0 ? item.after.join(", ") : "(none)"}
                      </Typography>
                    </TableCell>
                  </>
                ) : item.type === "hours" ? (
                  <TableCell colSpan={2}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "auto auto auto auto",
                        columnGap: 1,
                        alignItems: "baseline",
                        width: "fit-content",
                      }}
                    >
                      {item.hoursDiff?.map((d) => (
                        <React.Fragment key={d.day}>
                          <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                            {d.day}:
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: "nowrap", textAlign: "right" }}>
                            {d.before}
                          </Typography>
                          <Typography variant="body2" sx={{ textAlign: "center" }}>
                            &rarr;
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                            {d.after}
                          </Typography>
                        </React.Fragment>
                      ))}
                    </Box>
                  </TableCell>
                ) : item.type === "image" ? (
                  <TableCell colSpan={2}>
                    <Typography variant="body2" color="text.secondary">
                      {item.after}
                    </Typography>
                  </TableCell>
                ) : (
                  <>
                    <TableCell>
                      <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                        {formatValue(item, item.before, "before")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                        {formatValue(item, item.after, "after")}
                      </Typography>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      {error && (
        <DialogContent sx={{ pt: 0, pb: 0 }}>
          <Alert severity="error">{error}</Alert>
        </DialogContent>
      )}
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={confirming} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={confirming}
          startIcon={confirming ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{ textTransform: "none" }}
        >
          {confirming ? "Saving..." : "Confirm & Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
