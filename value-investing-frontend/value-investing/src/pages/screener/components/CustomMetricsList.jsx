import React from "react";
// import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import "../styles.css";
import ListItemIcon from "@mui/material/ListItemIcon";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";

function CustomMetricsList({ customMetrics, handleMetricDelete }) {
  return (
    <List
      className="custom-list-transparent"
      dense
      sx={{
        width: "100%",
        maxWidth: 360,
        maxHeight: "170px",
        overflow: "scroll",
        overflowX: "hidden",
        overflowY: "auto",
      }}>
      {customMetrics.map((metric) => {
        const labelId = `checkbox-list-secondary-label-${metric.id}`;
        return (
          <ListItem
            key={metric.id}
            secondaryAction={
              <div className="checkbox-wrapper-div">
                <IconButton
                  style={{ padding: "4px" }}
                  aria-label="delete"
                  className="custom-iconbutton-list">
                  <EditIcon className="icon-custom-metrics-list" />
                </IconButton>
                <IconButton
                  onClick={(e) => handleMetricDelete(e, metric.id)}
                  style={{ padding: "4px" }}
                  aria-label="delete"
                  className="custom-iconbutton-list">
                  <DeleteIcon className="icon-custom-metrics-list" />
                </IconButton>
              </div>
            }
            disablePadding>
            <ListItemButton
              className="custom-list-item-button"
              style={{ gap: "10px", paddingLeft: "8px" }}>
              <ListItemIcon className="custom-list-icon">
                <CalculateOutlinedIcon />
              </ListItemIcon>
              {/* <ListItemAvatar>
                <Avatar
                  alt={`Avatar n°${value + 1}`}
                  src={`/static/images/avatar/${value + 1}.jpg`}
                />
              </ListItemAvatar> */}
              <ListItemText
                className="list-item-text-custom"
                id={metric.id}
                primary={metric.readable_name}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}

export default CustomMetricsList;
