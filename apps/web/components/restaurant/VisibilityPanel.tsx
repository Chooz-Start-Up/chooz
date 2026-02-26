"use client";

import { useRef, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PrintIcon from "@mui/icons-material/Print";
import { useRestaurantStore } from "@/stores/restaurantStore";

export function VisibilityPanel() {
  const { selectedRestaurantId, restaurants, updateRestaurant } = useRestaurantStore();
  const [listedDialogOpen, setListedDialogOpen] = useState(false);
  const [menuReadyDialogOpen, setMenuReadyDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const hiddenRef = useRef<HTMLDivElement>(null);

  if (!selectedRestaurantId) return null;
  const restaurant = restaurants.find((r) => r.id === selectedRestaurantId);
  if (!restaurant) return null;

  const publishBlockedFields: string[] = [];
  if (!restaurant.name?.trim()) publishBlockedFields.push("Restaurant name");
  if (!restaurant.description?.trim()) publishBlockedFields.push("Description");
  if (!restaurant.phone?.trim()) publishBlockedFields.push("Phone number");
  const canPublish = restaurant.isPublished || publishBlockedFields.length === 0;

  const url =
    typeof window !== "undefined"
      ? window.location.origin + "/restaurant/" + selectedRestaurantId
      : "";

  const handleListedConfirm = async () => {
    setSaving(true);
    try {
      await updateRestaurant(restaurant.id, { isPublished: !restaurant.isPublished });
      setListedDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleMenuReadyConfirm = async () => {
    const current = restaurant.isMenuReady !== false;
    setSaving(true);
    try {
      await updateRestaurant(restaurant.id, { isMenuReady: !current });
      setMenuReadyDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const canvas = hiddenRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${restaurant.name || "restaurant"}-qr.png`;
    a.click();
  };

  const handlePrint = () => {
    const canvas = hiddenRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>QR Code — ${restaurant.name}</title>
    <style>
      body {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
        font-family: sans-serif;
        text-align: center;
      }
      h1 { font-size: 1.5rem; margin-bottom: 1rem; }
      img { width: 240px; height: 240px; }
      p { margin-top: 1rem; font-size: 0.875rem; color: #555; word-break: break-all; }
    </style>
  </head>
  <body>
    <h1>${restaurant.name}</h1>
    <img src="${dataUrl}" alt="QR Code" />
    <p>${url}</p>
  </body>
</html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: "background.paper" }}>
      {/* ── Visibility ── */}
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Visibility & Sharing
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Control visibility and share your public page.
      </Typography>
      <Button
        component="a"
        href={`/restaurant/${selectedRestaurantId}`}
        target="_blank"
        rel="noopener noreferrer"
        variant="outlined"
        size="small"
        startIcon={<OpenInNewIcon />}
        sx={{ textTransform: "none", mb: 2 }}
      >
        Preview
      </Button>
      <Divider sx={{ mb: 2 }} />

      {/* Listed toggle */}
      <FormControlLabel
        control={
          <Switch
            checked={restaurant.isPublished}
            disabled={!canPublish || saving}
            onChange={() => setListedDialogOpen(true)}
          />
        }
        label="Listed"
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
        {restaurant.isPublished
          ? "Your restaurant is public and visible to customers."
          : "Your restaurant is private and hidden from customers."}
      </Typography>

      {!canPublish && (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          To make your restaurant public, please fill in:{" "}
          {publishBlockedFields.join(", ")}.
        </Alert>
      )}

      {/* Menu Ready toggle */}
      <Tooltip
        title={!restaurant.isPublished ? "Publish your restaurant first" : ""}
        placement="right"
      >
        <span>
          <FormControlLabel
            control={
              <Switch
                checked={restaurant.isMenuReady !== false}
                disabled={!restaurant.isPublished || saving}
                onChange={() => setMenuReadyDialogOpen(true)}
              />
            }
            label="Menu Ready"
          />
        </span>
      </Tooltip>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {restaurant.isMenuReady !== false
          ? "Your menu is visible to customers."
          : "Your menu is hidden from customers."}
      </Typography>

      {/* ── QR Code ── */}
      <Divider sx={{ my: 2.5 }} />

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <QRCode
          value={url}
          size={160}
          qrStyle="dots"
          fgColor="#1C1C1E"
          eyeRadius={{ inner: 4, outer: 14 }}
          eyeColor={{ inner: "#D11D27", outer: "#D11D27" }}
          ecLevel="Q"
          logoPaddingStyle="circle"
          logoImage="/logo.png"
          logoWidth={42}
          logoHeight={42}
          logoPadding={3}
          removeQrCodeBehindLogo
        />

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ wordBreak: "break-all", textAlign: "center", fontFamily: "monospace" }}
        >
          {url}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
            onClick={handleCopy}
            color={copied ? "success" : "primary"}
          >
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Download PNG
          </Button>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
        </Box>
      </Box>

      {/* Hidden canvas for download and print */}
      <Box sx={{ position: "absolute", left: -9999, top: -9999 }}>
        <div ref={hiddenRef}>
          <QRCode
            value={url}
            size={240}
            qrStyle="dots"
            fgColor="#1C1C1E"
          eyeRadius={{ inner: 4, outer: 14 }}
          eyeColor={{ inner: "#D11D27", outer: "#D11D27" }}
          ecLevel="Q"
          logoPaddingStyle="circle"
            logoImage="/logo.png"
            logoWidth={62}
            logoHeight={62}
            logoPadding={3}
          removeQrCodeBehindLogo
          />
        </div>
      </Box>

      {/* Listed confirmation dialog */}
      <Dialog open={listedDialogOpen} onClose={() => !saving && setListedDialogOpen(false)}>
        <DialogTitle>
          {restaurant.isPublished ? "Make restaurant private?" : "Make restaurant public?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {restaurant.isPublished
              ? "Your restaurant will become private and hidden from customers. They will no longer be able to find you in search results or browse your menu. You can make it public again at any time."
              : "Your restaurant will become public and visible to all customers. They will be able to find you in search results and browse your menu. Make sure your information and menu are up to date."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setListedDialogOpen(false)}
            disabled={saving}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleListedConfirm}
            disabled={saving}
            sx={{ textTransform: "none" }}
          >
            {restaurant.isPublished ? "Make Private" : "Make Public"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu Ready confirmation dialog */}
      <Dialog open={menuReadyDialogOpen} onClose={() => !saving && setMenuReadyDialogOpen(false)}>
        <DialogTitle>
          {restaurant.isMenuReady !== false ? "Hide menu?" : "Show menu?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {restaurant.isMenuReady !== false
              ? "Your menu will be hidden from customers. They will see a 'Menu coming soon' message instead. You can make it visible again at any time."
              : "Your menu will become visible to customers. Make sure your menu is up to date before showing it."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setMenuReadyDialogOpen(false)}
            disabled={saving}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleMenuReadyConfirm}
            disabled={saving}
            sx={{ textTransform: "none" }}
          >
            {restaurant.isMenuReady !== false ? "Hide Menu" : "Show Menu"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
