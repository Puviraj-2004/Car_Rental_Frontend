'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { 
  Box, Typography, TextField, Button, Grid, Alert, InputAdornment, 
  Checkbox, FormControlLabel, Link, CircularProgress, Stack, IconButton
} from '@mui/material';
import { 
  EmailOutlined, LockOutlined, PersonOutline, PhoneOutlined, 
  DirectionsCar, Visibility, VisibilityOff 
} from '@mui/icons-material';

import { REGISTER_MUTATION } from '@/lib/graphql/mutations';

const COLORS = {
  primary: '#2563EB',    
  darkBlue: '#1E3A8A',   
  inputBg: '#F3F4F6',    
  textSub: '#6B7280',
};

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', phoneNumber: '', gdprConsent: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [error, setError] = useState('');

  const [register, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: () => router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`),
    onError: (err) => setError(err.message || "Registration failed. Try again.")
  });

  const validatePassword = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[!@#$%^&*]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.gdprConsent) { setError("Please agree to the terms."); return; }
    
    // Register mutation with new input structure
    register({ 
      variables: { 
        input: { 
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber
        } 
      } 
    });
  };

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
        
        {/* LEFT SIDE - VISUAL */}
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

        {/* RIGHT SIDE - FORM */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', px: { xs: 2, md: 5 } }}>
          <Box sx={{ width: '100%', maxWidth: '400px' }}>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" fontWeight="800" color="#1F2937">Create Account</Typography>
              <Typography variant="body2" color={COLORS.textSub}>Fill in your details to get started.</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

            {/* Autofill Prevention: Dummy hidden fields */}
            <form onSubmit={handleSubmit} autoComplete="off">
              <input type="text" style={{ display: 'none' }} />
              <input type="password" style={{ display: 'none' }} />

              <Stack spacing={2}>
                
                {/* 1. Username */}
                <TextField 
                  fullWidth placeholder="Username" sx={inputStyles}
                  autoComplete="one-time-code"
                  value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutline fontSize="small"/></InputAdornment> }} 
                />

                {/* 2. Email */}
                <TextField 
                  fullWidth placeholder="Email Address" sx={inputStyles} 
                  name="email_address_no_fill"
                  autoComplete="off"
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined fontSize="small"/></InputAdornment> }} 
                />

                {/* 4. Password */}
                <Box>
                  <TextField 
                    fullWidth placeholder="Password" type={showPassword ? 'text' : 'password'} sx={inputStyles}
                    autoComplete="new-password"
                    value={formData.password} 
                    onChange={(e) => { setFormData({...formData, password: e.target.value}); validatePassword(e.target.value); }} 
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

                {/* 3. Phone Number */}
                <TextField 
                  fullWidth placeholder="Mobile Number" sx={inputStyles}
                  autoComplete="one-time-code"
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
}