import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  Button,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
// Reusable Text Button (moved here or to a shared util if used elsewhere)
const TextActionBtn = ({
  label,
  onClick,
  color = "var(--text-color-grey-scale)",
}) => (
  <Button
    onClick={onClick}
    disableRipple
    sx={{
      minWidth: 0,
      padding: "0 8px",
      color: color,
      fontFamily: "var(--font-family)",
      fontSize: "0.85rem",
      fontWeight: 600,
      textTransform: "none",
      "&:hover": {
        color: "var(--action-color)",
        backgroundColor: "transparent",
        textDecoration: "underline",
      },
    }}>
    [{label}]
  </Button>
);

const WatchlistSidebar = ({
  watchlists,
  activeListId,
  onSelect,
  onCreateClick,
}) => {
  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        borderRight: "1px solid var(--border-input-fields)",
        display: "flex",
        flexDirection: "column",
      }}>
      {/* HEADER */}
      <Box
        sx={{
          height: "48px",
          display: "flex",
          alignItems: "center",
          px: 2,
          borderBottom: "1px solid var(--border-input-fields)",
          boxSizing: "border-box",
        }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontFamily: "var(--font-family)",
            color: "var(--text-color-grey-scale)",
            letterSpacing: "1px",
          }}>
          WATCHLISTS
        </Typography>
      </Box>

      {/* LIST */}
      <List sx={{ flex: 1, overflowY: "auto", p: 0 }}>
        {watchlists.map((list) => {
          const isActive = activeListId === list.id;
          return (
            <ListItem key={list.id} disablePadding>
              <ListItemButton
                onClick={() => onSelect(list.id)}
                sx={{
                  height: "40px",
                  borderLeft: isActive
                    ? "3px solid var(--action-color)"
                    : "3px solid transparent",
                  backgroundColor: isActive
                    ? "var(--action-color-more-transparent)"
                    : "transparent",
                  color: isActive
                    ? "var(--action-color)"
                    : "var(--header-color)",
                  "&:hover": {
                    backgroundColor: "var(--input-fields-hover-bg-color)",
                  },
                }}>
                {/* <Tooltip title={list.title} placement="right"> */}
                  <Typography
                    sx={{
                      fontFamily: "var(--font-family)",
                      fontSize: "0.9rem",
                      fontWeight: isActive ? 600 : 400,
                      ml: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%",
                    }}>
                    {list.title}
                  </Typography>
                {/* </Tooltip> */}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* FOOTER */}
      <Box
        sx={{
          p: 1,
          borderTop: "1px solid var(--border-input-fields)",
          textAlign: "center",
        }}>
        <Button
          style={{ width: "100%" }}
          variant="contained"
          className="contained-custom-button"
          startIcon={<AddIcon className="button-icon" />}
          onClick={onCreateClick}>
          {" "}
          NEW LIST
        </Button>
      </Box>
    </Box>
  );
};

export default WatchlistSidebar;
