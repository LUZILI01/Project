import React, { useState, useEffect } from 'react';
import { Grid, Tabs, Tab, Modal, Button, Box, TextField, IconButton, Typography, Card, CardContent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getListings, searchListings } from '../../services/userApi';
import BookCard from './component/BookCard';
import AddBookForm from './component/AddBookForm';
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

const ListingsGrid = () => {
  // const [open, setOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchString, setSearchString] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);

  const handleOpenAddModal = () => {
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setIsLoading(true);
    const category = categories[newValue];
    const query = category === 'All' ? {} : { Genre: category }; // Adjust based on how your API expects the query

    (category === 'All' ? getListings() : searchListings(query))
      .then(response => {
        const booksData = response.data?.data || [];
        setBooks(booksData);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error);
        setIsLoading(false);
      });
  };

  const handleSearch = () => {
    setIsLoading(true);
    const query = { searchString };
    searchListings(query)
      .then(response => {
        const booksData = response.data?.data || [];
        setBooks(booksData);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error);
        setIsLoading(false);
      });
  };

  const handleAddBook = (bookData) => {
    console.log(bookData);
  };

  useEffect(() => {
    handleTabChange(null, activeTab); // Fetch data on initial render or when the active tab changes
  }, [activeTab]);

  useEffect(() => {
    const filteredBooksData = books.filter(book =>
      book.Title.toLowerCase().includes(searchString.toLowerCase())
    );
    setFilteredBooks(filteredBooksData);
  }, [books, searchString]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };
  return (
    <>
      <Tabs value={activeTab} onChange={handleTabChange} aria-label="book categories">
        {categories.map((category, index) => (
          <Tab key={index} label={category} />
        ))}
      </Tabs>
      <Card style={{ marginTop: '10px', marginBottom: '10px' }}>
  <CardContent>
    <Typography variant="h6" component="div">
      {`🚀Total results: ${filteredBooks.length}`}
    </Typography>
  </CardContent>
  </Card>
      <div style={{ display: 'flex', alignItems: 'center' }}>
      <TextField
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
        placeholder="Search by Book Title"
        variant="outlined"
        style={{ marginRight: '10px' }}
      />
      <IconButton onClick={handleSearch}>
        <SearchIcon />
      </IconButton>
    </div>
    {localStorage.getItem('username') === 'admin' && (
  <Button variant="contained" onClick={handleOpenAddModal}>
    Add Book
  </Button>
    )}
    <Modal
      open={openAddModal}
      onClose={handleCloseAddModal}
      aria-labelledby="add-book-modal"
    >
      <Box sx={modalStyle}>
        <AddBookForm onAddBook={handleAddBook} handleClose={handleCloseAddModal} />
      </Box>
    </Modal>

      <Grid container spacing={4} style={{ marginTop: '10px' }}>
        {filteredBooks.map((book) => (
          <Grid item key={book._id} xs={12} sm={6} md={4} lg={3}>
            <BookCard book={book} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default ListingsGrid;
