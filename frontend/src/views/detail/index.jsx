import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, Grid, Box, Paper, Rating } from '@mui/material';
import { getListing } from '../../services/userApi';
import { useSnackbar } from '../../components/SnackbarManager';
import ReviewForm from './component/ReviewForm';

const ListingDetails = () => {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const showSnackbar = useSnackbar();

  useEffect(() => {
    getListing(listingId)
      .then(response => {
        response = response.data
        if (response.code === 200 && response.data) {
          setListing(response.data);
          showSnackbar('Detail loaded', 'success');
        } else {
          setError('Detail not found');
        }
      })
      .catch(err => setError(err.message));
  }, [listingId, reviewSubmitted]);

  const handleReviewSubmit = () => {
    setReviewSubmitted(true);
    getListing(listingId).then(response => setListing(response.data));
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!listing) {
    return <div>Loading...</div>;
  }

  return (
    <Grid container spacing={2}>
      {/* Detail info */}
      <Grid item xs={12}>
        <Card>
          <CardMedia
            component="img"
            style={{ height: '15%', objectFit: 'contain', width: '20%' }}
            image={`${listing.Cover}`}
            alt={`Cover of ${listing.Title}`}
          />
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {listing.Title}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Author: {listing.Author}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Genre: {listing.Genre}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {listing.Description}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {`ISBN: ${listing.ISBN}`}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {`Added On: ${new Date(listing.date_added).toLocaleDateString()}`}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Review form */}
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 2 }}>
          <ReviewForm listingId={listingId} onReviewSubmit={handleReviewSubmit} reviews={listing.reviews} />
        </Paper>
      </Grid>

      {/* Reviews */}
      {listing.reviews && listing.reviews.length > 0 && (
        <Grid item xs={12}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Reviews(Total:{listing.reviews.length}):</Typography>
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
              </Card>
            ))}
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default ListingDetails;
