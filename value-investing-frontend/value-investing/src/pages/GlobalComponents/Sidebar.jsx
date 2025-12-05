import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';

const Sidebar = ({ mobileOpen, handleDrawerToggle, window }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // 1. Helper for Navigation Item Styles (Uses App.css variables)
  const getNavItemStyle = (path) => {
    const isActive = currentPath === path;
    return {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 24px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      borderLeft: isActive ? '3px solid var(--action-color)' : '3px solid transparent',
      backgroundColor: isActive ? 'var(--action-color-more-transparent)' : 'transparent',
      color: isActive ? 'var(--action-color)' : 'var(--text-color-grey-scale)',
      fontWeight: isActive ? 600 : 500,
      fontFamily: 'var(--font-family)', // Enforce App font
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontSize: '0.875rem',
    };
  };

  const drawerContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo Section */}
      <div style={{ 
          padding: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)' 
      }}>
        <div>
          <h1 style={{ 
              margin: 0, 
              color: 'var(--header-color)', 
              fontWeight: 'bold', 
              fontSize: '1.125rem',
              fontFamily: 'var(--font-family)'
          }}>
            A&F
          </h1>
          <span style={{ 
              color: 'var(--text-color-grey-scale)', 
              fontSize: '0.75rem', 
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
          }}>
            StockVal v1.0
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '24px 0' }}>
        <div style={getNavItemStyle('/screener')} onClick={() => navigate('/screener')}>
          Screener
        </div>
        <div style={getNavItemStyle('/valuation')} onClick={() => navigate('/valuation')}>
          Valuation
        </div>
        <div style={getNavItemStyle('/testing')} onClick={() => navigate('/testing')}>
          Testing
        </div>
      </nav>

      {/* Footer / Logout */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
        <div 
          style={{ ...getNavItemStyle('logout'), borderLeft: '3px solid transparent' }} 
          onClick={() => navigate('/')}
        >
          Sign Out
        </div>
      </div>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  // 2. Main Drawer Styles (Uses App.css variables)
  const drawerPaperStyles = { 
    boxSizing: 'border-box', 
    width: 'var(--drawer-width)', // Matches CSS variable
    borderRight: '1px solid rgba(255, 255, 255, 0.12)',
    backgroundColor: 'var(--background-color-nav-bar)', // Matches Dark Theme Background
    color: 'var(--header-color)',
    fontFamily: 'var(--font-family)',
  };

  return (
    <Box
      component="nav"
      sx={{ width: { md: 'var(--drawer-width)' }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        container={container}
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': drawerPaperStyles,
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': drawerPaperStyles,
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;