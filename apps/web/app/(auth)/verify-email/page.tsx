"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { authService } from "@chooz/services";
import { AuthCard } from "@/components/AuthCard";

export default function VerifyEmailPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await authService.verifyEmail();
      setSuccess(true);
    } catch {
      setError("Failed to resend verification email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      heading="Check Your Email"
      subtitle="We sent a verification link to your email address. Click the link to verify your account."
    >
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Verification email sent! Check your inbox.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="outlined"
        fullWidth
        disabled={loading}
        onClick={handleResend}
        sx={{ py: 1.5 }}
      >
        Resend Verification Email
      </Button>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography variant="body2">
          Already verified? <Link href="/login">Sign in</Link>
        </Typography>
      </Box>
    </AuthCard>
  );
}
