'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Grid, Alert, CircularProgress, Stack } from '@mui/material';
import { useMutation } from '@apollo/client';
import { useRouter, useSearchParams } from 'next/navigation';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

// GraphQL
import { VERIFY_OTP_MUTATION } from '@/lib/graphql/mutations';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || ''; // URL-ல் இருந்து மின்னஞ்சலை எடுக்கிறோம்

  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6-digit OTP input state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mutation
  const [verifyOtp, { loading }] = useMutation(VERIFY_OTP_MUTATION, {
    onCompleted: (data) => {
      if (data.verifyOTP.success) {
        setSuccess('Email verified successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    },
    onError: (err) => {
      setError(err.message || 'Verification failed. Please check the code.');
    }
  });

  // OTP Input கையாளும் முறை (தானாக அடுத்த பெட்டிக்குச் செல்லும் வசதியுடன்)
  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return; // எண்களை மட்டுமே அனுமதிக்கும்
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // அடுத்த பெட்டிக்கு Focus-ஐ மாற்ற
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    verifyOtp({ variables: { email, otp: fullOtp } });
  };

  return (
    <Grid container component="main" sx={{ height: '100vh', bgcolor: 'white' }}>
      
      {/* LEFT SIDE: Visual Content (Consistent with Auth Flow) */}
      <Grid item xs={0} md={6} sx={{ 
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
        p: 6
      }}>
        <Box sx={{ textAlign: 'center', color: 'white' }}>
           <MarkEmailReadIcon sx={{ fontSize: 80, mb: 3 }} />
           <Typography variant="h3" fontWeight="bold">Verify Your Email</Typography>
           <Typography variant="h6" sx={{ mt: 2, opacity: 0.8 }}>
             We've sent a 6-digit code to <br /> <b>{email}</b>
           </Typography>
        </Box>
      </Grid>

      {/* RIGHT SIDE: OTP Form */}
      <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', px: { xs: 3, md: 8 } }}>
        <Box sx={{ width: '100%', maxWidth: '400px', mx: 'auto', textAlign: 'center' }}>
          
          <Typography variant="h4" fontWeight="900" color="#1F2937" sx={{ mb: 1 }}>Check your inbox 📥</Typography>
          <Typography variant="body1" color="#6B7280" sx={{ mb: 4 }}>
            Enter the verification code we sent to your email to activate your account.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 4 }}>
              {otp.map((digit, index) => (
                <TextField
                  key={index}
                  id={`otp-${index}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => {
                    // Backspace அழுத்தினால் முந்தைய பெட்டிக்குச் செல்லும்
                    if (e.key === 'Backspace' && !otp[index] && index > 0) {
                      document.getElementById(`otp-${index - 1}`)?.focus();
                    }
                  }}
                  variant="outlined"
                  inputProps={{ 
                    style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', padding: '12px' },
                    maxLength: 1
                  }}
                  sx={{ 
                    width: { xs: '45px', sm: '55px' },
                    '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F3F4F6' }
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
                bgcolor: '#2563EB', 
                color: '#fff', 
                py: 2, 
                borderRadius: '16px', 
                fontWeight: '700',
                fontSize: '1rem',
                boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.4)'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Account'}
            </Button>
          </form>

          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="#6B7280">
              Didn't receive the code? {' '}
              <Button sx={{ fontWeight: 700, color: '#2563EB', textTransform: 'none' }}>
                Resend OTP
              </Button>
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}