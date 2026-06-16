import React from "react";
import { Box, List, ListItem, ListItemText, Typography, Chip, Divider } from "@mui/material";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";

const STATUS_STYLES = {
  uploaded:   { color: "var(--text-color-grey-scale)", label: "Uploaded" },
  processing: { color: "var(--action-color)",          label: "Processing" },
  done:       { color: "var(--success-color)",         label: "Done" },
  failed:     { color: "var(--error-red)",             label: "Failed" },
};

function UploadedFilesList({ files }) {
  if (files.length === 0) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography sx={{ color: "var(--text-color-grey-scale)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", mb: 1 }}>
        UPLOADED FILES
      </Typography>
      <List disablePadding>
        {files.map((file, index) => {
          const statusStyle = STATUS_STYLES[file.status] ?? STATUS_STYLES.uploaded;
          return (
            <React.Fragment key={file.id}>
              <ListItem disablePadding sx={{ py: 1 }}>
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
                <Chip
                  label={statusStyle.label}
                  size="small"
                  sx={{
                    color: statusStyle.color,
                    borderColor: statusStyle.color,
                    backgroundColor: "transparent",
                    fontFamily: "var(--font-family)",
                    fontSize: "0.7rem",
                    borderRadius: "var(--var-border-radius)",
                  }}
                  variant="outlined"
                />
              </ListItem>
              {index < files.length - 1 && (
                <Divider sx={{ borderColor: "var(--border-glass-card)" }} />
              )}
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
}

export default UploadedFilesList;
