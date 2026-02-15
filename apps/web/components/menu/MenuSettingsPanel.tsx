"use client";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { DAYS_OF_WEEK } from "@chooz/shared";
import type { Menu } from "@chooz/shared";

interface MenuSettingsPanelProps {
  menu: Menu;
  onUpdate: (data: Partial<Menu>) => Promise<void>;
}

const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export function MenuSettingsPanel({ menu, onUpdate }: MenuSettingsPanelProps) {
  const isEveryDay = menu.availableDays === null;
  const selectedDays = isEveryDay ? [...DAYS_OF_WEEK] : menu.availableDays ?? [];
  const isAllDay = !menu.availableFrom && !menu.availableTo;

  const handleDayToggle = (day: string) => {
    // If currently "every day" (null), switching to explicit selection minus this day
    const current = isEveryDay ? [...DAYS_OF_WEEK] : [...selectedDays];
    let next: string[] | null;
    if (current.includes(day)) {
      const filtered = current.filter((d) => d !== day);
      next = filtered.length === 0 ? null : filtered;
    } else {
      const added = [...current, day];
      // If all days are selected, store as null (every day)
      next = added.length === DAYS_OF_WEEK.length ? null : added;
    }
    onUpdate({ availableDays: next });
  };

  const handleAllDayToggle = (checked: boolean) => {
    if (checked) {
      onUpdate({ availableFrom: null, availableTo: null });
    } else {
      onUpdate({ availableFrom: "09:00", availableTo: "17:00" });
    }
  };

  return (
    <Paper sx={{ p: 2, minWidth: 320 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
        Menu Settings
      </Typography>

      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={menu.isActive}
              onChange={(_, checked) => onUpdate({ isActive: checked })}
            />
          }
          label="Visible on Menu"
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={isAllDay}
              onChange={(_, checked) => handleAllDayToggle(checked)}
            />
          }
          label="All Day"
        />
        <TextField
          label="Available from"
          type="time"
          size="small"
          value={menu.availableFrom ?? ""}
          onChange={(e) => onUpdate({ availableFrom: e.target.value || null })}
          InputLabelProps={{ shrink: true }}
          disabled={isAllDay}
          sx={{ width: 160 }}
        />
        <TextField
          label="Available to"
          type="time"
          size="small"
          value={menu.availableTo ?? ""}
          onChange={(e) => onUpdate({ availableTo: e.target.value || null })}
          InputLabelProps={{ shrink: true }}
          disabled={isAllDay}
          sx={{ width: 160 }}
        />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Available days {selectedDays.length === 0 && "(every day)"}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {DAYS_OF_WEEK.map((day) => (
          <Chip
            key={day}
            label={DAY_LABELS[day] ?? day}
            size="small"
            color={selectedDays.includes(day) ? "primary" : "default"}
            variant={selectedDays.includes(day) ? "filled" : "outlined"}
            onClick={() => handleDayToggle(day)}
          />
        ))}
      </Box>
    </Paper>
  );
}
