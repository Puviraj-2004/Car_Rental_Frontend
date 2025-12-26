'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import {
  Box, Typography, TextField, Button, InputAdornment, 
  Link, Divider, IconButton, Alert, Stack, Grid, CircularProgress
} from '@mui/material';
import {
  EmailOutlined, LockOutlined, Google, Facebook, Apple, 
  Visibility, VisibilityOff, DirectionsCar, MapOutlined
} from '@mui/icons-material';

// COLOR PALETTE
const COLORS = {
  primary: '#2563EB',
  darkBlue: '#1E3A8A',
  bgLeft: '#1e40af',
  bgRight: '#FFFFFF',
  textMain: '#1F2937',
  textSub: '#6B7280',
  inputBg: '#F3F4F6',
};

export default function UserLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Handle Credentials Login with Role-based redirection
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      redirect: false, // 👈 Manual redirection handling
      email: formData.email,
      password: formData.password,
    });

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      // 🚀 லாகின் ஆன பிறகு செஷனை எடுத்து ரோலைச் சரிபார்க்கவும்
      const session = await getSession();
      const userRole = (session?.user as any)?.role;

      if (userRole === "ADMIN") {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    }
  };

  // Handle Google Login
  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '16px',
      backgroundColor: COLORS.inputBg,
      '& fieldset': { borderWidth: '0px' },
      '&.Mui-focused': {
        backgroundColor: '#FFFFFF',
        boxShadow: `0 0 0 2px ${COLORS.primary}33`,
        '& fieldset': { borderWidth: '1px', borderColor: COLORS.primary }
      }
    },
    '& input': { padding: '16px 20px', fontSize: '0.95rem', fontWeight: 500 }
  };

  return (
    <Box sx={{ height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: COLORS.bgRight }}>
      <Grid container sx={{ height: '100%' }}>
        
        {/* LEFT SIDE: Visual Experience */}
        <Grid item xs={0} md={6} lg={7} sx={{ 
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${COLORS.darkBlue} 0%, ${COLORS.primary} 100%)`,
          p: 6
        }}>
          <Box sx={{ textAlign: 'center', color: 'white', maxWidth: '500px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
              <DirectionsCar sx={{ fontSize: 50 }} />
              <Typography variant="h4" fontWeight="bold">RENTCAR</Typography>
            </Box>
            <Typography variant="h3" fontWeight="800" sx={{ mb: 2, lineHeight: 1.2 }}>The journey begins with the right car.</Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>Sign in to access our premium fleet and manage your bookings effortlessly.</Typography>
          </Box>
        </Grid>

        {/* RIGHT SIDE: Form */}
        <Grid item xs={12} md={6} lg={5} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', px: { xs: 3, md: 8 } }}>
          <Box sx={{ width: '100%', maxWidth: '400px' }}>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight="900" color={COLORS.textMain} sx={{ mb: 1 }}>Welcome Back 👋</Typography>
              <Typography variant="body2" color={COLORS.textSub}>Sign in to your account</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

            {/* Autofill Prevention logic */}
            <form onSubmit={handleSubmit} autoComplete="off">
              <input type="text" name="fake_email" style={{ display: 'none' }} />
              <input type="password" name="fake_password" style={{ display: 'none' }} />

              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" fontWeight="700" sx={{ mb: 0.5, display: 'block', ml: 1 }}>Email Address</Typography>
                  <TextField 
                    fullWidth placeholder="email@example.com" sx={inputStyles}
                    autoComplete="one-time-code"
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined fontSize="small" /></InputAdornment> }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight="700" sx={{ mb: 0.5, display: 'block', ml: 1 }}>Password</Typography>
                  <TextField 
                    fullWidth placeholder="••••••••" type={showPassword ? 'text' : 'password'} sx={inputStyles}
                    autoComplete="new-password"
                    value={formData.password} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LockOutlined fontSize="small" /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                <Button 
                  type="submit" fullWidth variant="contained" disabled={loading}
                  sx={{ bgcolor: COLORS.primary, py: 1.8, borderRadius: '16px', fontWeight: '700', textTransform: 'none', mt: 1 }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </Button>

                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Divider><Typography variant="caption" color="text.secondary">OR CONTINUE WITH</Typography></Divider>
                </Box>

                <Stack direction="row" spacing={2} justifyContent="center">
                  <IconButton onClick={handleGoogleLogin} sx={{ border: '1px solid #E5E7EB', borderRadius: '12px', p: 1.2 }}>
                    <Google sx={{ color: '#EA4335' }} />
                  </IconButton>
                  <IconButton sx={{ border: '1px solid #E5E7EB', borderRadius: '12px', p: 1.2 }}>
                    <Facebook sx={{ color: '#1877F2' }} />
                  </IconButton>
                </Stack>

                <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
                  Don't have an account? <Link href="/register" sx={{ color: COLORS.primary, fontWeight: 700, textDecoration: 'none' }}>Create Account</Link>
                </Typography>
              </Stack>
            </form>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}