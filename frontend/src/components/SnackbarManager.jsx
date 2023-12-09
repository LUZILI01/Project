// SnackbarManager.jsx
import React, { createContext, useState, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';

// Create a context for the snackbar state
const SnackbarContext = createContext({
  snackbar: { open: false, message: '', type: 'info' },
  setSnackbar: () => {},
});

// Custom hook to control the snackbar
export const useSnackbar = () => {
  const { setSnackbar } = useContext(SnackbarContext);
  return (message, type = 'info') => {
    setSnackbar({ open: true, message, type });
  };
};

// Provider component that includes the MUI Snackbar
export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success',
  });

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <SnackbarContext.Provider value={{ snackbar, setSnackbar }}>
      <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={snackbar.type} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      {children}
    </SnackbarContext.Provider>
  );
};
