import React, { useState } from 'react';
import Box from '@mui/material/Box';
import NavBar from './NavBar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    // Outer Container
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'var(--background-color)' }}>
      
      {/* 1. Sidebar */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
      />

      {/* 2. Main Layout Area */}
      <Box 
        component="main" 
        sx={{ 
            flexGrow: 1, 
            // DYNAMIC WIDTH: Uses the variable from App.css
            width: { md: `calc(100% - var(--drawer-width))` },
            display: 'flex',
            flexDirection: 'column'
        }}
      >
        <NavBar handleDrawerToggle={handleDrawerToggle} />
        
        {/* Page Content */}
        <Box sx={{ p: 3, flexGrow: 1 }}>
           {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;