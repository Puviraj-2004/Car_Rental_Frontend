'use client';

import React from 'react';
import Image from 'next/image';
import {
  Box, Typography, TextField, Button, InputAdornment, 
  Link, Divider, IconButton, Alert, Stack, Grid, CircularProgress,
  Container
} from '@mui/material';
import {
  EmailOutlined, LockOutlined, Google, Facebook,
  Visibility, VisibilityOff, ArrowForward, ArrowBack
} from '@mui/icons-material';
import NextLink from 'next/link';

interface LoginViewProps {
  formData: any;
  setFormData: (data: any) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleLogin: () => void;
}

const COLORS = {
  primary: '#0F172A',
  accent: '#3B82F6',
  darkBg: '#0F172A',
  cardBg: '#1E293B',
  inputBg: 'rgba(255, 255, 255, 0.05)',
  textPrimary: '#FFFFFF',
  textSub: 'rgba(255, 255, 255, 0.6)',
  border: 'rgba(255, 255, 255, 0.1)',
};

export const LoginView = ({
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  error,
  loading,
  onSubmit,
  onGoogleLogin
}: LoginViewProps) => {
  
  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: COLORS.inputBg,
      color: COLORS.textPrimary,
      transition: 'all 0.2s ease-in-out',
      '& fieldset': { border: `1.5px solid ${COLORS.border}` },
      '&:hover fieldset': { borderColor: COLORS.accent },
      '&.Mui-focused fieldset': { 
        borderColor: COLORS.accent,
        borderWidth: '1.5px',
      },
    },
    '& input': { padding: '12px 14px', fontSize: '0.9rem', color: COLORS.textPrimary },
    '& input::placeholder': { color: 'rgba(255, 255, 255, 0.4)', opacity: 1 }
  };

  const socialButtonStyle = {
    py: 1.2,
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.85rem',
    border: `1px solid ${COLORS.border}`,
    color: COLORS.textPrimary,
    bgcolor: COLORS.inputBg,
    '&:hover': {
      bgcolor: 'rgba(255, 255, 255, 0.1)',
      borderColor: COLORS.accent
    }
  };

  return (
    <Box sx={{ height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: COLORS.darkBg, position: 'relative' }}>
      <IconButton
        component={NextLink}
        href="/"
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 10,
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)', transform: 'scale(1.05)' },
          transition: 'all 0.2s',
        }}
      >
        <ArrowBack sx={{ fontSize: 20, color: COLORS.textPrimary }} />
      </IconButton>

      <Grid container sx={{ height: '100%' }}>
        <Grid item xs={0} md={6} lg={7} sx={{ display: { xs: 'none', md: 'block' }, position: 'relative' }}>
          <Image src="/images/auth/login.jpg" alt="Hero" fill style={{ objectFit: 'cover' }} priority />
          <Box sx={{ 
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.2) 60%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: { md: 6, lg: 10 }
          }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h1" fontWeight={900} sx={{ color: 'white', mb: 1, letterSpacing: '-1.5px', fontSize: { md: '3rem', lg: '3.8rem' }, lineHeight: 1.1 }}>
                Drive <br /> Perfection.
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 300, maxWidth: '400px' }}>
                Access the world's most exclusive fleet with a single tap.
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6} lg={5} sx={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: { xs: 'flex-start', md: 'center' }, 
          justifyContent: 'center',
          px: { xs: 3, sm: 4, md: 2 },
          py: { xs: 0, md: 0 },
          pt: { xs: 10, md: 0 },
          bgcolor: COLORS.darkBg
        }}>
          <Container maxWidth="xs" sx={{ px: { xs: 0, sm: 2 } }}>
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
              <Typography variant="h5" fontWeight={800} color={COLORS.textPrimary} sx={{ fontSize: { xs: '1.5rem', md: '1.5rem' } }}>Sign In</Typography>
              <Typography variant="body2" color={COLORS.textSub} sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>Enter your details to access your account.</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', fontSize: '0.8rem' }}>{error}</Alert>}

            <form onSubmit={onSubmit} autoComplete="off">
              <Stack spacing={{ xs: 1.5, md: 2 }}>
                <Box>
                  <Typography variant="caption" fontWeight={700} sx={{ mb: 0.5, display: 'block', color: COLORS.textPrimary }}>EMAIL ADDRESS</Typography>
                  <TextField fullWidth placeholder="name@domain.com" sx={inputStyles}
                    autoComplete="off"
                    name="login-email-field"
                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ fontSize: 20, color: COLORS.textSub }} /></InputAdornment> }} 
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: COLORS.textPrimary }}>PASSWORD</Typography>
                    <Link href="#" sx={{ fontSize: '0.75rem', color: COLORS.accent, textDecoration: 'none', fontWeight: 600 }}>Forgot?</Link>
                  </Box>
                  <TextField fullWidth placeholder="••••••••" type={showPassword ? 'text' : 'password'} sx={inputStyles}
                    autoComplete="new-password"
                    name="login-password-field"
                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LockOutlined sx={{ fontSize: 20, color: COLORS.textSub }} /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} size="small" sx={{ color: COLORS.textSub }}>
                            {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                <Button type="submit" fullWidth variant="contained" disabled={!!loading}
                  sx={{ 
                    bgcolor: COLORS.accent, py: { xs: 1.3, md: 1.5 }, borderRadius: '12px', fontWeight: 700, textTransform: 'none',
                    boxShadow: `0 4px 20px rgba(59, 130, 246, 0.4)`,
                    color: '#FFFFFF',
                    '&:hover': { bgcolor: '#2563EB', boxShadow: `0 6px 24px rgba(59, 130, 246, 0.5)` }
                  }}>
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
                </Button>

                <Box sx={{ py: 0.5 }}><Divider sx={{ fontSize: '0.7rem', color: COLORS.textSub, '&::before, &::after': { borderColor: COLORS.border } }}>OR CONTINUE WITH</Divider></Box>

                <Grid container spacing={1.5}>
                  <Grid item xs={6}><Button fullWidth startIcon={<Google sx={{ fontSize: 18 }}/>} onClick={onGoogleLogin} sx={socialButtonStyle}>Google</Button></Grid>
                  <Grid item xs={6}><Button fullWidth startIcon={<Facebook sx={{ fontSize: 18 }}/>} sx={socialButtonStyle}>Facebook</Button></Grid>
                </Grid>

                <Typography variant="body2" textAlign="center" sx={{ color: COLORS.textSub, mt: 1 }}>
                  New here? <Link href="/register" sx={{ color: COLORS.accent, fontWeight: 700, textDecoration: 'none' }}>Create account</Link>
                </Typography>
              </Stack>
            </form>
          </Container>
        </Grid>
      </Grid>
    </Box>
  );
};