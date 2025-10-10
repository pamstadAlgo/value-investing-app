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
import Container from "@mui/material/Container";
import AdbIcon from "@mui/icons-material/Adb";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import CompanyLogo from "./CompanyLogo";

//const drawerWidth = 240;

const pages = ["Screener", "Valuation"];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

function NavBar() {
  const navigate = useNavigate();

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

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

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // const drawer = (
  //   <div>
  //     {/* <Toolbar /> */}
  //     <div className="nav-bar-logo">COMPANY LOGO</div>
  //     <Divider />
  //     <List>
  //       {navItemNames.map((text, index) => (
  //         <ListItem key={text} disablePadding>
  //           <ListItemButton onClick={() => navigate(navURLs[index])}>
  //             <ListItemIcon>
  //               {navBarIcons[index]}
  //               {/* {index % 2 === 0 ? <InboxIcon /> : <MailIcon />} */}
  //             </ListItemIcon>
  //             <ListItemText primary={text} />
  //           </ListItemButton>
  //         </ListItem>
  //       ))}
  //     </List>
  //     <Divider />
  //   </div>
  // );

  return (
    <AppBar position="static" className="nav-bar-custom">
      <Container maxWidth="xl">
        <Toolbar disableGutters className="mui-toolbar-custom">
          {/* <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} /> */}
          <div className="company-name-left-side flex-box-wrapper-logo">
            <CompanyLogo />
            <h2 className="header-color-black-scale ">StockVal</h2>
          </div>
          {/* <Typography
            variant="h6"
            noWrap
            component="a"
            classes="text-color-grey-scale"
            // className="text-color-grey-scale"
            // href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              // fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "red",
              // color: "inherit",
              textDecoration: "none",
            }}>
            LOGO
          </Typography> */}

          {/* hamburger menu that gets only display when screen size is xs */}
          {/* <Box sx={{ display: { xs: "flex", md: "none" } }}> */}
          <div className="wrapper-hamburger-menu">
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit">
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}>
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography sx={{ textAlign: "center" }}>{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </div>
          {/* </Box> */}
          <div className="company-name-middle flex-box-wrapper-logo">
            <CompanyLogo />
            <h2 className="header-color-black-scale ">StockVal</h2>
          </div>
          {/* <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}>
            LOGO
          </Typography> */}
          {/* <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}> */}
          <div className="nav-items-flexbox-wraper">
            {pages.map((page) => (
              <a
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: "white", display: "block" }}>
                {page}
              </a>
            ))}
          </div>
          {/* </Box> */}

          <Box sx={{ flexGrow: 0 }}>
            {/* <Tooltip title="Open settings"> */}
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar
                className="custom-avatar"
                alt="Remy Sharp"
                src="/static/images/avatar/2.jpg"
              />
            </IconButton>
            {/* </Tooltip> */}
            {/* Avatar Menu which we don't need for the moment */}
            {/* <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}>
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography sx={{ textAlign: "center" }}>
                    {setting}
                  </Typography>
                </MenuItem>
              ))}
            </Menu> */}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
    // <div className="header-wrapper">
    //   <AppBar position="sticky" className="app-bar-mui-component">
    //     <Toolbar>
    //       <IconButton
    //         color="inherit"
    //         aria-label="open drawer"
    //         edge="start"
    //         onClick={handleDrawerToggle}
    //         sx={{ mr: 2, display: { sm: "none" } }}>
    //         <MenuIcon />
    //       </IconButton>
    //       <Typography variant="h6" noWrap component="div">
    //         Responsive drawer
    //       </Typography>
    //     </Toolbar>
    //   </AppBar>
    //   <div className="wrapper-div-drawer">
    //     <Drawer
    //       // container={container}
    //       variant="temporary"
    //       open={mobileOpen}
    //       onTransitionEnd={handleDrawerTransitionEnd}
    //       onClose={handleDrawerClose}
    //       ModalProps={{
    //         keepMounted: true, // Better open performance on mobile.
    //       }}
    //       sx={{
    //         display: { xs: "block", sm: "none" },
    //         "& .MuiDrawer-paper": {
    //           boxSizing: "border-box",
    //           width: drawerWidth,
    //         },
    //       }}>
    //       {drawer}
    //     </Drawer>
    //     <Drawer
    //       variant="permanent"
    //       className="navigation-drawer"
    //       sx={{
    //         display: { xs: "none", sm: "block" },
    //       }}
    //       open>
    //       {drawer}
    //     </Drawer>
    //   </div>
    // </div>
  );
}

export default NavBar;
