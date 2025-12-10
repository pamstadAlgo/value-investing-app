import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import "./styles.css";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import NightlightOutlinedIcon from "@mui/icons-material/NightlightOutlined";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Slide from "@mui/material/Slide";
import PropTypes from "prop-types";

// User settings menu
const settings = ["Profile", "Account", "Dashboard", "Logout"];

function HideOnScroll(props) {
  const { children, window } = props;
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children ?? <div />}
    </Slide>
  );
}

HideOnScroll.propTypes = {
  children: PropTypes.element,
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

function NavBar(props) {
  const { handleDrawerToggle } = props;
  const [anchorElUser, setAnchorElUser] = useState(null);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  useEffect(() => {
    document.body.classList.toggle("light-theme", theme === "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <HideOnScroll {...props}>
      <AppBar 
        position="sticky" 
        className="nav-bar-custom"
        sx={{
            // --- FLOATING RIGHT ALIGNED STYLE ---
            width: 'auto', // Shrink to fit content
            maxWidth: '100%',
            right: 0,
            left: 'auto',
            marginLeft: 'auto', // Pushes the bar to the right
            marginRight: { md: '0px', xs: '0px' }, // Spacing from right edge
            marginTop: { md: '0px', xs: '0' }, // Float from top on desktop
            borderRadius: { md: '16px', xs: '0 0 16px 16px' }, // Rounded corners
            boxShadow: 'var(--box-shadow-glass-card)', // Use your glass shadow
            // ------------------------------------
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters className="mui-toolbar-custom" sx={{ minHeight: { md: '64px' } }}>
            
            {/* Hamburger (Mobile Only) */}
            <IconButton
              size="large"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              color="inherit"
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon className="hamburger-icon-svg" />
            </IconButton>

            {/* Right Side Settings */}
            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
              {theme === "light" ? (
                <IconButton
                  aria-label="switch theme"
                  style={{ marginRight: "8px" }}
                  sx={{ color: "black" }}
                  onClick={handleThemeToggle}>
                  <NightlightOutlinedIcon sx={{ fill: "#6B7280" }} />
                </IconButton>
              ) : (
                <IconButton
                  aria-label="switch theme"
                  style={{ marginRight: "8px" }}
                  onClick={handleThemeToggle}>
                  <WbSunnyOutlinedIcon sx={{ fill: "#9CA3AF" }} />
                </IconButton>
              )}
              
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  className="custom-avatar"
                  alt="User Avatar"
                  src="/static/images/avatar/2.jpg"
                />
              </IconButton>
              
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>
  );
}

export default NavBar;