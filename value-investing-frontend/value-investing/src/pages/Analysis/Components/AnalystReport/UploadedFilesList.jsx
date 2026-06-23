import React, { useState } from "react";
import { Box, List, ListItem, ListItemText, Typography, Chip, Divider, IconButton, Tooltip, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Button,
} from "@mui/material";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LoadingDots from "../../../GlobalComponents/LoadingDots";

const STATUS_STYLES = {
  done:   { color: "var(--action-color)", label: "Done" },
  failed: { color: "var(--error-red)",    label: "Failed" },
};

const LOADING_LABELS = {
  uploaded:   "Initializing",
  scanning:   "Scanning Document",
  extracting: "Extracting Key Data",
};

const PROGRESS_VALUES = {
  uploaded:   5,
  scanning:   33,
  extracting: 67,
  done:       100,
};

function LinearProgressWithLabel({ value }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ flexGrow: 1 }}>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            height: 2,
            borderRadius: 1,
            backgroundColor: "var(--border-glass-card)",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "var(--action-color)",
              transition: "transform 0.8s ease",
            },
          }}
        />
      </Box>
      <Typography sx={{ fontSize: "0.7rem", color: "var(--text-color-grey-scale)", minWidth: 28, textAlign: "right" }}>
        {`${value}%`}
      </Typography>
    </Box>
  );
}

function UploadedFilesList({ files, onRetry, onDelete }) {
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  if (files.length === 0) return null;

  const fileToDelete = files.find((f) => f.id === pendingDeleteId);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography sx={{ color: "var(--text-color-grey-scale)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", mb: 1 }}>
        PROCESSED FILES
      </Typography>
      <List disablePadding>
        {files.map((file, index) => {
          const style = STATUS_STYLES[file.status] ?? STATUS_STYLES.done;
          const canDelete = file.status === "done" || file.status === "failed";
          return (
            <React.Fragment key={file.id}>
              <ListItem disablePadding sx={{ py: 1, flexDirection: "column", alignItems: "stretch" }}>
                <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <PictureAsPdfOutlinedIcon
                    sx={{ color: "var(--text-color-grey-scale)", mr: 1.5, flexShrink: 0 }}
                  />
                  <ListItemText
                    primary={
                      <Typography sx={{ color: "var(--header-color)", fontSize: "0.9rem" }}>
                        {file.file_name}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ color: "var(--text-color-grey-scale)", fontSize: "0.75rem" }}>
                        {new Date(file.uploaded_at).toLocaleDateString()}
                      </Typography>
                    }
                  />
                  {file.status in LOADING_LABELS ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LoadingDots />
                      <Chip
                        label={LOADING_LABELS[file.status]}
                        size="small"
                        sx={{
                          color: "var(--action-color)",
                          borderColor: "var(--action-color)",
                          backgroundColor: "transparent",
                          fontFamily: "var(--font-family)",
                          fontSize: "0.7rem",
                          borderRadius: "var(--var-border-radius)",
                        }}
                        variant="outlined"
                      />
                    </Box>
                  ) : file.status === "failed" ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Tooltip title={file.retry_count >= 3 ? "Max retries reached" : "Retry processing"} arrow>
                        <span>
                          <IconButton
                            size="small"
                            disabled={file.retry_count >= 3}
                            onClick={() => onRetry(file.id)}
                            sx={{ color: "var(--error-red)", "&.Mui-disabled": { color: "var(--text-color-grey-scale)" } }}
                          >
                            <RestartAltIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Chip
                        label="Failed"
                        size="small"
                        sx={{
                          color: "var(--error-red)",
                          borderColor: "var(--error-red)",
                          backgroundColor: "transparent",
                          fontFamily: "var(--font-family)",
                          fontSize: "0.7rem",
                          borderRadius: "var(--var-border-radius)",
                        }}
                        variant="outlined"
                      />
                      <Typography sx={{ fontSize: "0.7rem", color: "var(--text-color-grey-scale)" }}>
                        {file.retry_count}/3
                      </Typography>
                    </Box>
                  ) : (
                    <Chip
                      label={style.label}
                      size="small"
                      sx={{
                        color: style.color,
                        borderColor: style.color,
                        backgroundColor: "transparent",
                        fontFamily: "var(--font-family)",
                        fontSize: "0.7rem",
                        borderRadius: "var(--var-border-radius)",
                      }}
                      variant="outlined"
                    />
                  )}
                  {canDelete && (
                    <IconButton
                      size="small"
                      onClick={() => setPendingDeleteId(file.id)}
                      sx={{ color: "var(--error-red)", ml: 1 }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                {file.status in PROGRESS_VALUES && (
                  <LinearProgressWithLabel value={PROGRESS_VALUES[file.status]} />
                )}
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>

      <Dialog
        open={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { backgroundColor: "var(--background-glass-card-less-transparent)", backdropFilter: "var(--backdrop-filter-glass-card)" } }}
      >
        <DialogTitle>Delete file?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{fileToDelete?.file_name}</strong> will be permanently deleted from storage. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            className="contained-custom-button"
            onClick={() => {
              onDelete(pendingDeleteId);
              setPendingDeleteId(null);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UploadedFilesList;
