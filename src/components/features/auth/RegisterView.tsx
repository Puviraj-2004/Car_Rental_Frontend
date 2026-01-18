'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Box, Typography, TextField, Button, Grid, Alert, InputAdornment, 
  Checkbox, FormControlLabel, Link, CircularProgress, Stack, IconButton, Divider
} from '@mui/material';
import { 
  EmailOutlined, LockOutlined, PersonOutline, PhoneOutlined, 
  Visibility, VisibilityOff, ArrowForward
} from '@mui/icons-material';

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
  inputBg: '#F8FAFC',
  textSub: '#64748B',
  success: '#10B981',
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
            src="/images/auth/register-hero.jpg"
            alt="Luxury Car" 
            fill 
            style={{ objectFit: 'cover' }}
            priority
          />
          
          {/* Overlay for Premium Look Text */}
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
              Experience <br /> Pure Luxury.
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400, maxWidth: '400px' }}>
              Drive the elite fleet. Book your dream car in seconds.
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', position: 'absolute', bottom: 30, left: 60 }}>
            © 2026 RentCar Premium.
          </Typography>
        </Grid>

        {/* Right Side - Scrollable Registration Form */}
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
                Create Account
              </Typography>
              <Typography variant="body2" color={COLORS.textSub}>
                Join our community of premium travelers.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
            )}

            <form onSubmit={onSubmit} autoComplete="off">
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" fontWeight={700} sx={{ mb: 0.5, display: 'block', color: COLORS.primary }}>Full Name</Typography>
                  <TextField fullWidth placeholder="John Doe" sx={inputStyles} autoComplete="off" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutline fontSize="small" /></InputAdornment> }} 
                  />
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={700} sx={{ mb: 0.5, display: 'block', color: COLORS.primary }}>Email Address</Typography>
                  <TextField fullWidth placeholder="name@company.com" sx={inputStyles} autoComplete="off" value={formData.email} error={!!fieldErrors?.email} helperText={fieldErrors?.email}
                    onChange={(e) => onEmailChange ? onEmailChange(e.target.value) : setFormData({...formData, email: e.target.value})}
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined fontSize="small" /></InputAdornment> }} 
                  />
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={700} sx={{ mb: 0.5, display: 'block', color: COLORS.primary }}>Password</Typography>
                  <TextField fullWidth placeholder="Create a strong password" type={showPassword ? 'text' : 'password'} sx={inputStyles} autoComplete="new-password" value={formData.password} onChange={(e) => onPasswordChange(e.target.value)}
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start"><LockOutlined fontSize="small" /></InputAdornment>,
                      endAdornment: <IconButton onClick={() => setShowPassword(!showPassword)} size="small"><Visibility fontSize="small" /></IconButton>
                    }} 
                  />
                  {formData.password && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flex: 1, height: 4, bgcolor: '#E2E8F0', borderRadius: 1 }}>
                        <Box sx={{ height: '100%', width: `${passwordStrength}%`, bgcolor: passwordStrength < 70 ? '#F59E0B' : COLORS.success, borderRadius: 1 }} />
                      </Box>
                    </Box>
                  )}
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={700} sx={{ mb: 0.5, display: 'block', color: COLORS.primary }}>Confirm Password</Typography>
                  <TextField fullWidth placeholder="Re-enter your password" type={showPassword ? 'text' : 'password'} sx={inputStyles} autoComplete="new-password" value={formData.confirmPassword} onChange={(e) => onConfirmPasswordChange ? onConfirmPasswordChange(e.target.value) : setFormData({...formData, confirmPassword: e.target.value})}
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start"><LockOutlined fontSize="small" /></InputAdornment>
                    }}
                    error={!!fieldErrors?.confirmPassword}
                    helperText={fieldErrors?.confirmPassword}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={700} sx={{ mb: 0.5, display: 'block', color: COLORS.primary }}>Phone Number</Typography>
                  <TextField fullWidth placeholder="+1 (555) 000-0000" sx={inputStyles} autoComplete="off" value={formData.phoneNumber} onChange={(e) => onPhoneChange ? onPhoneChange(e.target.value) : setFormData({...formData, phoneNumber: e.target.value})} 
                    InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlined fontSize="small" /></InputAdornment> }} 
                  />
                </Box>

                <FormControlLabel
                  control={<Checkbox size="small" checked={formData.gdprConsent} onChange={(e) => setFormData({...formData, gdprConsent: e.target.checked})} />}
                  label={<Typography variant="caption" color={COLORS.textSub}>I agree to the <Link href="#" underline="none" fontWeight={600}>Terms</Link> and <Link href="#" underline="none" fontWeight={600}>Privacy Policy</Link></Typography>}
                />

                <Button 
                  type="submit" fullWidth variant="contained" disabled={!!disableSubmit}
                  sx={{ 
                    bgcolor: COLORS.primary, py: 1.5, borderRadius: '12px', fontWeight: 700, textTransform: 'none',
                    '&:hover': { bgcolor: '#1E293B', transform: 'translateY(-1px)' }, transition: 'all 0.2s'
                  }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                </Button>

                <Typography variant="body2" textAlign="center" sx={{ color: COLORS.textSub, mt: 2 }}>
                  Already have an account? <Link href="/login" sx={{ color: COLORS.accent, fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
                </Typography>
              </Stack>
            </form>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};