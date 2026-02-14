"use client";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { OperatingHours } from "@chooz/shared";
import { DAYS_OF_WEEK } from "@chooz/shared";

interface OperatingHoursInputProps {
  value: OperatingHours;
  onChange: (hours: OperatingHours) => void;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function OperatingHoursInput({ value, onChange }: OperatingHoursInputProps) {
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
          </Box>
        );
      })}
    </Box>
  );
}
