"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PhoneIcon from "@mui/icons-material/Phone";
import PlaceIcon from "@mui/icons-material/Place";
import type { Restaurant } from "@chooz/shared";

const DAYS_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour}${period}` : `${hour}:${String(m).padStart(2, "0")}${period}`;
}

function getTodayKey(): string {
  return ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][new Date().getDay()];
}

function getTomorrowKey(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][tomorrow.getDay()];
}

type StatusColor = "success.main" | "warning.main" | "error.main";

function getHoursStatus(
  hours: Restaurant["hours"],
  todayKey: string,
): { primary: string; secondary: string | null; color: StatusColor } | null {
  const entry = hours?.[todayKey];
  if (!entry) return null;

  if (entry.isClosed) {
    const tomorrowKey = getTomorrowKey();
    const tomorrowEntry = hours?.[tomorrowKey];
    const secondary = tomorrowEntry && !tomorrowEntry.isClosed
      ? `Opens tomorrow at ${formatTime(tomorrowEntry.open)}`
      : null;
    return { primary: "Closed today", secondary, color: "error.main" };
  }

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = entry.open.split(":").map(Number);
  const [closeH, closeM] = entry.close.split(":").map(Number);
  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;

  if (nowMins < openMins) {
    const diff = openMins - nowMins;
    if (diff <= 60) return { primary: "Opens soon", secondary: `at ${formatTime(entry.open)}`, color: "warning.main" };
    return { primary: "Closed", secondary: `Opens at ${formatTime(entry.open)}`, color: "error.main" };
  }

  if (nowMins >= closeMins) {
    const tomorrowKey = getTomorrowKey();
    const tomorrowEntry = hours?.[tomorrowKey];
    const secondary = tomorrowEntry && !tomorrowEntry.isClosed
      ? `Opens tomorrow at ${formatTime(tomorrowEntry.open)}`
      : null;
    return { primary: "Closed", secondary, color: "error.main" };
  }

  const minsToClose = closeMins - nowMins;
  if (minsToClose <= 30) {
    return { primary: "Closes soon", secondary: `at ${formatTime(entry.close)}`, color: "warning.main" };
  }

  return { primary: "Open", secondary: `Closes at ${formatTime(entry.close)}`, color: "success.main" };
}

interface HoursRowProps {
  day: string;
  isToday?: boolean;
}

function HoursRow({ day, restaurant, isToday }: HoursRowProps & { restaurant: Restaurant }) {
  const entry = restaurant.hours?.[day];
  if (!entry) return null;
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        py: 0.25,
        fontWeight: isToday ? 600 : 400,
        color: isToday ? "text.primary" : "text.secondary",
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: "inherit", color: "inherit", minWidth: 36 }}>
        {DAY_LABELS[day]}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: "inherit", color: "inherit" }}>
        {entry.isClosed ? "Closed" : `${formatTime(entry.open)} – ${formatTime(entry.close)}`}
      </Typography>
    </Box>
  );
}

interface RestaurantHeroProps {
  restaurant: Restaurant;
}

export function RestaurantHero({ restaurant }: RestaurantHeroProps) {
  const todayKey = getTodayKey();

  // Logo is 96px, centered horizontally, centered on the separator line (half above, half below)
  const LOGO_SIZE = 96;
  const LOGO_HALF = LOGO_SIZE / 2;

  return (
    <Box sx={{ position: "relative" }}>

      {/* Banner */}
      <Box
        sx={{
          height: { xs: 220, md: 320 },
          position: "relative",
          overflow: "hidden",
          bgcolor: "grey.200",
          backgroundImage: restaurant.bannerImageUrl ? `url(${restaurant.bannerImageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "0 0 50% 50% / 0 0 100px 100px",
        }}
      >
        {!restaurant.bannerImageUrl && (
          <Box
            component="img"
            src="/logo.png"
            alt=""
            sx={{ width: 88, height: 88, opacity: 0.3, position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
          />
        )}
      </Box>

      {/* Logo — absolutely positioned, centered on the separator line */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: 220 - LOGO_HALF, md: 320 - LOGO_HALF },
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          borderRadius: "50%",
          border: "3px solid #D11D27",
          boxShadow: 3,
          overflow: "hidden",
          bgcolor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {restaurant.logoImageUrl ? (
          <Box
            component="img"
            src={restaurant.logoImageUrl}
            alt={restaurant.name}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box
            component="img"
            src="/logo.png"
            alt=""
            sx={{ width: 56, height: 56, opacity: 0.5 }}
          />
        )}
      </Box>

      {/* Info section — top padding makes room for the half of logo below the separator */}
      <Box sx={{ px: 2, pt: `${LOGO_HALF + 12}px`, pb: 2 }}>
        {/* Name */}
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 1 }}>
          {restaurant.name}
        </Typography>

        {/* Tags */}
        {restaurant.tags.length > 0 && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              overflowX: "auto",
              pb: 0.5,
              mb: 1.5,
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {restaurant.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ flexShrink: 0 }} />
            ))}
          </Box>
        )}

        {/* Address */}
        {restaurant.address && (
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 0.75 }}>
            <PlaceIcon sx={{ fontSize: 18, color: "text.secondary", mt: 0.15 }} />
            <Typography variant="body2" color="text.secondary">
              {restaurant.address}
            </Typography>
          </Box>
        )}

        {/* Phone */}
        {restaurant.phone && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
            <PhoneIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {restaurant.phone}
            </Typography>
          </Box>
        )}

        {/* Hours */}
        {restaurant.hours && (() => {
          const status = getHoursStatus(restaurant.hours, todayKey);
          return (
            <Box>
              {status && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
                  <AccessTimeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: status.color }}>
                      {status.primary}
                    </Typography>
                    {status.secondary && (
                      <Typography variant="body2" color="text.secondary">
                        {status.secondary}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              {/* Full week — always visible */}
              <Box sx={{ pl: 3.5 }}>
                {DAYS_ORDER.map((day) => (
                  <HoursRow key={day} day={day} restaurant={restaurant} isToday={day === todayKey} />
                ))}
              </Box>
            </Box>
          );
        })()}
      </Box>
    </Box>
  );
}
