"use client";

import { useRef, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import Tooltip from "@mui/material/Tooltip";
import { useRestaurantStore } from "../../stores/restaurantStore";

export function QRCodePanel() {
  const { selectedRestaurantId, restaurants } = useRestaurantStore();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const hiddenRef = useRef<HTMLDivElement>(null);

  if (!selectedRestaurantId) return null;

  const restaurantName =
    restaurants.find((r) => r.id === selectedRestaurantId)?.name ?? "";
  const url =
    typeof window !== "undefined"
      ? window.location.origin + "/restaurant/" + selectedRestaurantId
      : "";

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
    a.download = `${restaurantName || "restaurant"}-qr.png`;
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
    <title>QR Code — ${restaurantName}</title>
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
    <h1>${restaurantName}</h1>
    <img src="${dataUrl}" alt="QR Code" />
    <p>${url}</p>
  </body>
</html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <>
      <Tooltip title="QR Code">
        <IconButton size="small" onClick={() => setOpen(true)}>
          <QrCode2Icon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          {restaurantName || "QR Code"}
          <IconButton size="small" onClick={() => setOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              pt: 1,
            }}
          >
            <QRCode
              value={url}
              size={200}
              qrStyle="dots"
              fgColor="#1C1C1E"
              eyeRadius={{ inner: 4, outer: 14 }}
              eyeColor={{ inner: "#D11D27", outer: "#D11D27" }}
              ecLevel="Q"
              logoPaddingStyle="circle"
              logoImage="/logo.png"
              logoWidth={50}
              logoHeight={50}
              logoPadding={3}
              removeQrCodeBehindLogo
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ wordBreak: "break-all", textAlign: "center" }}
            >
              {url}
            </Typography>
          </Box>

          {/* Hidden canvas used for download and print */}
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
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
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
            Download
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
        </DialogActions>
      </Dialog>
    </>
  );
}
