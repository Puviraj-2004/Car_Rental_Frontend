'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react'; // 🚀 ஒரே வரியில் இம்போர்ட்
import { useRouter } from 'next/navigation';
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
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    // Read URL error param directly from window to avoid useSearchParams SSR prerender warnings
    try {
      const params = new URLSearchParams(window.location.search);
      setUrlError(params.get('error'));

      // If there's a callbackUrl (e.g., after a failed server redirect flow), wait for session role then navigate to it
      const cb = params.get('callbackUrl');
      if (cb) {
        (async () => {
          setLoading(true);
          const session = await waitForRole(20, 300);
          setLoading(false);
          if (session?.user?.role) {
            try {
              const target = new URL(cb, window.location.origin);
              router.replace(target.pathname + target.search + target.hash);
            } catch (e) {
              // fallback for malformed callbackUrl
              router.replace(cb);
            }
          }
        })();
      }
    } catch (e) {
      setUrlError(null);
    }
  }, []);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!urlError) return;

    // Map known NextAuth error codes to friendly messages
    if (urlError === 'BACKEND_UNREACHABLE' || urlError.toLowerCase().includes('fetch')) {
      setErrorMessage("Unable to reach backend server (http://localhost:4000). Please start the backend and try again.");
      setOpen(true);
      return;
    }

    if (urlError === 'CredentialsSignin') {
      // Credentials failure may be because of wrong password OR because backend is down.
      (async () => {
        const reachable = await checkBackend();
        if (!reachable) {
          setErrorMessage("Unable to reach backend server (http://localhost:4000). Please start the backend and try again.");
        } else {
          setErrorMessage("Invalid email or password. Please try again.");
        }
        setOpen(true);
      })();
      return;
    }

    // Fallback
    setErrorMessage("Authentication failed. Please try again.");
    setOpen(true);
  }, [urlError]);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const checkBackend = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ __typename }' }),
      });
      setLoading(false);
      return res.ok;
    } catch (e: any) {
      setLoading(false);
      return false;
    }
  };

  // Helper to wait until the NextAuth session contains a role (avoids race conditions)
  const waitForRole = async (retries = 15, delay = 300) => {
    for (let i = 0; i < retries; i++) {
      const s = await getSession() as CustomSession;
      if (s?.user?.role) return s;
      await new Promise((res) => setTimeout(res, delay));
    }
    return null;
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
      // Use server-side redirect so NextAuth can send admins directly to the admin dashboard
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: true, // Let NextAuth perform the redirect (signIn callback will return admin URL)
        callbackUrl: '/admin/dashboard', // prefer dashboard as callback so OAuth also lands there
      });

      // When redirect is true, a successful login will navigate away immediately.
      // If we get a response back, it usually indicates an error.
      if ((result as any)?.error) {
        setLoading(false);
        setErrorMessage((result as any).error || "Invalid email or password!");
        setOpen(true);
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
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
              action={
                errorMessage.includes('Unable to reach backend') ? (
                  <Button color="inherit" size="small" onClick={async () => {
                    const reachable = await checkBackend();
                    if (reachable) {
                      setErrorMessage('Backend is reachable — try logging in again.');
                    } else {
                      setErrorMessage('Unable to reach backend server (http://localhost:4000). Start the backend: open a terminal, cd Car_Rental_Backend, and run `npm run dev`.');
                    }
                    setOpen(true);
                  }}>
                    Check backend
                  </Button>
                ) : null
              }
            >
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
            onClick={() => {
              // Use standard OAuth redirect flow for Google sign-in so the server handles the callback and redirect
              signIn('google', { callbackUrl: '/admin/dashboard' });
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