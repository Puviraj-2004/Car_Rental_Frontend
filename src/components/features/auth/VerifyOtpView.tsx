'use client';

import React from 'react';
import { 
  Box, Typography, TextField, Button, Grid, Alert, 
  CircularProgress, Stack 
} from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

interface VerifyOtpViewProps {
  email: string;
  otp: string[];
  error: string;
  success: string;
  resendSuccess: string;
  loading: boolean;
  resendLoading: boolean;
  resendCooldown: number;
  onOtpChange: (value: string, index: number) => void;
  onKeyDown: (e: React.KeyboardEvent, index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => void;
}

const COLORS = {
  primary: '#2563EB',
  darkBlue: '#1E3A8A',
  inputBg: '#F3F4F6'
};

export const VerifyOtpView = ({
  email,
  otp,
  error,
  success,
  resendSuccess,
  loading,
  resendLoading,
  resendCooldown,
  onOtpChange,
  onKeyDown,
  onSubmit,
  onResend
}: VerifyOtpViewProps) => {
  return (
    <Grid container sx={{ height: '100vh', bgcolor: 'white' }}>
      
      {/* LEFT SIDE: Visual Content */}
      <Grid item xs={0} md={6} sx={{ 
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${COLORS.darkBlue} 0%, ${COLORS.primary} 100%)`,
        p: 6
      }}>
        <Box sx={{ textAlign: 'center', color: 'white' }}>
           <MarkEmailReadIcon sx={{ fontSize: 80, mb: 3 }} />
           <Typography variant="h3" fontWeight="800">Verify Your Email</Typography>
           <Typography variant="h6" sx={{ mt: 2, opacity: 0.8, fontWeight: 400 }}>
             We've sent a 6-digit code to <br /> <b>{email}</b>
           </Typography>
        </Box>
      </Grid>

      {/* RIGHT SIDE: OTP Form */}
      <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', px: { xs: 3, md: 8 } }}>
        <Box sx={{ width: '100%', maxWidth: '440px', mx: 'auto', textAlign: 'center' }}>
          
          <Typography variant="h4" fontWeight="900" color="#0F172A" sx={{ mb: 1 }}>Check your inbox 📥</Typography>
          <Typography variant="body1" color="#64748B" sx={{ mb: 4 }}>
            Enter the verification code we sent to your email to activate your account.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>{success}</Alert>}
          {resendSuccess && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>{resendSuccess}</Alert>}

          <form onSubmit={onSubmit}>
            <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mb: 5 }}>
              {otp.map((digit, index) => (
                <TextField
                  key={index}
                  id={`otp-${index}`}
                  value={digit}
                  autoComplete="off"
                  onChange={(e) => onOtpChange(e.target.value, index)}
                  onKeyDown={(e) => onKeyDown(e, index)}
                  variant="outlined"
                  inputProps={{ 
                    style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: '800', padding: '14px 0' },
                    maxLength: 1
                  }}
                  sx={{ 
                    width: { xs: '45px', sm: '56px' },
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '12px', 
                      bgcolor: COLORS.inputBg,
                      '& fieldset': { border: 'none' },
                      '&.Mui-focused': {
                        bgcolor: 'white',
                        boxShadow: `0 0 0 2px ${COLORS.primary}20`,
                        '& fieldset': { border: `1.5px solid ${COLORS.primary}` }
                      }
                    }
                  }}
                />
              ))}
            </Stack>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !!success}
              sx={{ 
                bgcolor: COLORS.primary, 
                py: 2, 
                borderRadius: '16px', 
                fontWeight: '800',
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
                '&:hover': { bgcolor: COLORS.darkBlue }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Account'}
            </Button>
          </form>

          <Box sx={{ mt: 5 }}>
            <Typography variant="body2" color="#64748B">
              Didn't receive the code? {' '}
              <Button 
                onClick={onResend}
                disabled={resendCooldown > 0 || resendLoading}
                sx={{ 
                  fontWeight: 800, 
                  color: COLORS.primary, 
                  textTransform: 'none',
                  padding: 0,
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                  '&:disabled': { color: '#9CA3AF', cursor: 'not-allowed' }
                }}
              >
                {resendLoading ? (
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  'Resend OTP'
                )}
              </Button>
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};