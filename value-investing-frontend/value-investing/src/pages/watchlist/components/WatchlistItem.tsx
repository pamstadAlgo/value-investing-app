import React from "react";
import { Typography, ListItem, ListItemButton } from "@mui/material";

type WatchListItemProps = {
  id: number;
  isActive: boolean;
  title: string;
  setActiveItem: React.Dispatch<React.SetStateAction<number | null>>;
};

function WatchlistItem({
  id,
  isActive,
  title,
  setActiveItem,
}: WatchListItemProps) {
  return (
    <ListItem key={id} disablePadding>
      <ListItemButton
        onClick={() => setActiveItem(id)}
        sx={{
          height: "40px",
          borderLeft: isActive
            ? "3px solid var(--action-color)"
            : "3px solid transparent",
          backgroundColor: isActive
            ? "var(--action-color-more-transparent)"
            : "transparent",
          color: isActive ? "var(--action-color)" : "var(--header-color)",
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
          {title}
        </Typography>
        {/* </Tooltip> */}
      </ListItemButton>
    </ListItem>
  );
}

export default WatchlistItem;
