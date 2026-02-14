"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { authService, userService, AppError } from "@chooz/services";
import { AuthCard } from "@/components/AuthCard";
import { OAuthButtons } from "@/components/OAuthButtons";
import { usePostLoginRedirect } from "@/hooks/usePostLoginRedirect";
import { getAuthErrorMessage } from "@/utils/authErrors";

export default function RegisterPage() {
  usePostLoginRedirect();

  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Client-side validation
  const passwordTooShort = password.length > 0 && password.length < 6;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const credential = await authService.registerWithEmail(email, password);
      await userService.createUser(credential.user.uid, {
        email,
        displayName,
        authProvider: "email",
        role: "owner",
      });
      router.push("/verify-email");
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
      heading="Create Account"
      subtitle="Register to start managing your restaurant"
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Full Name"
          required
          fullWidth
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />

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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          error={passwordTooShort}
          helperText={passwordTooShort ? "Must be at least 6 characters" : ""}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Confirm Password"
          type="password"
          required
          fullWidth
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          error={passwordsMismatch}
          helperText={passwordsMismatch ? "Passwords do not match" : ""}
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
            "Create Account"
          )}
        </Button>
      </Box>

      <OAuthButtons
        onError={setError}
        loading={loading}
        setLoading={setLoading}
      />

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography variant="body2">
          Already have an account? <Link href="/login">Sign in</Link>
        </Typography>
      </Box>
    </AuthCard>
  );
}
