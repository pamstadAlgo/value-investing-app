import React from "react";
import { Box, Typography, Button } from "@mui/material";
import WatchlistTable from "./WatchlistTable"; // Your existing table component
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
const TextActionBtn = ({
  label,
  onClick,
  icon,
  color = "var(--text-color-grey-scale)",
}) => (
  <Button
    size="small"
    onClick={onClick}
    variant="contained"
    className="contained-custom-button fit-content-button"
    startIcon={icon}>
    {label}
  </Button>
);

const WatchlistContent = ({
  activeList,
  onShareClick,
  onDeleteClick,
  onRemoveStock,
}) => {
  if (!activeList) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <Typography sx={{ fontFamily: "var(--font-family)", color: "gray" }}>
          [ NO LIST SELECTED ]
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
      {/* HEADER */}
      <Box
        sx={{
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          borderBottom: "1px solid var(--border-input-fields)",
          bgcolor: "var(--background-color-nav-bar)",
          boxSizing: "border-box",
        }}>
        <Typography
          sx={{
            fontFamily: "var(--font-family)",
            fontWeight: 700,
            color: "var(--action-color)",
            textTransform: "uppercase",
          }}>
          {activeList.title}
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextActionBtn
            label="SHARE"
            onClick={onShareClick}
            icon={<ShareOutlinedIcon className="button-icon" />}
          />
          <TextActionBtn
            label="DELETE LIST"
            onClick={onDeleteClick}
            color="var(--error-red)"
            icon={<DeleteOutlineOutlinedIcon className="button-icon" />}
          />
        </Box>
      </Box>

      {/* TABLE AREA */}
      <Box sx={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <WatchlistTable
          data={activeList.items || []}
          onRemove={onRemoveStock}
        />
      </Box>

      {/* STATUS BAR */}
      <Box
        sx={{
          height: "32px",
          borderTop: "1px solid var(--border-input-fields)",
          display: "flex",
          alignItems: "center",
          px: 2,
          gap: 4,
          bgcolor: "#000",
        }}>
        <Typography
          variant="caption"
          sx={{ fontFamily: "var(--font-family)", color: "gray" }}>
          STATUS: <span style={{ color: "var(--success-color)" }}>READY</span>
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontFamily: "var(--font-family)", color: "gray" }}>
          ITEMS:{" "}
          <span style={{ color: "var(--header-color)" }}>
            {activeList.items?.length || 0}
          </span>
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontFamily: "var(--font-family)", color: "gray" }}>
          OWNER:{" "}
          <span style={{ color: "var(--header-color)" }}>
            {activeList.owner_name?.toUpperCase() || "ME"}
          </span>
        </Typography>
      </Box>
    </Box>
  );
};

export default WatchlistContent;
