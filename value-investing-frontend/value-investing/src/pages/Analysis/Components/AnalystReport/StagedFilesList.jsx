import React from "react";
import { List, ListItem, ListItemText, IconButton, Typography, Divider } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StagedFilesList({ files, onRemove }) {
  if (files.length === 0) {
    return (
      <Typography sx={{ color: "var(--text-color-grey-scale)", fontSize: "0.85rem", mt: 2 }}>
        No files staged yet.
      </Typography>
    );
  }

  return (
    <List disablePadding sx={{ mt: 2 }}>
      {files.map((file, index) => (
        <React.Fragment key={file.id}>
          <ListItem
            disablePadding
            sx={{ py: 1 }}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => onRemove(file.id)}
                sx={{ color: "var(--error-red)" }}>
                <DeleteOutlineIcon />
              </IconButton>
            }>
            <PictureAsPdfOutlinedIcon
              sx={{ color: "var(--action-color)", mr: 1.5, flexShrink: 0 }}
            />
            <ListItemText
              primary={
                <Typography sx={{ color: "var(--header-color)", fontSize: "0.9rem" }}>
                  {file.name}
                </Typography>
              }
              secondary={
                <Typography sx={{ color: "var(--text-color-grey-scale)", fontSize: "0.75rem" }}>
                  {formatBytes(file.size)}
                </Typography>
              }
            />
          </ListItem>
          {index < files.length - 1 && (
            <Divider sx={{ borderColor: "var(--border-glass-card)" }} />
          )}
        </React.Fragment>
      ))}
    </List>
  );
}

export default StagedFilesList;
