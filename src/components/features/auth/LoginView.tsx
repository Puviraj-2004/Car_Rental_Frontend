'use client';

import React from 'react';
import Image from 'next/image';
import {
  Box, Typography, TextField, Button, InputAdornment, 
  Link, Divider, IconButton, Alert, Stack, Grid, CircularProgress
} from '@mui/material';
import {
  EmailOutlined, LockOutlined, Google, Facebook,
  Visibility, VisibilityOff, ArrowForward
} from '@mui/icons-material';

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
  inputBg: '#F8FAFC',
  textSub: '#64748B',
  success: '#10B981',
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
      transition: 'all 0.3s ease',
      '& fieldset': { border: '1px solid #E2E8F0' },
      '&:hover fieldset': { borderColor: COLORS.accent },
      '&.Mui-focused fieldset': { borderColor: COLORS.accent },
    },
    '& input': { padding: '12px 14px', fontSize: '0.9rem' }
  };

  return (
    <Box sx={{ height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
      <Grid container sx={{ height: '100%' }}>
        
        {/* Left Side - Hero Image Section */}
        <Grid item xs={0} md={6} lg={7} sx={{ 
          display: { xs: 'none', md: 'block' }, 
          position: 'relative',
          height: '100%'
        }}>
          <Image 
            src="/images/auth/login.jpg"
            alt="Luxury Car" 
            fill 
            style={{ objectFit: 'cover' }}
            priority
          />
          
          {/* Overlay for Premium Look */}
          <Box sx={{ 
            position: 'absolute', 
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to bottom, rgba(15,23,42,0.7) 0%, rgba(15,23,42,0.2) 40%, rgba(15,23,42,0.7) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: 8
          }}>
            <Typography variant="h2" fontWeight={800} sx={{ color: 'white', mb: 1, letterSpacing: '-1px', lineHeight: 1.1 }}>
              Welcome <br /> Back.
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400, maxWidth: '400px' }}>
              Sign in to manage your bookings and explore our premium fleet.
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', position: 'absolute', bottom: 30, left: 60 }}>
            © 2026 RentCar Premium.
          </Typography>
        </Grid>

        {/* Right Side - Login Form */}
        <Grid item xs={12} md={6} lg={5} sx={{ 
          height: '100%', 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: '#FFFFFF'
        }}>
          <Box sx={{ p: { xs: 4, md: 6, lg: 8 }, maxWidth: '500px', mx: 'auto', width: '100%' }}>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight={800} color={COLORS.primary} sx={{ mb: 1 }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" color={COLORS.textSub}>
                Sign in to your premium account.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
            )}

            <form onSubmit={onSubmit} autoComplete="off">
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" fontWeight={700} sx={{ mb: 0.5, display: 'block', color: COLORS.primary }}>Email Address</Typography>
                  <TextField fullWidth placeholder="you@example.com" sx={inputStyles} autoComplete="off"
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined fontSize="small" /></InputAdornment> }} 
                  />
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={700} sx={{ mb: 0.5, display: 'block', color: COLORS.primary }}>Password</Typography>
                  <TextField fullWidth placeholder="••••••••" type={showPassword ? 'text' : 'password'} sx={inputStyles} autoComplete="new-password"
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
                  type="submit" fullWidth variant="contained" disabled={!!loading}
                  endIcon={loading ? null : <ArrowForward />}
                  sx={{ 
                    bgcolor: COLORS.primary, py: 1.5, borderRadius: '12px', fontWeight: 700, textTransform: 'none',
                    '&:hover': { bgcolor: '#1E293B', transform: 'translateY(-1px)' }, transition: 'all 0.2s'
                  }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </Button>

                <Divider sx={{ my: 1 }} />

                <Typography variant="body2" textAlign="center" sx={{ color: COLORS.textSub }}>
                  Don't have an account? <Link href="/register" sx={{ color: COLORS.accent, fontWeight: 700, textDecoration: 'none' }}>Create Account</Link>
                </Typography>
              </Stack>
            </form>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};