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
import { useSelector } from "react-redux";
import WatchlistItem from "./WatchlistItem";
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
  // divide watchlists into my own watch lists and of other users
  const userId = useSelector((state) => state.session?.userId);

  const ownWatchLists = watchlists.filter((item) => item.owner === userId);
  const otherWatchLists = watchlists.filter((item) => item.owner !== userId);

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
        <div className="title-watch-list-items">MY WATCHLISTS</div>
        {ownWatchLists?.length > 0 &&
          ownWatchLists.map((item) => {
            return (
              <WatchlistItem
                id={item.id}
                isActive={activeListId === item.id}
                title={item.title}
                setActiveItem={onSelect}
              />
            );
          })}

        {otherWatchLists?.length > 0 && (
          <div className="title-watch-list-items" style={{marginTop: "32px"}}>SHARED WITH ME</div>
        )}
        {otherWatchLists?.length > 0 &&
          otherWatchLists.map((item) => {
            return (
              <WatchlistItem
                id={item.id}
                isActive={activeListId === item.id}
                title={item.title}
                setActiveItem={onSelect}
              />
            );
          })}

        {/* {watchlists.map((list) => {
          const isActive = activeListId === list.id;
          return (
            <WatchlistItem
              id={list.id}
              isActive={isActive}
              title={list.title}
              setActiveItem={onSelect}
            />
          );
        })} */}
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
