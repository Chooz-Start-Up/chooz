"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { authService, AppError } from "@chooz/services";

// --- Inline brand SVG icons ---

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="#1877F2"
        d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.875V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="#000000"
        d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      />
    </svg>
  );
}

// --- Component ---

interface OAuthButtonsProps {
  onError: (message: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function OAuthButtons({
  onError,
  loading,
  setLoading,
}: OAuthButtonsProps) {
  async function handleOAuth(
    provider: "google" | "facebook" | "apple",
  ) {
    setLoading(true);
    try {
      switch (provider) {
        case "google":
          await authService.loginWithGoogle();
          break;
        case "facebook":
          await authService.loginWithFacebook();
          break;
        case "apple":
          await authService.loginWithApple();
          break;
      }
    } catch (error) {
      if (
        error instanceof AppError &&
        error.code === "auth/popup-closed-by-user"
      ) {
        // User closed popup — do nothing
      } else {
        onError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Divider sx={{ my: 2 }}>or</Divider>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Button
          variant="outlined"
          fullWidth
          disabled={loading}
          startIcon={<GoogleIcon />}
          onClick={() => handleOAuth("google")}
          sx={{ textTransform: "none", color: "text.primary", borderColor: "divider" }}
        >
          Continue with Google
        </Button>

        <Button
          variant="outlined"
          fullWidth
          disabled={loading}
          startIcon={<FacebookIcon />}
          onClick={() => handleOAuth("facebook")}
          sx={{ textTransform: "none", color: "text.primary", borderColor: "divider" }}
        >
          Continue with Facebook
        </Button>

        <Button
          variant="outlined"
          fullWidth
          disabled={loading}
          startIcon={<AppleIcon />}
          onClick={() => handleOAuth("apple")}
          sx={{ textTransform: "none", color: "text.primary", borderColor: "divider" }}
        >
          Continue with Apple
        </Button>
      </Box>
    </Box>
  );
}
