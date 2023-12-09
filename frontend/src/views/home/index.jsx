import React from 'react';
import { Typography, Box } from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import { useSnackbar } from '../../components/SnackbarManager';
import TopBar from './component/TopBar';
function Home () {
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();

  const handleLogout = () => {
    // Clear user token or user state
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    showSnackbar('Logout successful', 'success');
    // Navigate to the landing page
    navigate('/');
  };
  // Simple check for auth
  const isLoggedIn = localStorage.getItem('token');

  return (
    <Box sx={{ flexGrow: 1 }}>
      <TopBar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Outlet />
        </Typography>
      </Box>
    </Box>
  );
}

export default Home;
