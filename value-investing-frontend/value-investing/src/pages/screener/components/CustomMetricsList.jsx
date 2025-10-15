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

function CustomMetricsList() {
  return (
    <List
      dense
      sx={{
        width: "100%",
        maxWidth: 360,
        maxHeight: "170px",
        overflow: "scroll",
        bgcolor: "transparent",
      }}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => {
        const labelId = `checkbox-list-secondary-label-${value}`;
        return (
          <ListItem
            key={value}
            secondaryAction={
              <div className="checkbox-wrapper-div">
                <IconButton
                  style={{ padding: "4px" }}
                  aria-label="delete"
                  className="custom-iconbutton-list">
                  <EditIcon className="icon-custom-metrics-list" />
                </IconButton>
                <IconButton
                  style={{ padding: "4px" }}
                  aria-label="delete"
                  className="custom-iconbutton-list">
                  <DeleteIcon className="icon-custom-metrics-list" />
                </IconButton>

                {/* <Checkbox
                  className="custom-checkbox"
                  edge="end"
                  //   onChange={handleToggle(value)}
                  //   checked={checked.includes(value)}
                  inputProps={{ "aria-labelledby": labelId }}
                /> */}
                {/* <Checkbox
                  className="custom-checkbox"
                  edge="end"
                  //   onChange={handleToggle(value)}
                  //   checked={checked.includes(value)}
                  inputProps={{ "aria-labelledby": labelId }}
                /> */}
              </div>
            }
            disablePadding>
            <ListItemButton style={{ gap: "10px", paddingLeft: "8px" }}>
              <ListItemIcon className="custom-list-icon">
                <CalculateOutlinedIcon />
              </ListItemIcon>
              {/* <ListItemAvatar>
                <Avatar
                  alt={`Avatar n°${value + 1}`}
                  src={`/static/images/avatar/${value + 1}.jpg`}
                />
              </ListItemAvatar> */}
              <ListItemText id={labelId} primary={`Line item ${value + 1}`} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}

export default CustomMetricsList;
