import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
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
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import NightlightOutlinedIcon from "@mui/icons-material/NightlightOutlined";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Slide from "@mui/material/Slide";
import PropTypes from "prop-types";
import CssBaseline from "@mui/material/CssBaseline";
import { NavLink } from "react-router-dom";

// const pages = ["Screener", "Valuation"];

const pages = [
  { name: "Screener", path: "/screener" },
  { name: "Valuation", path: "/valuation" },
  // { name: "Contact", path: "/contact" },
];

const settings = ["Profile", "Account", "Dashboard", "Logout"];
function HideOnScroll(props) {
  // console.log()
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
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
  const navigate = useNavigate();
  // const { children, window } = props;

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const navBarIcons = [<QueryStatsIcon />, <PriceCheckIcon />, <GroupsIcon />];
  const navURLs = ["/screener", "/valuation", "/mcc"];
  const navItemNames = ["Screener", "Valuation", "MicroCap Club"];

  const [theme, setTheme] = useState(() => {
    // Load saved theme from localStorage, default to "light"
    return localStorage.getItem("theme") || "light";
  });

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

  useEffect(() => {
    document.body.classList.toggle("dark-theme", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

    // document.body.classList.toggle("dark-theme", true);
  };

  return (
    <HideOnScroll {...props}>
      <AppBar position="sticky" className="nav-bar-custom">
        <Container maxWidth="xl">
          <Toolbar disableGutters className="mui-toolbar-custom">
            {/* <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} /> */}
            <div className="company-name-left-side flex-box-wrapper-logo">
              <CompanyLogo />
              <h2 className="header-color-black-scale ">StockVal</h2>
            </div>
            <div className="wrapper-hamburger-menu">
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit">
                <MenuIcon className="hamburger-icon-svg" />
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
                  <MenuItem key={page.path} onClick={handleCloseNavMenu}>
                    <Typography sx={{ textAlign: "center" }}>
                      {page.name}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </div>
            {/* </Box> */}
            <div className="company-name-middle flex-box-wrapper-logo">
              <CompanyLogo />
              <h2 className="header-color-black-scale ">StockVal</h2>
            </div>
            <div className="nav-items-flexbox-wraper">
              {pages.map((page) => (
                <NavLink
                  key={page.name}
                  to={page.path}
                  className={({ isActive }) =>
                    "nav-link" + (isActive ? " active" : "")
                  }>
                  {page.name}
                </NavLink>
              ))}
              {/* {pages.map((page) => (
                <a
                  key={page}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: "white", display: "block" }}>
                  {page}
                </a>
              ))} */}
            </div>
            {/* </Box> */}

            <Box sx={{ flexGrow: 0 }}>
              {/* <Tooltip title="Open settings"> */}
              {theme === "light" ? (
                <IconButton
                  aria-label="delete"
                  style={{ marginRight: "8px" }}
                  sx={{ color: "black" }}
                  onClick={handleThemeToggle}>
                  <NightlightOutlinedIcon sx={{ fill: "#6B7280" }} />
                </IconButton>
              ) : (
                <IconButton
                  aria-label="delete"
                  style={{ marginRight: "8px" }}
                  onClick={handleThemeToggle}>
                  <WbSunnyOutlinedIcon sx={{ fill: "#9CA3AF" }} />
                </IconButton>
              )}
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  className="custom-avatar"
                  alt="Remy Sharp"
                  src="/static/images/avatar/2.jpg"
                />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>
  );
}

export default NavBar;
