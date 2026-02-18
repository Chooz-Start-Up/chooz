"use client";

import { useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import type { ClaimRequest } from "@chooz/shared";

interface ClaimReviewCardProps {
  claim: ClaimRequest;
  restaurantName: string;
  onProcess: (
    claimId: string,
    action: "approve" | "reject",
    notes?: string,
  ) => Promise<void>;
  disabled?: boolean;
}

const STATUS_COLORS: Record<
  ClaimRequest["status"],
  "warning" | "success" | "error"
> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

function formatDate(ts: { seconds: number }): string {
  if (!ts.seconds) return "-";
  return new Date(ts.seconds * 1000).toLocaleDateString();
}

export function ClaimReviewCard({
  claim,
  restaurantName,
  onProcess,
  disabled,
}: ClaimReviewCardProps) {
  const [notes, setNotes] = useState("");
  const [confirmAction, setConfirmAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [processing, setProcessing] = useState(false);

  const isPending = claim.status === "pending";

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setProcessing(true);
    try {
      await onProcess(claim.id, confirmAction, notes || undefined);
      setConfirmAction(null);
      setNotes("");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {restaurantName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Claim by {claim.claimantName} ({claim.claimantEmail})
            </Typography>
          </Box>
          <Chip
            label={claim.status}
            color={STATUS_COLORS[claim.status]}
            size="small"
          />
        </Box>

        <Box sx={{ display: "flex", gap: 4, mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Role
            </Typography>
            <Typography variant="body2">{claim.claimantRole}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Phone
            </Typography>
            <Typography variant="body2">{claim.claimantPhone}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Submitted
            </Typography>
            <Typography variant="body2">
              {formatDate(claim.submittedAt)}
            </Typography>
          </Box>
          {claim.reviewedAt && claim.reviewedAt.seconds > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Reviewed
              </Typography>
              <Typography variant="body2">
                {formatDate(claim.reviewedAt)}
              </Typography>
            </Box>
          )}
        </Box>

        {claim.notes && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Notes:</strong> {claim.notes}
          </Typography>
        )}

        {isPending && (
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
            <TextField
              label="Admin Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              size="small"
              multiline
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              color="success"
              disabled={disabled || processing}
              onClick={() => setConfirmAction("approve")}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              color="error"
              disabled={disabled || processing}
              onClick={() => setConfirmAction("reject")}
            >
              Reject
            </Button>
          </Box>
        )}
      </Paper>

      <Dialog
        open={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
      >
        <DialogTitle>
          {confirmAction === "approve" ? "Approve" : "Reject"} Claim
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmAction === "approve"
              ? `This will transfer ownership of "${restaurantName}" to ${claim.claimantName} and grant them the owner role.`
              : `This will reject ${claim.claimantName}'s claim for "${restaurantName}".`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAction(null)} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            color={confirmAction === "approve" ? "success" : "error"}
            variant="contained"
            disabled={processing}
          >
            {processing
              ? "Processing..."
              : confirmAction === "approve"
                ? "Approve"
                : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
