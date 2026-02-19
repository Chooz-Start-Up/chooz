"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import MoreVert from "@mui/icons-material/MoreVert";
import type { OperatingHours } from "@chooz/shared";
import { DAYS_OF_WEEK } from "@chooz/shared";

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const WEEKENDS = ["saturday", "sunday"];

interface OperatingHoursInputProps {
  value: OperatingHours;
  onChange: (hours: OperatingHours) => void;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function OperatingHoursInput({ value, onChange }: OperatingHoursInputProps) {
  const [menuAnchor, setMenuAnchor] = useState<{ day: string; anchorEl: HTMLElement } | null>(null);

  const applyHours = (sourceDay: string, targetDays: string[]) => {
    const source = value[sourceDay] ?? { open: "09:00", close: "22:00", isClosed: true };
    const updated = { ...value };
    for (const day of targetDays) {
      updated[day] = { ...source };
    }
    onChange(updated);
    setMenuAnchor(null);
  };

  const handleTimeChange = (day: string, field: "open" | "close", time: string) => {
    onChange({
      ...value,
      [day]: { ...value[day], [field]: time },
    });
  };

  const handleClosedChange = (day: string, isClosed: boolean) => {
    onChange({
      ...value,
      [day]: { ...value[day], isClosed },
    });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Operating Hours
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Set the hours your restaurant is open each day.
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {DAYS_OF_WEEK.map((day, i) => {
        const dayHours = value[day] ?? { open: "09:00", close: "22:00", isClosed: true };
        const closeBeforeOpen =
          !dayHours.isClosed && !!dayHours.open && !!dayHours.close && dayHours.close <= dayHours.open;

        return (
          <Box
            key={day}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              py: 1,
              borderBottom: i < DAYS_OF_WEEK.length - 1 ? "1px solid" : "none",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="body2"
              sx={{ width: 90, flexShrink: 0, fontWeight: 500 }}
            >
              {capitalize(day)}
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={dayHours.isClosed}
                  onChange={(e) => handleClosedChange(day, e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="body2">Closed</Typography>}
              sx={{ width: 100, flexShrink: 0 }}
            />
            <TextField
              type="time"
              size="small"
              label="Open"
              value={dayHours.open}
              onChange={(e) => handleTimeChange(day, "open", e.target.value)}
              disabled={dayHours.isClosed}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 150 }}
            />
            <TextField
              type="time"
              size="small"
              label="Close"
              value={dayHours.close}
              onChange={(e) => handleTimeChange(day, "close", e.target.value)}
              disabled={dayHours.isClosed}
              error={closeBeforeOpen}
              helperText={closeBeforeOpen ? "Must be after open" : undefined}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 150 }}
            />
            <Tooltip title="Copy hours to...">
              <IconButton
                size="small"
                sx={{ ml: "auto" }}
                onClick={(e) => setMenuAnchor({ day, anchorEl: e.currentTarget })}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      })}
      <Menu
        anchorEl={menuAnchor?.anchorEl}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => menuAnchor && applyHours(menuAnchor.day, [...DAYS_OF_WEEK])}>
          <ListItemText>Apply to all days</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => menuAnchor && applyHours(menuAnchor.day, WEEKDAYS)}>
          <ListItemText>Apply to weekdays (Mon–Fri)</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => menuAnchor && applyHours(menuAnchor.day, WEEKENDS)}>
          <ListItemText>Apply to weekends (Sat–Sun)</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
