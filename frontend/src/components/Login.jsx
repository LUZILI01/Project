import React, { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { loginUser } from '../services/userApi'
import { Button, TextField, Container, Typography, Box, Alert, Link, Grid } from '@mui/material'
import { useSnackbar } from './SnackbarManager'

function Login () {
  const navigate = useNavigate()
  // used to open the snackbar on successful message
  const triggerSnackbar = useSnackbar()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    setError('')

    try {
      const data = await loginUser({ email, password })
      console.log(data)
      localStorage.setItem('token', data.data.data.token)
      localStorage.setItem('email', data.data.data.user.email)
      localStorage.setItem('username', data.data.data.user.username)
      triggerSnackbar('Login successful', 'success')
      // After showing the success message, navigate to the home page
      setTimeout(() => navigate('/Home'), 2000)
    } catch (error) {
      setError('Login failed. Please check your email and password.')
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address or Username"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Login
          </Button>
          {/* jump to register */}
          <Grid container>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  )
}

export default Login
