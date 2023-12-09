import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, CardActions, Button } from '@mui/material';
import { collectListing, uncollectListing, deleteBook } from '../../../services/userApi';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from '../../../components/SnackbarManager';
const BookCard = ({ book, showUncollectOnly, imageWidth = '100%', imageHeight = 'auto' }) => {
  const handleCollect = () => {
    collectListing(book.bookId);
  };

  const handleUncollect = () => {
    uncollectListing(book.bookId);
  };
  const showSnackbar = useSnackbar();
  const handleDelete = async () => {
    await deleteBook(book.bookId);
    showSnackbar('Deleted! Please refresh the page to see the changes.', 'success');
  }
  return (
    <Card>
      <CardMedia
        component="img"
        style={{ width: imageWidth, height: imageHeight }}
        alt={book.Title}
        image={book.Cover} // Add this line
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {book.Title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Author: {book.Author}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Genre: {book.Genre}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ISBN: {book.ISBN}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" component={Link} to={`/listing/${book.bookId}`}>
          View Details🚩
        </Button>
        <CardActions>
          {!showUncollectOnly && (
            <Button size="small" onClick={handleCollect}>
              <Favorite /> Collect
            </Button>
          )}
          <Button size="small" onClick={handleUncollect}>
            <FavoriteBorder /> Uncollect
          </Button>
          {localStorage.getItem('username') === 'admin' && (
            <Button size="small" onClick={handleDelete}>
              <DeleteIcon /> Delete
            </Button>
          )}
        </CardActions>
      </CardActions>
    </Card>
  );
};

export default BookCard;
