import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MailIcon from "@mui/icons-material/Mail";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import Toolbar from "@mui/material/Toolbar";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import "./styles.css";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import GroupsIcon from "@mui/icons-material/Groups";
const drawerWidth = 240;

function NavBar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const navBarIcons = [<QueryStatsIcon />, <PriceCheckIcon />, <GroupsIcon />];
  const navURLs = ["/screener", "/valuation", "/mcc"];
  const navItemNames = ["Screener", "Valuation", "MicroCap Club"];

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const drawer = (
    <div>
      {/* <Toolbar /> */}
      <div className="nav-bar-logo">COMPANY LOGO</div>
      <Divider />
      <List>
        {navItemNames.map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={() => navigate(navURLs[index])}>
              <ListItemIcon>
                {navBarIcons[index]}
                {/* {index % 2 === 0 ? <InboxIcon /> : <MailIcon />} */}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </div>
  );

  return (
    <div className="header-wrapper">
      <AppBar position="sticky" className="app-bar-mui-component">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Responsive drawer
          </Typography>
        </Toolbar>
      </AppBar>
      <div className="wrapper-div-drawer">
        <Drawer
          // container={container}
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}>
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          className="navigation-drawer"
          sx={{
            display: { xs: "none", sm: "block" },
          }}
          open>
          {drawer}
        </Drawer>
      </div>
    </div>
  );
}

export default NavBar;
