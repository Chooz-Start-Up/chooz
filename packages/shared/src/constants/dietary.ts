export const DIETARY_ATTRIBUTES = [
  { value: "vegan", label: "Vegan", icon: "Spa", color: "#4caf50" },
  { value: "vegetarian", label: "Vegetarian", icon: "Grass", color: "#8bc34a" },
  { value: "spicy", label: "Spicy", icon: "Whatshot", color: "#f44336" },
  { value: "gluten-free", label: "Gluten-Free", icon: "Grain", color: "#ff9800" },
  { value: "contains-peanuts", label: "Contains Peanuts", icon: "WarningAmber", color: "#e65100" },
  { value: "dairy-free", label: "Dairy-Free", icon: "WaterDrop", color: "#29b6f6" },
] as const;

export const SPICE_LEVELS = [1, 2, 3] as const;
