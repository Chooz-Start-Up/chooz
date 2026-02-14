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
import { OAuthButtons } from "@/components/OAuthButtons";
import { usePostLoginRedirect } from "@/hooks/usePostLoginRedirect";
import { getAuthErrorMessage } from "@/utils/authErrors";

export default function LoginPage() {
  usePostLoginRedirect();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.loginWithEmail(email, password);
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
    <AuthCard heading="Sign In" subtitle="Sign in to manage your restaurant">
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
          sx={{ mb: 2 }}
        />

        <TextField
          label="Password"
          type="password"
          required
          fullWidth
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
        </Button>
      </Box>

      <OAuthButtons
        onError={setError}
        loading={loading}
        setLoading={setLoading}
      />

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography variant="body2">
          <Link href="/reset-password">Forgot password?</Link>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Don&apos;t have an account?{" "}
          <Link href="/register">Create an account</Link>
        </Typography>
      </Box>
    </AuthCard>
  );
}
