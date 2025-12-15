import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import AddIcon from "@mui/icons-material/Add";
import {
  fetchWatchlists,
  addStockToWatchlist,
  removeStockFromWatchlist,
  createWatchlist,
} from "../../features/watchlistSlice";
import { useSnackbar } from "./SnackbarProvider"; // Import the global hook

const StarMenu = ({ ticker }) => {
  const dispatch = useDispatch();
  const { watchlists, status } = useSelector((state) => state.watchlist);
  const { showMessage } = useSnackbar(); // Access global showMessage function

  const [anchorEl, setAnchorEl] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // Removed local state for toast/snackbar since we use the global one now

  const isStockInList = (list) => {
    return list.items?.some(
      (item) => item.qfs_symbol === ticker || item.ticker === ticker
    );
  };

  const isInAnyList = watchlists.some((list) => isStockInList(list));

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
    setIsCreating(false);
  };

  const showFeedback = (message, severity = "success") => {
    // Delegate to global SnackbarProvider
    showMessage(message, severity);
  };

  const handleToggle = (watchlist, event) => {
    if (event) event.stopPropagation();

    const isInList = isStockInList(watchlist);

    if (isInList) {
      dispatch(removeStockFromWatchlist({ watchlistId: watchlist.id, ticker }))
        .unwrap()
        .then(() => showFeedback(`Removed from ${watchlist.title}`, "success"))
        .catch(() => showFeedback("Failed to remove stock", "error"));
    } else {
      dispatch(addStockToWatchlist({ watchlistId: watchlist.id, ticker }))
        .unwrap()
        .then(() => showFeedback(`Added to ${watchlist.title}`, "success"))
        .catch(() => showFeedback("Failed to add stock", "error"));
    }
  };

  const handleCreateQuick = (e) => {
    e.stopPropagation();
    if (newTitle.trim()) {
      dispatch(createWatchlist({ title: newTitle }))
        .unwrap()
        .then((newList) => {
          dispatch(
            addStockToWatchlist({ watchlistId: newList.id, ticker })
          ).then(() => showFeedback(`Created list and added stock`, "success"));
          setNewTitle("");
          setIsCreating(false);
        })
        .catch(() => showFeedback("Failed to create list", "error"));
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={handleClick} size="small">
        {isInAnyList ? (
          <StarIcon sx={{ fill: "var(--action-color)" }} />
        ) : (
          <StarBorderIcon sx={{ color: "var(--text-color-grey-scale)" }} />
        )}
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: { backgroundImage: "none" },
        }}>
        <List sx={{ width: 250, p: 0 }}>
          <ListItem
            sx={{
              pb: 1,
              pt: 2,
              borderBottom: "1px solid var(--border-input-fields)",
            }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: "bold",
                fontFamily: "var(--font-family)",
                color: "var(--header-color)",
              }}>
              Add to Watchlist
            </Typography>
          </ListItem>

          {watchlists.length === 0 && !isCreating && (
            <ListItem>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ p: 2, fontFamily: "var(--font-family)" }}>
                No watchlists found.
              </Typography>
            </ListItem>
          )}

          {watchlists.map((list) => {
            const checked = isStockInList(list);
            return (
              <ListItem key={list.id} disablePadding>
                <ListItemButton
                  role={undefined}
                  onClick={(event) => handleToggle(list, event)}
                  dense
                  sx={{
                    "&:hover": {
                      backgroundColor: "var(--action-color-more-transparent)",
                    },
                  }}>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={!!checked}
                      tabIndex={-1}
                      disableRipple
                      size="small"
                      sx={{
                        color: "var(--text-color-grey-scale)",
                        "&.Mui-checked": { color: "var(--action-color)" },
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={list.title}
                    primaryTypographyProps={{
                      style: {
                        fontFamily: "var(--font-family)",
                        color: "var(--header-color)",
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}

          <Divider sx={{ borderColor: "var(--border-input-fields)" }} />

          {isCreating ? (
            <ListItem
              sx={{
                display: "flex",
                gap: 1,
                flexDirection: "column",
                alignItems: "stretch",
                p: 2,
              }}>
              <input
                autoFocus
                style={{
                  padding: "8px",
                  width: "100%",
                  boxSizing: "border-box",
                  backgroundColor: "transparent",
                  border: "1px solid var(--border-input-fields)",
                  color: "var(--header-color)",
                  fontFamily: "var(--font-family)",
                  outline: "none",
                  fontSize: "0.875rem",
                }}
                placeholder="List Name"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.key === "Enter" && handleCreateQuick(e)}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleCreateQuick}
                disabled={!newTitle.trim()}
                sx={{
                  mt: 1,
                  bgcolor: "var(--action-color)",
                  color: "black",
                  fontWeight: "bold",
                  "&:hover": { bgcolor: "var(--action-color)" },
                }}>
                Create & Add
              </Button>
            </ListItem>
          ) : (
            <ListItemButton
              onClick={(e) => {
                e.stopPropagation();
                setIsCreating(true);
              }}>
              <ListItemIcon>
                <AddIcon
                  fontSize="small"
                  sx={{ color: "var(--action-color)" }}
                />
              </ListItemIcon>
              <ListItemText
                primary="Create new list"
                primaryTypographyProps={{
                  style: {
                    fontFamily: "var(--font-family)",
                    color: "var(--action-color)",
                  },
                }}
              />
            </ListItemButton>
          )}
        </List>
      </Popover>

      {/* Removed local Snackbar component */}
    </>
  );
};

export default StarMenu;
