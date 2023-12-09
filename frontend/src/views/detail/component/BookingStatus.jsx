import React from 'react';
import { Box, Typography, Chip, Paper, Grid } from '@mui/material';

const getStatusColor = (status) => {
  switch (status) {
    case 'accepted':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'error';
    default:
      return 'default';
  }
};

const BookingStatus = ({ bookings }) => {
  if (!bookings || bookings.length === 0) {
    return <Typography variant="body1">No bookings for this listing.</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Booking Status:</Typography>
      {bookings.map((booking, index) => (
        <Box key={index} sx={{ mb: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <Grid container alignItems="center" spacing={1}>
            <Grid item>
              <Chip
                label={booking.status.toUpperCase()}
                color={getStatusColor(booking.status)}
              />
            </Grid>
            <Grid item xs>
              <Typography variant="body1">
                <strong>Total Price:</strong> ${booking.totalPrice}
              </Typography>
              <Typography variant="body1">
                <strong>Dates:</strong> {booking.dateRange.start} to {booking.dateRange.end}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      ))}
    </Paper>
  );
};

export default BookingStatus;
