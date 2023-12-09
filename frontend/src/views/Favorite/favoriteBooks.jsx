import React, { useState, useEffect } from 'react';
import { getCollectList } from '../../services/userApi';
import BookCard from '../home/component/BookCard';
import { Typography } from '@mui/material';

const FavoritesList = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    getCollectList().then((response) => {
      const booksData = response.data?.data || [];
      setFavorites(booksData);
    });
  }, []);

  return (
    <div>
      <Typography variant="h5">
        My Favorites ({favorites.length})
      </Typography>
      {favorites.map((book) => (
        <BookCard key={book.bookId} book={book} showUncollectOnly imageHeight='20%' imageWidth='20%'/>
      ))}
    </div>
  );
};

export default FavoritesList;
