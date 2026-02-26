"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PeopleIcon from "@mui/icons-material/People";
import TuneIcon from "@mui/icons-material/Tune";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { RestaurantPreviewGrid } from "@/components/landing/RestaurantPreviewGrid";

const features = [
  {
    icon: <MenuBookIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    title: "Publish Your Menu",
    description:
      "Create and manage your restaurant menu online. Update dishes, prices, and photos in real time.",
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    title: "Reach New Customers",
    description:
      "Get discovered by diners searching for restaurants, cuisines, and dishes in your area.",
  },
  {
    icon: <TuneIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    title: "Manage Effortlessly",
    description:
      "One simple dashboard to keep your menu, hours, and restaurant details up to date.",
  },
];

export default function HomePage() {
  return (
    <Box>
      <LandingHeader />

      {/* Hero */}
      <Box sx={{ bgcolor: "secondary.main", py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg" sx={{ textAlign: "center" }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "2rem", md: "3rem" },
              mb: 2,
            }}
          >
            Your menu, discovered by everyone
          </Typography>
          <Typography
            variant="h6"
            component="p"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto", mb: 4, fontWeight: 400 }}
          >
            Chooz helps restaurant owners publish their menus online and
            connects diners with the food they love.
          </Typography>
          <Button
            component={Link}
            href="/register"
            variant="contained"
            size="large"
            disableElevation
            sx={{ px: 4, py: 1.5, fontSize: "1rem" }}
          >
            Get Started
          </Button>
        </Container>
      </Box>

      {/* Features */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, textAlign: "center", mb: { xs: 4, md: 6 } }}
          >
            Why restaurants choose Chooz
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {features.map((f) => (
              <Paper
                key={f.title}
                variant="outlined"
                sx={{
                  p: 4,
                  borderRadius: 2,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                {f.icon}
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {f.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {f.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Restaurant Preview */}
      <Box sx={{ bgcolor: "secondary.main", py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, textAlign: "center", mb: { xs: 4, md: 6 } }}
          >
            Restaurants on Chooz
          </Typography>
          <RestaurantPreviewGrid />
        </Container>
      </Box>

      {/* CTA Banner */}
      <Box sx={{ bgcolor: "primary.main", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg" sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ color: "white", fontWeight: 700, mb: 3 }}
          >
            Ready to put your restaurant on the map?
          </Typography>
          <Button
            component={Link}
            href="/register"
            variant="outlined"
            size="large"
            sx={{
              color: "white",
              borderColor: "white",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              "&:hover": {
                borderColor: "white",
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Get Started
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{ bgcolor: "#2C3E50", color: "white", py: { xs: 4, md: 5 } }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Chooz"
              sx={{ width: 24, height: 24, filter: "brightness(0) invert(1)" }}
            />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Chooz
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                &copy; {new Date().getFullYear()} Chooz. All rights reserved.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              component={Link}
              href="/login"
              size="small"
              sx={{ color: "white", opacity: 0.8, "&:hover": { opacity: 1 } }}
            >
              Log In
            </Button>
            <Button
              component={Link}
              href="/register"
              size="small"
              sx={{ color: "white", opacity: 0.8, "&:hover": { opacity: 1 } }}
            >
              Register
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
