"use client";

import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { CUISINE_TAGS, DIETARY_TAGS } from "@chooz/shared";

interface TagsSelectProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

interface TagOption {
  label: string;
  group: string;
}

const TAG_OPTIONS: TagOption[] = [
  ...CUISINE_TAGS.map((tag) => ({ label: tag, group: "Cuisine" })),
  ...DIETARY_TAGS.map((tag) => ({ label: tag, group: "Dietary" })),
];

export function TagsSelect({ value, onChange }: TagsSelectProps) {
  const selectedOptions = TAG_OPTIONS.filter((opt) => value.includes(opt.label));

  return (
    <Autocomplete
      multiple
      options={TAG_OPTIONS}
      value={selectedOptions}
      onChange={(_, newValue) => onChange(newValue.map((v) => v.label))}
      getOptionLabel={(option) => option.label}
      groupBy={(option) => option.group}
      isOptionEqualToValue={(option, val) => option.label === val.label}
      filterSelectedOptions
      renderTags={(tagValues, getTagProps) =>
        tagValues.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.label}
            label={option.label}
            size="small"
          />
        ))
      }
      renderInput={(params) => (
        <TextField {...params} label="Tags" placeholder="Add tags..." />
      )}
    />
  );
}
