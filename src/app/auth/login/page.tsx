'use client';

import React, { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box, Typography, TextField, Button, Snackbar, InputAdornment, 
  Link, Divider, IconButton, Alert, Stack, Grid, useTheme, useMediaQuery
} from '@mui/material';
import {
  EmailOutlined, LockOutlined, Google, Facebook, Apple, 
  Visibility, VisibilityOff, DirectionsCar, MapOutlined
} from '@mui/icons-material';

// ----------------------------------------------------------------------
// COLOR PALETTE (Travel & Trust)
// ----------------------------------------------------------------------
const COLORS = {
  primary: '#2563EB',    // Vibrant Blue (Trustworthy & Active)
  darkBlue: '#1E3A8A',   // Deep Navy for contrast
  bgLeft: '#1e40af',     // Left panel background
  bgRight: '#FFFFFF',    // Clean white for form
  textMain: '#1F2937',   // Dark grey text
  textSub: '#6B7280',    // Muted text
  inputBg: '#F3F4F6',    // Light grey for inputs
  error: '#EF4444'
};

export default function UserLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');
  
  // Responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (urlError) {
      setErrorMessage('Login failed. Please check your details.');
      setOpen(true);
    }
  }, [urlError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      });

      if (result?.error) {
        setErrorMessage('Invalid credentials');
        setOpen(true);
      } else if (result?.ok) {
        // Redirect logic
        const session = await getSession();
        if ((session?.user as any)?.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/cars'); // User directed to car listing
        }
      }
    } catch (err) {
      setErrorMessage('Something went wrong');
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // CUSTOM STYLES
  // ----------------------------------------------------------------------
  
  // Inputs: Soft, pill-like, very friendly
  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '16px', // Smooth corners
      backgroundColor: COLORS.inputBg,
      transition: 'all 0.2s',
      '& fieldset': { borderWidth: '0px' }, // No border by default
      '&:hover': { backgroundColor: '#E5E7EB' },
      '&.Mui-focused': {
        backgroundColor: '#FFFFFF',
        boxShadow: `0 0 0 2px ${COLORS.primary}33`, // Soft blue glow
        '& fieldset': { borderWidth: '1px', borderColor: COLORS.primary }
      }
    },
    '& input': {
      padding: '16px 20px',
      fontSize: '0.95rem',
      fontWeight: 500
    }
  };

  // Social Button Styles
  const socialBtnStyle = {
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '12px 30px', // Wide touch area
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#F9FAFB',
      borderColor: COLORS.primary,
      transform: 'translateY(-2px)'
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden', // STRICT NO SCROLL
      display: 'flex',
      bgcolor: COLORS.bgRight
    }}>
      
      <Grid container sx={{ height: '100%' }}>
        
        {/* LEFT SIDE: Visual Experience (Hidden on Mobile) */}
        <Grid item xs={0} md={6} lg={7} sx={{ 
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          bgcolor: COLORS.bgLeft,
          background: `linear-gradient(135deg, ${COLORS.darkBlue} 0%, ${COLORS.primary} 100%)`,
          overflow: 'hidden',
          p: 6
        }}>
          {/* Abstract Road/Map Pattern Background */}
          <Box sx={{
            position: 'absolute', inset: 0, opacity: 0.1,
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />

          {/* Glowing Orbs */}
          <Box sx={{
            position: 'absolute', top: '-10%', right: '-10%',
            width: '500px', height: '500px', borderRadius: '50%',
            background: '#60A5FA', filter: 'blur(120px)', opacity: 0.3
          }} />

          {/* Glass Card Content */}
          <Box sx={{ 
            position: 'relative', zIndex: 10,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '32px',
            p: 6,
            maxWidth: '500px',
            color: '#fff'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: '12px', color: COLORS.primary }}>
                <DirectionsCar fontSize="large" />
              </Box>
              <Typography variant="h6" fontWeight="bold" letterSpacing={1}>GO RENTAL</Typography>
            </Box>

            <Typography variant="h3" fontWeight="800" sx={{ mb: 2, lineHeight: 1.2 }}>
              The journey begins <br /> with the right car.
            </Typography>
            
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 4, lineHeight: 1.6 }}>
              Join thousands of happy travelers. Book your premium vehicle today with zero paperwork and instant approval.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(0,0,0,0.2)', px: 2, py: 1, borderRadius: '20px' }}>
                <MapOutlined fontSize="small" />
                <Typography variant="caption" fontWeight="600">Unlimited Miles</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(0,0,0,0.2)', px: 2, py: 1, borderRadius: '20px' }}>
                <Typography variant="caption" fontWeight="600">24/7 Support</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* RIGHT SIDE: User Login Form */}
        <Grid item xs={12} md={6} lg={5} sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center', // Centers form vertically
          alignItems: 'center',
          px: { xs: 4, md: 8 },
          position: 'relative'
        }}>
          
          <Box sx={{ width: '100%', maxWidth: '450px' }}>
            
            {/* Header */}
            <Box sx={{ mb: 5, textAlign: 'left' }}>
              <Typography variant="h4" fontWeight="900" color={COLORS.textMain} sx={{ mb: 1 }}>
                Welcome Back 👋
              </Typography>
              <Typography variant="body1" color={COLORS.textSub}>
                Ready for your next trip? Sign in to continue.
              </Typography>
            </Box>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                
                <Box>
                  <Typography variant="caption" fontWeight="700" color={COLORS.textMain} sx={{ ml: 1, mb: 0.5, display: 'block' }}>
                    Email or Username
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="john@example.com"
                    variant="outlined"
                    sx={inputStyles}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: COLORS.textSub }} /></InputAdornment>
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight="700" color={COLORS.textMain} sx={{ ml: 1, mb: 0.5, display: 'block' }}>
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="••••••••••"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    sx={inputStyles}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: COLORS.textSub }} /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Link href="#" underline="hover" sx={{ color: COLORS.primary, fontWeight: 600, fontSize: '0.9rem' }}>
                    Forgot Password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: COLORS.primary,
                    color: '#fff',
                    py: 2,
                    borderRadius: '16px', // Matches input roundness
                    fontSize: '1rem',
                    fontWeight: '700',
                    textTransform: 'none',
                    boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.4)', // Blue shadow
                    '&:hover': {
                      bgcolor: COLORS.darkBlue,
                      boxShadow: '0 12px 24px -4px rgba(30, 58, 138, 0.5)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

              </Stack>
            </form>

            {/* Social Login */}
            <Box sx={{ my: 4, position: 'relative', textAlign: 'center' }}>
              <Divider sx={{ borderColor: '#E5E7EB' }} />
              <Typography variant="caption" sx={{ 
                position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                bgcolor: COLORS.bgRight, px: 2, color: COLORS.textSub, fontWeight: 600
              }}>
                Or sign in with
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} justifyContent="center">
              <IconButton onClick={() => signIn('google')} sx={socialBtnStyle}>
                <Google sx={{ color: '#EA4335' }} />
              </IconButton>
              <IconButton onClick={() => signIn('facebook')} sx={socialBtnStyle}>
                <Facebook sx={{ color: '#1877F2' }} />
              </IconButton>
              <IconButton onClick={() => signIn('apple')} sx={socialBtnStyle}>
                <Apple sx={{ color: '#000' }} />
              </IconButton>
            </Stack>

            {/* Register Link */}
            <Box sx={{ mt: 5, textAlign: 'center' }}>
              <Typography variant="body2" color={COLORS.textSub}>
                Don't have an account yet? {' '}
                <Link href="/auth/signup" sx={{ color: COLORS.primary, fontWeight: 700, textDecoration: 'none' }}>
                  Create an account
                </Link>
              </Typography>
            </Box>

          </Box>
        </Grid>
      </Grid>

      {/* Error Notification */}
      <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setOpen(false)} severity="error" variant="filled" sx={{ width: '100%', borderRadius: '12px', fontWeight: 600 }}>
          {errorMessage}
        </Alert>
      </Snackbar>

    </Box>
  );
}