import React, { useState, useEffect } from 'react';
import { makeBooking } from '../../../services/userApi';
import { Typography, TextField, Button, Grid, Box, Paper } from '@mui/material';
import { useSnackbar } from '../../../components/SnackbarManager';

const BookingForm = ({ listingId, pricePerNight, onBookingComplete, setBookingId }) => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [totalPrice, setTotalPrice] = useState(0);
  const snackbar = useSnackbar();
  const calculateTotalPrice = (startDate, endDate) => {
    console.log(startDate, endDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end - start;
    const days = timeDifference / (1000 * 3600 * 24);
    return days * pricePerNight;
  };

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      setTotalPrice(calculateTotalPrice(dateRange.start, dateRange.end));
    }
  }, [dateRange]);

  const handleBookSubmit = async () => {
    const bookingData = {
      dateRange,
      totalPrice: calculateTotalPrice(dateRange.start, dateRange.end)
    };

    try {
      const response = await makeBooking(listingId, bookingData);
      if (response && response.data) {
        if (response.data.error) {
          snackbar(response.data.error, 'error');
        } else {
          setBookingId(response.data.bookingId);
          const { bookingId } = response.data;
          const bookInfo = {
            listingId,
            bookingId,
            totalPrice: calculateTotalPrice(dateRange.start, dateRange.end),
            startDate: dateRange.start,
            endDate: dateRange.end
          }
          localStorage.setItem('bookingId', JSON.stringify(bookInfo));
          snackbar('Booking successful', 'success');
          onBookingComplete();
        }
      } else {
        snackbar('Booking response is undefined', 'error');
      }
    } catch (error) {
      snackbar(error.response?.data?.error || 'Booking request failed', 'error');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Book Your Stay</Typography>
      <Box component="form" noValidate autoComplete="off">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" gutterBottom>
              {`Total Price: $${totalPrice}`}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleBookSubmit}>
              Book Now
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default BookingForm;
