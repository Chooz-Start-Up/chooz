"use client";

import { useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import { storageService, AppError } from "@chooz/services";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

interface ImageUploadSectionProps {
  ownerUid: string;
  restaurantId: string;
  bannerImageUrl: string | null;
  logoImageUrl: string | null;
  onImageUpdated: (field: "bannerImageUrl" | "logoImageUrl", url: string | null) => Promise<void>;
  variant?: "card" | "hero";
}

export function ImageUploadSection({
  ownerUid,
  restaurantId,
  bannerImageUrl,
  logoImageUrl,
  onImageUpdated,
  variant = "card",
}: ImageUploadSectionProps) {
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [bannerLoading, setBannerLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validateFile(file: File): string | null {
    if (!file.type.startsWith("image/")) return "Please select an image file.";
    if (file.size > MAX_FILE_SIZE) return "Image must be under 5 MB.";
    return null;
  }

  async function handleBannerSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (bannerInputRef.current) bannerInputRef.current.value = "";
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setBannerLoading(true);
    try {
      const url = await storageService.uploadBanner(ownerUid, restaurantId, file);
      await onImageUpdated("bannerImageUrl", url);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Failed to upload banner.");
    } finally {
      setBannerLoading(false);
    }
  }

  async function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (logoInputRef.current) logoInputRef.current.value = "";
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLogoLoading(true);
    try {
      const url = await storageService.uploadLogo(ownerUid, restaurantId, file);
      await onImageUpdated("logoImageUrl", url);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Failed to upload logo.");
    } finally {
      setLogoLoading(false);
    }
  }

  async function handleDeleteBanner() {
    setError(null);
    setBannerLoading(true);
    try {
      await storageService.deleteBanner(ownerUid, restaurantId);
      await onImageUpdated("bannerImageUrl", null);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Failed to delete banner.");
    } finally {
      setBannerLoading(false);
    }
  }

  async function handleDeleteLogo() {
    setError(null);
    setLogoLoading(true);
    try {
      await storageService.deleteLogo(ownerUid, restaurantId);
      await onImageUpdated("logoImageUrl", null);
    } catch (err) {
      setError(err instanceof AppError ? err.message : "Failed to delete logo.");
    } finally {
      setLogoLoading(false);
    }
  }

  const placeholderSx = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px dashed",
    borderColor: "divider",
    borderRadius: 1,
    cursor: "pointer",
    overflow: "hidden",
    "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
  } as const;

  const bannerContent = (
    <Box sx={{ position: "relative", mb: variant === "hero" ? 0 : 3 }}>
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleBannerSelect}
      />
      {bannerImageUrl ? (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: "3 / 1",
            borderRadius: variant === "hero" ? 2 : 1,
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src={bannerImageUrl}
            alt="Banner"
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {bannerLoading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(0,0,0,0.4)",
              }}
            >
              <CircularProgress sx={{ color: "white" }} />
            </Box>
          )}
          {!bannerLoading && (
            <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => bannerInputRef.current?.click()}
                sx={{ bgcolor: "rgba(255,255,255,0.85)", "&:hover": { bgcolor: "white" } }}
              >
                <AddPhotoAlternateIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleDeleteBanner}
                sx={{ bgcolor: "rgba(255,255,255,0.85)", "&:hover": { bgcolor: "white" } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      ) : (
        <Box
          onClick={() => !bannerLoading && bannerInputRef.current?.click()}
          sx={{
            ...placeholderSx,
            width: "100%",
            aspectRatio: "3 / 1",
            flexDirection: "column",
            gap: 0.5,
            borderRadius: variant === "hero" ? 2 : 1,
          }}
        >
          {bannerLoading ? (
            <CircularProgress size={32} />
          ) : (
            <>
              <AddPhotoAlternateIcon color="action" />
              <Typography variant="body2" color="text.secondary">
                Click to upload banner
              </Typography>
            </>
          )}
        </Box>
      )}
    </Box>
  );

  const logoContent = (
    <Box sx={{ position: "relative", display: "inline-block" }}>
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleLogoSelect}
      />
      {logoImageUrl ? (
        <Box sx={{ position: "relative" }}>
          <Box
            component="img"
            src={logoImageUrl}
            alt="Logo"
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              objectFit: "cover",
              border: variant === "hero" ? "3px solid white" : undefined,
              boxShadow: variant === "hero" ? 2 : undefined,
            }}
          />
          {logoLoading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                bgcolor: "rgba(0,0,0,0.4)",
              }}
            >
              <CircularProgress sx={{ color: "white" }} />
            </Box>
          )}
          {!logoLoading && (
            <Box sx={{ position: "absolute", top: -4, right: -4, display: "flex", gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => logoInputRef.current?.click()}
                sx={{
                  bgcolor: "rgba(255,255,255,0.85)",
                  "&:hover": { bgcolor: "white" },
                  width: 28,
                  height: 28,
                }}
              >
                <AddPhotoAlternateIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleDeleteLogo}
                sx={{
                  bgcolor: "rgba(255,255,255,0.85)",
                  "&:hover": { bgcolor: "white" },
                  width: 28,
                  height: 28,
                }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          )}
        </Box>
      ) : (
        <Box
          onClick={() => !logoLoading && logoInputRef.current?.click()}
          sx={{
            ...placeholderSx,
            width: 120,
            height: 120,
            borderRadius: "50%",
            flexDirection: "column",
            gap: 0.5,
            bgcolor: variant === "hero" ? "white" : undefined,
            boxShadow: variant === "hero" ? 2 : undefined,
          }}
        >
          {logoLoading ? (
            <CircularProgress size={24} />
          ) : (
            <>
              <AddPhotoAlternateIcon color="action" fontSize="small" />
              <Typography variant="caption" color="text.secondary">
                Upload logo
              </Typography>
            </>
          )}
        </Box>
      )}
    </Box>
  );

  if (variant === "hero") {
    return (
      <Box sx={{ position: "relative", mb: 7 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {bannerContent}
        <Box sx={{ position: "absolute", bottom: -40, left: 24 }}>
          {logoContent}
        </Box>
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Images
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload a banner and logo for your restaurant.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Banner */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Banner
      </Typography>
      {bannerContent}

      {/* Logo */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Logo
      </Typography>
      {logoContent}
    </Paper>
  );
}
