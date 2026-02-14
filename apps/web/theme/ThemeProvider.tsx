"use client";

import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { colors } from "@chooz/shared";

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary.main,
      dark: colors.primary.dark,
      light: colors.primary.light,
    },
    secondary: {
      main: colors.secondary.main,
      dark: colors.secondary.dark,
      light: colors.secondary.light,
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
    text: {
      primary: colors.text,
    },
  },
  typography: {
    fontFamily: '"Hurme Geometric Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </AppRouterCacheProvider>
  );
}
