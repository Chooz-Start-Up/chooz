import type { Menu } from "@chooz/shared";

export function isMenuAvailable(menu: Menu): boolean {
  if (!menu.isActive) return false;
  const now = new Date();
  const day = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][now.getDay()];
  if (menu.availableDays && !menu.availableDays.includes(day)) return false;
  if (menu.availableFrom || menu.availableTo) {
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    if (menu.availableFrom && hhmm < menu.availableFrom) return false;
    if (menu.availableTo && hhmm >= menu.availableTo) return false;
  }
  return true;
}
