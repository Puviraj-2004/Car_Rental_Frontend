'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Box, Container, Paper, Typography, TextField, 
  Button, Alert, InputAdornment, Link, Divider, Snackbar, IconButton 
} from '@mui/material';
import { 
  Email, Lock, Google, ArrowForward, 
  Visibility, VisibilityOff, Close as CloseIcon 
} from '@mui/icons-material';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL-இல் வரும் எரர்களைப் பிடிக்க (உதாரணமாக Google Login தோல்வி)
  const urlError = searchParams.get('error');

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🚀 Pop-up (Snackbar) மற்றும் Error States
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // URL-இல் ஏற்கனவே எரர் இருந்தால் அதை உடனே காட்ட
  useEffect(() => {
    if (urlError) {
      setErrorMessage("Authentication failed. Please try again.");
      setOpen(true);
    }
  }, [urlError]);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(""); // பழைய எரரை நீக்க
    setOpen(false);

    try {
      // 🚀 redirect: false மிக முக்கியம் - அப்போதுதான் எரர் இங்கேயே பிடிபடும்
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false, 
      });

      setLoading(false);

      if (result?.error) {
        // ❌ லாகின் தோல்வி
        setErrorMessage(result.error || "Invalid email or password!");
        setOpen(true); // Pop-up-ஐத் திறக்க
      } else if (result?.ok) {
        // ✅ லாகின் வெற்றி
        router.push('/');
        router.refresh(); 
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setOpen(true);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="xs">
        <Paper 
          elevation={10} 
          sx={{ 
            p: 4, 
            borderRadius: 4,
            position: 'relative'
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="800" color="#293D91" gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Login to your account to continue
            </Typography>
          </Box>

          {/* 🔍 Backup Alert: பாப்-அப் வரவில்லை என்றாலும் இது பட்டனுக்கு மேல் காட்டும் */}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <TextField
              label="Email Address"
              fullWidth
              required
              sx={{ 
                mb: 2,
                "& input:-webkit-autofill": { WebkitBoxShadow: "0 0 0 1000px white inset" }
              }}
              value={formData.email}
              autoComplete="new-password" 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              InputProps={{ 
                startAdornment: <InputAdornment position="start"><Email color="action" fontSize="small" /></InputAdornment> 
              }}
            />

            {/* Password Input */}
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              sx={{ 
                mb: 3,
                "& input:-webkit-autofill": { WebkitBoxShadow: "0 0 0 1000px white inset" }
              }}
              value={formData.password}
              autoComplete="new-password"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              InputProps={{ 
                startAdornment: <InputAdornment position="start"><Lock color="action" fontSize="small" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              endIcon={!loading && <ArrowForward />}
              sx={{ 
                bgcolor: '#293D91', 
                py: 1.5, 
                fontWeight: 'bold', 
                borderRadius: 2,
                '&:hover': { bgcolor: '#1a2a6b' } 
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <Divider sx={{ my: 4 }}>OR</Divider>

          <Button
            variant="outlined"
            fullWidth
            size="large"
            startIcon={<Google sx={{ color: '#EA4335' }} />}
            onClick={() => signIn('google', { callbackUrl: '/' })}
            sx={{ 
              py: 1.2, 
              fontWeight: '600', 
              borderRadius: 2, 
              textTransform: 'none',
              color: '#444', 
              borderColor: '#ddd' 
            }}
          >
            Sign in with Google
          </Button>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account? {' '}
              <Link href="/auth/signup" fontWeight="bold" color="#293D91" underline="hover">
                Create Account
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* 🚀 FIXED SNACKBAR POP-UP */}
      <Snackbar 
        open={open} 
        autoHideDuration={6000} 
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleClose} 
          severity="error" 
          variant="filled" 
          elevation={6}
          sx={{ width: '100%', fontWeight: '500' }}
          action={
            <IconButton size="small" color="inherit" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}