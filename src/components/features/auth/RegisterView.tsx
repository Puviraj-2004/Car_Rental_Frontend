'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Box, Typography, TextField, Button, Grid, Alert, InputAdornment, 
  Checkbox, FormControlLabel, Link, CircularProgress, Stack, IconButton, Container
} from '@mui/material';
import { 
  EmailOutlined, LockOutlined, PersonOutline, PhoneOutlined, 
  Visibility, VisibilityOff, ArrowBack
} from '@mui/icons-material';
import NextLink from 'next/link';

interface RegisterViewProps {
  formData: any;
  setFormData: (data: any) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  passwordStrength: number;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onPasswordChange: (password: string) => void;
  fieldErrors?: { email?: string; phone?: string; password?: string; confirmPassword?: string };
  onEmailChange?: (email: string) => void;
  onPhoneChange?: (phone: string) => void;
  onConfirmPasswordChange?: (confirmPassword: string) => void;
  disableSubmit?: boolean;
}

const COLORS = {
  primary: '#0F172A',
  accent: '#3B82F6',
  darkBg: '#0F172A',
  cardBg: '#1E293B',
  inputBg: 'rgba(255, 255, 255, 0.05)',
  textPrimary: '#FFFFFF',
  textSub: 'rgba(255, 255, 255, 0.6)',
  success: '#10B981',
  border: 'rgba(255, 255, 255, 0.1)',
};

export const RegisterView = ({
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  passwordStrength,
  error,
  loading,
  onSubmit,
  onPasswordChange,
  fieldErrors,
  onEmailChange,
  onPhoneChange,
  onConfirmPasswordChange,
  disableSubmit
}: RegisterViewProps) => {

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      backgroundColor: COLORS.inputBg,
      color: COLORS.textPrimary,
      transition: 'all 0.2s ease-in-out',
      '& fieldset': { border: `1.5px solid ${COLORS.border}` },
      '&:hover fieldset': { borderColor: COLORS.accent },
      '&.Mui-focused fieldset': { borderColor: COLORS.accent, borderWidth: '1.5px' },
    },
    '& input': { padding: '10px 12px', fontSize: '0.85rem', color: COLORS.textPrimary },
    '& input::placeholder': { color: 'rgba(255, 255, 255, 0.4)', opacity: 1 },
    '& .MuiFormHelperText-root': { mx: 0, mt: 0.2, fontSize: '0.7rem', color: '#EF4444' }
  };

  return (
    <Box sx={{ height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: COLORS.darkBg, position: 'relative' }}>
      <IconButton
        component={NextLink}
        href="/"
        sx={{
          position: 'absolute', top: 20, left: 20, zIndex: 10,
          bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)', transform: 'scale(1.05)' },
        }}
      >
        <ArrowBack sx={{ fontSize: 20, color: COLORS.textPrimary }} />
      </IconButton>

      <Grid container sx={{ height: '100%' }}>
        <Grid item xs={0} md={6} lg={7} sx={{ display: { xs: 'none', md: 'block' }, position: 'relative' }}>
          <Image src="/images/auth/register-hero.jpg" alt="Interior" fill style={{ objectFit: 'cover' }} priority />
          <Box sx={{ 
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.2) 60%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: { md: 6, lg: 10 }
          }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h1" fontWeight={900} sx={{ color: 'white', mb: 1, letterSpacing: '-1.5px', fontSize: { md: '2.5rem', lg: '3.5rem' }, lineHeight: 1.1 }}>
                Unlock <br /> The Fleet.
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 300, maxWidth: '350px' }}>
                Join our exclusive community and start your premium journey today.
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>LUXE SERIES © 2026</Typography>
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
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={800} color={COLORS.textPrimary} sx={{ lineHeight: 1.2 }}>Create Account</Typography>
              <Typography variant="caption" color={COLORS.textSub}>Fill in your details to get started.</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', py: 0, fontSize: '0.75rem' }}>{error}</Alert>}

            <form onSubmit={onSubmit} autoComplete="off">
              <Stack spacing={1.2}>
                {/* Two Column Row for Name and Phone */}
                <Grid container spacing={1.2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" fontWeight={700} sx={{ mb: 0.3, display: 'block', color: COLORS.textPrimary }}>FULL NAME</Typography>
                    <TextField fullWidth placeholder="John Doe" sx={inputStyles} value={formData.fullName}
                      autoComplete="off"
                      name="register-fullname"
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                      InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutline sx={{ fontSize: 18, color: COLORS.textSub }} /></InputAdornment> }} 
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" fontWeight={700} sx={{ mb: 0.3, display: 'block', color: COLORS.textPrimary }}>PHONE</Typography>
                    <TextField fullWidth placeholder="+1..." sx={inputStyles} value={formData.phoneNumber}
                      autoComplete="off"
                      name="register-phone"
                      onChange={(e) => onPhoneChange ? onPhoneChange(e.target.value) : setFormData({...formData, phoneNumber: e.target.value})} 
                      InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlined sx={{ fontSize: 18, color: COLORS.textSub }} /></InputAdornment> }} 
                    />
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="caption" fontWeight={700} sx={{ mb: 0.3, display: 'block', color: COLORS.textPrimary }}>EMAIL ADDRESS</Typography>
                  <TextField fullWidth placeholder="name@domain.com" sx={inputStyles} value={formData.email} error={!!fieldErrors?.email} helperText={fieldErrors?.email}
                    autoComplete="off"
                    name="register-email"
                    onChange={(e) => onEmailChange ? onEmailChange(e.target.value) : setFormData({...formData, email: e.target.value})}
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ fontSize: 18, color: COLORS.textSub }} /></InputAdornment> }} 
                  />
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={700} sx={{ mb: 0.3, display: 'block', color: COLORS.textPrimary }}>PASSWORD</Typography>
                  <TextField fullWidth placeholder="Create password" type={showPassword ? 'text' : 'password'} sx={inputStyles} value={formData.password}
                    autoComplete="new-password"
                    name="register-password"
                    onChange={(e) => onPasswordChange(e.target.value)}
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start"><LockOutlined sx={{ fontSize: 18, color: COLORS.textSub }} /></InputAdornment>,
                      endAdornment: <IconButton onClick={() => setShowPassword(!showPassword)} size="small" sx={{ color: COLORS.textSub }}><Visibility sx={{ fontSize: 16 }} /></IconButton>
                    }} 
                  />
                  {formData.password && (
                    <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flex: 1, height: 3, bgcolor: '#E2E8F0', borderRadius: 1 }}>
                        <Box sx={{ height: '100%', width: `${passwordStrength}%`, bgcolor: passwordStrength < 70 ? '#F59E0B' : COLORS.success, transition: 'width 0.3s' }} />
                      </Box>
                    </Box>
                  )}
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={700} sx={{ mb: 0.3, display: 'block', color: COLORS.textPrimary }}>CONFIRM PASSWORD</Typography>
                  <TextField fullWidth placeholder="Repeat password" type={showPassword ? 'text' : 'password'} sx={inputStyles} value={formData.confirmPassword}
                    autoComplete="new-password"
                    name="register-confirm-password"
                    onChange={(e) => onConfirmPasswordChange ? onConfirmPasswordChange(e.target.value) : setFormData({...formData, confirmPassword: e.target.value})}
                    error={!!fieldErrors?.confirmPassword} helperText={fieldErrors?.confirmPassword}
                    InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlined sx={{ fontSize: 18, color: COLORS.textSub }} /></InputAdornment> }}
                  />
                </Box>

                <FormControlLabel
                  sx={{ mt: -0.5, '& .MuiCheckbox-root': { color: COLORS.border } }}
                  control={<Checkbox size="small" checked={formData.gdprConsent} onChange={(e) => setFormData({...formData, gdprConsent: e.target.checked})} sx={{ '&.Mui-checked': { color: COLORS.accent } }} />}
                  label={<Typography variant="caption" color={COLORS.textSub}>I agree to the <Link href="#" underline="none" fontWeight={700} color={COLORS.accent}>Terms & Privacy</Link></Typography>}
                />

                <Button 
                  type="submit" fullWidth variant="contained" disabled={!!disableSubmit}
                  sx={{ 
                    bgcolor: COLORS.accent, py: 1.2, borderRadius: '10px', fontWeight: 700, textTransform: 'none', fontSize: '0.85rem',
                    color: '#FFFFFF',
                    boxShadow: `0 4px 20px rgba(59, 130, 246, 0.4)`,
                    '&:hover': { bgcolor: '#2563EB', boxShadow: `0 6px 24px rgba(59, 130, 246, 0.5)` },
                    '&.Mui-disabled': { 
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.4)',
                      boxShadow: 'none'
                    }
                  }}>
                  {loading ? <CircularProgress size={18} color="inherit" /> : 'Create Account'}
                </Button>

                <Typography variant="caption" textAlign="center" sx={{ color: COLORS.textSub }}>
                  Already have an account? <Link href="/login" sx={{ color: COLORS.accent, fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
                </Typography>
              </Stack>
            </form>
          </Container>
        </Grid>
      </Grid>
    </Box>
  );
};