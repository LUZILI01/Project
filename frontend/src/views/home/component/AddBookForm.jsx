import React, { useState } from 'react';
import {
  TextField, Button, FormControl, Typography,
  InputLabel, Select, MenuItem, Box
} from '@mui/material';
import { createListing } from '../../../services/userApi';
import { useSnackbar } from '../../../components/SnackbarManager';
const AddBookForm = ({ onAddBook, handleClose }) => {
  const [bookData, setBookData] = useState({
    Title: '',
    Author: '',
    Genre: '',
    Description: '',
    ISBN: '',
    Cover: '',
  });
  const categories = [
    'All',
    'Children\'s Literature',
    'Travel',
    'Celebrity Biographies',
    'Fiction',
    'Science & Technology',
    'Self-Help & Motivation',
    'History & Politics',
    'Cooking & Gastronomy'
  ];
  const showSnackbar = useSnackbar();
  const handleInputChange = (e) => {
    if (e.target.name === 'Cover') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBookData({ ...bookData, Cover: reader.result });
      };
      reader.readAsDataURL(e.target.files[0]);
    } else {
      setBookData({ ...bookData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createListing(bookData); // Synchronously call createListing
      onAddBook(bookData);
      showSnackbar('Book added! Please refresh the page to see the changes', 'success');
      handleClose()
      setBookData({
        Title: '',
        Author: '',
        Genre: '',
        Description: '',
        ISBN: '',
        Cover: '',
      });
    //   setOpen(false);
    } catch (error) {
      showSnackbar('Error adding book', 'error');
    }
  };

  return (
        <form onSubmit={handleSubmit}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Add a New Book
            </Typography>
            <Box sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}>
                <TextField
                    label="Title"
                    name="Title"
                    value={bookData.Title}
                    onChange={handleInputChange}
                    required
                />
                <TextField
                    label="Author"
                    name="Author"
                    value={bookData.Author}
                    onChange={handleInputChange}
                    required
                />
                <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel id="genre-label">Genre</InputLabel>
                <Select
                    labelId="genre-label"
                    label="Genre"
                    name="Genre"
                    value={bookData.Genre}
                    onChange={handleInputChange}
                    required
                >
                    {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                        {category}
                    </MenuItem>
                    ))}
                </Select>
                </FormControl>
                <TextField
                    label="Description"
                    name="Description"
                    value={bookData.Description}
                    multiline
                    rows={4}
                    onChange={handleInputChange}
                />
                <TextField
                    label="ISBN"
                    name="ISBN"
                    value={bookData.ISBN}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="file"
                    name="Cover"
                    onChange={handleInputChange}
                    accept="image/*"
                />
                <Button type="submit" variant="contained" sx={{ m: 1 }}>
                    Add Book
                </Button>
            </Box>
        </form>
  );
};

export default AddBookForm;
