import React from 'react';
import { AppBar, Toolbar, Button, Typography, IconButton } from '@mui/material';
import BookIcon from '@mui/icons-material/Book'; // 书籍图标
import { useNavigate } from 'react-router-dom';

const TopBar = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();

  const appBarStyle = {
    backgroundColor: '#4a4e69',
    color: '#f2e9e4',
  };

  const buttonStyle = {
    margin: '0 10px',
    color: '#f2e9e4',
    '&:hover': {
      backgroundColor: '#9a8c98',
    },
  };

  return (
    <AppBar position="static" style={appBarStyle}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          aria-label="book menu"
          sx={{ mr: 2 }}
          style={{ color: appBarStyle.color }}
        >
          <BookIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontFamily: "'Merriweather', serif" }}>
          BookForum
        </Typography>
        {/* welcome the user */}
        {isLoggedIn && (
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontFamily: "'Merriweather', serif" }}>
            Welcome, {localStorage.getItem('username')}!
          </Typography>
        )}
        {isLoggedIn && (
          <>
            <Button style={buttonStyle} onClick={() => navigate('')}>
              📚 All Books
            </Button>
            <Button style={buttonStyle} onClick={() => navigate('/myListings')}>
              📖 My BookShelf
            </Button>
            <Button style={buttonStyle} onClick={() => navigate(`/userCenter/${localStorage.getItem('username')}`)}>
              👤 User Center
            </Button>
            <Button style={buttonStyle} onClick={onLogout}>
              🚪 Logout
            </Button>
          </>
        )}
        {!isLoggedIn && (
          <Button style={buttonStyle} onClick={() => navigate('/login')}>
            🔓 Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
