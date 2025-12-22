'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Container, Paper, Typography, Button, TextField, Alert, Stack } from '@mui/material';

const VERIFY_OTP = gql`
  mutation VerifyOTP($email: String!, $otp: String!) {
    verifyOTP(email: $email, otp: $otp) {
      success
      message
    }
  }
`;

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || ''; // URL-இல் இருந்து email-ஐ எடுக்கும்

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [verifyOTP, { loading }] = useMutation(VERIFY_OTP);

  // பெட்டிக்கு பெட்டி தானாக நகர (Auto-focus logic)
  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setError('Please enter all 6 digits');
      return;
    }

    try {
      const { data } = await verifyOTP({ variables: { email, otp: otpString } });
      if (data.verifyOTP.success) {
        setSuccess('Account verified! Redirecting to login...');
        setTimeout(() => router.push('/auth/login'), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: '#f5f7fa' }}>
      <Container maxWidth="xs">
        <Paper elevation={4} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>Verify Your Email</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            We've sent a 6-digit code to <b>{email}</b>
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 4 }}>
            {otp.map((digit, index) => (
              <TextField
                key={index}
                inputRef={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                inputProps={{ 
                  maxLength: 1, 
                  style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', width: '35px', padding: '10px' } 
                }}
              />
            ))}
          </Stack>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ bgcolor: '#293D91', py: 1.5, borderRadius: 2 }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}