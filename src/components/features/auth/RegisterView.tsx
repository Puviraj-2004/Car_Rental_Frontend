'use client';

import React from 'react';
import { 
  Box, Typography, TextField, Button, Grid, Alert, InputAdornment, 
  Checkbox, FormControlLabel, Link, CircularProgress, Stack, IconButton 
} from '@mui/material';
import { 
  EmailOutlined, LockOutlined, PersonOutline, PhoneOutlined, 
  DirectionsCar, Visibility, VisibilityOff 
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
}

const COLORS = {
  primary: '#2563EB',    
  darkBlue: '#1E3A8A',   
  inputBg: '#F3F4F6',    
  textSub: '#6B7280',
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
  onPasswordChange
}: RegisterViewProps) => {
  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: COLORS.inputBg,
      '& fieldset': { border: 'none' },
      '&.Mui-focused': { 
        backgroundColor: '#FFFFFF', 
        boxShadow: `0 0 0 2px ${COLORS.primary}20`,
        '& fieldset': { border: `1.5px solid ${COLORS.primary}` } 
      }
    },
    '& input': { padding: '12px 14px', fontSize: '0.9rem' }
  };

  return (
    <Box sx={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden', bgcolor: 'white' }}>
      <Grid container sx={{ height: '100%' }}>
        <Grid item xs={0} md={6} sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          background: `linear-gradient(135deg, ${COLORS.darkBlue} 0%, ${COLORS.primary} 100%)`, 
          p: 4 
        }}>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <DirectionsCar sx={{ fontSize: 60, mb: 1 }} />
            <Typography variant="h4" fontWeight="800">Join RentCar.</Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>Access our premium fleet in seconds.</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', px: { xs: 2, md: 5 } }}>
          <Box sx={{ width: '100%', maxWidth: '400px' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" fontWeight="800" color="#1F2937">Create Account</Typography>
              <Typography variant="body2" color={COLORS.textSub}>Fill in your details to get started.</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

            <form onSubmit={onSubmit} autoComplete="off">
              <Stack spacing={2}>
                <TextField 
                  fullWidth placeholder="Full Name" sx={inputStyles}
                  value={formData.fullName} 
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutline fontSize="small"/></InputAdornment> }} 
                />

                <TextField 
                  fullWidth placeholder="Email Address" sx={inputStyles} 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined fontSize="small"/></InputAdornment> }} 
                />

                <Box>
                  <TextField 
                    fullWidth placeholder="Password" type={showPassword ? 'text' : 'password'} sx={inputStyles}
                    value={formData.password} 
                    onChange={(e) => onPasswordChange(e.target.value)} 
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start"><LockOutlined fontSize="small"/></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }} 
                  />
                  {formData.password && (
                    <Box sx={{ mt: 0.5, height: 3, width: '100%', bgcolor: '#E5E7EB', borderRadius: 1 }}>
                      <Box sx={{ height: '100%', width: `${passwordStrength}%`, bgcolor: COLORS.primary, borderRadius: 1, transition: '0.3s' }} />
                    </Box>
                  )}
                </Box>

                <TextField 
                  fullWidth placeholder="Mobile Number" sx={inputStyles}
                  value={formData.phoneNumber} 
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlined fontSize="small"/></InputAdornment> }} 
                />

                <FormControlLabel
                  control={<Checkbox size="small" checked={formData.gdprConsent} onChange={(e) => setFormData({...formData, gdprConsent: e.target.checked})} />}
                  label={<Typography variant="caption">I agree to the <Link href="#">Terms & Policy</Link></Typography>}
                />

                <Button 
                  type="submit" fullWidth variant="contained" disabled={loading}
                  sx={{ bgcolor: COLORS.primary, py: 1.5, borderRadius: '10px', fontWeight: '700', textTransform: 'none', mt: 1 }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Register Now'}
                </Button>

                <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
                  Already have an account? <Link href="/login" sx={{ fontWeight: 700, textDecoration: 'none' }}>Login</Link>
                </Typography>
              </Stack>
            </form>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};