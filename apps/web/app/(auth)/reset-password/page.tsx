"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { authService, AppError } from "@chooz/services";
import { AuthCard } from "@/components/AuthCard";
import { usePostLoginRedirect } from "@/hooks/usePostLoginRedirect";
import { getAuthErrorMessage } from "@/utils/authErrors";

export default function ResetPasswordPage() {
  usePostLoginRedirect();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.resetPassword(email);
      setSent(true);
    } catch (err) {
      if (err instanceof AppError) {
        setError(getAuthErrorMessage(err.code));
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      heading="Reset Password"
      subtitle="Enter your email and we'll send you a link to reset your password."
    >
      {sent ? (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>
            Password reset link sent! Check your email inbox.
          </Alert>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2">
              <Link href="/login">Back to sign in</Link>
            </Typography>
          </Box>
        </>
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email"
              type="email"
              required
              fullWidth
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2">
              Remember your password? <Link href="/login">Sign in</Link>
            </Typography>
          </Box>
        </>
      )}
    </AuthCard>
  );
}
