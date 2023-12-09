import React, { useState } from 'react';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Rating, Typography, Box, TextField, Button, Tooltip } from '@mui/material';
import { submitReview } from '../../../services/userApi';

const ReviewForm = ({ listingId, onReviewSubmit, reviews = [] }) => {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedRating, setSelectedRating] = useState(null);

  const handleReviewSubmit = () => {
    const reviewData = {
      review: {
        score,
        comment,
        publishedAt: new Date().toISOString()
      }
    };

    submitReview(listingId, reviewData).then(() => {
      onReviewSubmit(); // notify parent component
    });
  };
  if (!Array.isArray(reviews)) {
    console.error('reviews prop must be an array');
    return <div>Error: Invalid reviews data</div>;
  }
  // clalculate rating breakdown
  const calculateRatingBreakdown = () => {
    const breakdown = new Array(5).fill(0);
    reviews.forEach(review => {
      const index = Math.floor(review.score) - 1;
      breakdown[index]++;
    });
    return breakdown;
  };

  // format tooltip text
  const formatTooltipText = (breakdown) => {
    const total = reviews.length;
    return breakdown.map((count, index) => {
      const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
      return `${index + 1} starts：${count} (${percentage}%)`;
    }).join('\n');
  };

  const ratingBreakdown = calculateRatingBreakdown();
  const tooltipText = formatTooltipText(ratingBreakdown);

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', my: 2 }}>
      <Typography variant="h6">Leave a Review</Typography>
      <Tooltip title={tooltipText} arrow>
        <div>
          <Rating
            name="score"
            value={score}
            precision={0.5}
            emptyIcon={<StarBorderIcon fontSize="inherit" />}
            onChange={(event, newValue) => {
              setScore(newValue);
              setSelectedRating(newValue);
            }}
          />
        </div>
      </Tooltip>
      <TextField
        label="Comment"
        multiline
        fullWidth
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleReviewSubmit}>
        Submit Review
      </Button>

      {/* Displaying reviews for selected rating */}
      {selectedRating && (
        <Box>
          <Typography variant="h6">Reviews for {selectedRating} Star Rating</Typography>
          {reviews.filter(review => Math.floor(review.score) === selectedRating).map((review, index) => (
            <Box key={index}>
              <Typography variant="body1">{review.comment}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ReviewForm;
