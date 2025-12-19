import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Typography,
} from "@mui/material";

const WatchlistDialogs = ({
  isCreateOpen,
  isShareOpen,
  onCloseCreate,
  onCloseShare,
  onCreate,
  onShare,
}) => {
  const [newListTitle, setNewListTitle] = useState("");
  const [shareEmail, setShareEmail] = useState("");

  useEffect(() => {
    if (isCreateOpen) setNewListTitle("");
  }, [isCreateOpen]);

  useEffect(() => {
    if (isShareOpen) setShareEmail("");
  }, [isShareOpen]);

  const handleCreateSubmit = () => {
    if (newListTitle.trim()) onCreate(newListTitle);
  };

  const handleShareSubmit = () => {
    if (shareEmail.trim()) onShare(shareEmail);
  };

  return (
    <>
      {/* CREATE DIALOG */}
      <Dialog
        open={isCreateOpen}
        onClose={onCloseCreate}
        className="custom-dialog-watchlist">
        <DialogTitle
          sx={{
            fontFamily: "var(--font-family)",
            color: "var(--header-color)",
          }}>
          NEW LIST
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="LIST TITLE"
            fullWidth
            multiline
            variant="standard"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            InputLabelProps={{ style: { fontFamily: "var(--font-family)" } }}
            InputProps={{ style: { fontFamily: "var(--font-family)" } }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onCloseCreate}
            sx={{
              color: "var(--text-color-grey-scale)",
              fontFamily: "var(--font-family)",
            }}>
            CANCEL
          </Button>
          <Button
            onClick={handleCreateSubmit}
            sx={{
              color: "var(--action-color)",
              fontFamily: "var(--font-family)",
              fontWeight: "bold",
            }}>
            CREATE
          </Button>
        </DialogActions>
      </Dialog>

      {/* SHARE DIALOG - INCREASED SIZE */}
      <Dialog
        className="new-list-dialog"
        open={isShareOpen}
        onClose={onCloseShare}
        fullWidth={true} // <--- Makes it stretch to the maxWidth
        maxWidth="sm" // <--- Options: 'xs' (default), 'sm' (600px), 'md' (900px)
        PaperProps={{
          // Optional: Force a minimum height if you want it taller
          sx: {
            minHeight: "250px",
            backgroundImage: "none",
            bgcolor: "var(--background-glass-card)", // Ensures consistency with your glass theme
          },
        }}>
        <DialogTitle
          sx={{
            fontFamily: "var(--font-family)",
            color: "var(--header-color)",
          }}>
          SHARE LIST
        </DialogTitle>
        <DialogContent>
          {/* Added some helper text since we have more space now */}
          <Typography
            variant="body2"
            sx={{ color: "gray", mb: 2, fontFamily: "var(--font-family)" }}>
            Enter the email address of the user you want to share this watchlist
            with.
          </Typography>

          <TextField
            autoFocus
            margin="dense"
            label="USER EMAIL"
            type="email"
            fullWidth
            variant="standard"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            InputLabelProps={{ style: { fontFamily: "var(--font-family)" } }}
            InputProps={{ style: { fontFamily: "var(--font-family)" } }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={onCloseShare}
            sx={{
              color: "var(--text-color-grey-scale)",
              fontFamily: "var(--font-family)",
            }}>
            CANCEL
          </Button>
          <Button
            onClick={handleShareSubmit}
            variant="outlined" // Made it outlined to stand out more in the larger modal
            sx={{
              color: "var(--action-color)",
              borderColor: "var(--action-color)",
              fontFamily: "var(--font-family)",
              fontWeight: "bold",
              "&:hover": {
                borderColor: "var(--action-color)",
                bgcolor: "rgba(0, 230, 118, 0.1)",
              },
            }}>
            SHARE WATCHLIST
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WatchlistDialogs;
