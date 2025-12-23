'use client';

import React, { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react'; // 🚀 ஒரே வரியில் இம்போர்ட்
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Box, Container, Paper, Typography, TextField, 
  Button, Alert, InputAdornment, Link, Divider, Snackbar, IconButton 
} from '@mui/material';
import { 
  Email, Lock, Google, ArrowForward, 
  Visibility, VisibilityOff, Close as CloseIcon 
} from '@mui/icons-material';

interface CustomSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string; 
  };
  expires: string;
}

// Password validation function for login
const validatePassword = (password: string) => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password should be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password should contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password should contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password should contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password should contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const isWeakPassword = (password: string) => {
  return !validatePassword(password).isValid;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    setErrorMessage("");
    setOpen(false);

    // Check if password is weak and show warning
    if (isWeakPassword(formData.password)) {
      setErrorMessage("Warning: You're using a weak password. Please consider changing it after login for better security.");
      setOpen(true);
    }

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false, // Don't redirect automatically
      });

      if (result?.error) {
        setLoading(false);
        setErrorMessage(result.error || "Invalid email or password!");
        setOpen(true);
      } else if (result?.ok) {
        // Wait a bit for the session to update, then check the role
        setTimeout(async () => {
          const session = await getSession() as CustomSession;
          if (session?.user?.role === 'ADMIN') {
            router.push('/admin/dashboard');
          } else {
            router.push('/');
          }
        }, 500);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage("An unexpected error occurred.");
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

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
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
              error={formData.password.length > 0 && isWeakPassword(formData.password)}
              helperText={formData.password.length > 0 && isWeakPassword(formData.password) ? "Weak password detected" : ""}
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
              endIcon={!loading}
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
            onClick={async () => {
              const result = await signIn('google', { redirect: false });
              if (result?.ok) {
                // Wait for the session to update, then check the role
                setTimeout(async () => {
                  const session = await getSession() as CustomSession;
                  if (session?.user?.role === 'ADMIN') {
                    router.push('/admin/dashboard');
                  } else {
                    router.push('/');
                  }
                }, 500);
              }
            }}
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