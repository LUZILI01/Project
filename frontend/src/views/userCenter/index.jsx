import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, Rating, CardActions, IconButton } from '@mui/material';
import { getUserInfo, deleteReview } from '../../services/userApi';
import { useSnackbar } from '../../components/SnackbarManager';
import DeleteIcon from '@mui/icons-material/Delete';

const UserCenter = () => {
  const [listing, setListing] = useState([]);
  const [error, setError] = useState(null);
  const showSnackbar = useSnackbar();

  useEffect(() => {
    getUserInfo(localStorage.getItem('username'))
      .then(response => {
        response = response.data
        if (response.code === 200 && response.data) {
          setListing(response.data);
        } else {
          setError('Comments not found');
        }
      })
      .catch(err => setError(err.message));
  }, []);

  const handleDeleteReview = async (bookId, reviewId) => {
    try {
      await deleteReview(bookId, reviewId);
      showSnackbar('Deleted! Please refresh the page to see the changes.', 'success');
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!listing) {
    return <div>Loading...</div>;
  }

  return (
    <Grid container spacing={2}>
      {/* Reviews */}
      {listing.reviews && (
        <Grid item xs={12}>
          <Box sx={{ p: 2 }}>
          <Typography variant="h6">My Reviews(Total:{listing.reviews.length}):</Typography>
            {listing.reviews.map((reviewObj, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="body2" gutterBottom>
                    {reviewObj.review.comment} {/* 显示评论 */}
                  </Typography>
                  <Rating
                    value={reviewObj.review.score}
                    readOnly
                    precision={0.5}
                  /> {/* 显示星星评分 */}
                  <Typography variant="caption" display="block" gutterBottom>
                    Posted by: {reviewObj.username || 'Anonymous'} on {new Date(reviewObj.timestamp * 1000).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton onClick={() => handleDeleteReview(reviewObj.book_id, reviewObj.review_id)} aria-label="delete review">
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default UserCenter
