'use client';

import React from 'react';
import { Container, Typography, Paper, Alert, CircularProgress, Box, Stack, Divider, Button } from '@mui/material';

interface PaymentViewProps {
  status: string;
  loading: boolean;
  error: any;
  booking: any;
  bookingId: string;
  onProceed?: () => void;
}

export const PaymentView = ({ status, loading, error, booking, bookingId, onProceed }: PaymentViewProps) => {
  // Loading State
  if (status === 'loading' || loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <CircularProgress size={40} sx={{ color: '#0F172A' }} />
        <Typography variant="body1" sx={{ mt: 3, color: '#64748B', fontWeight: 500 }}>
          Connecting to secure payment gateway...
        </Typography>
      </Container>
    );
  }

  // Error: Missing ID
  if (!bookingId) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error" variant="filled" sx={{ borderRadius: 3 }}>Missing Booking Reference</Alert>
      </Container>
    );
  }

  // Error: API Error or Not Found
  if (error || !booking) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error" variant="outlined" sx={{ borderRadius: 3, bgcolor: '#FFF' }}>
          {error?.message || 'Booking not found or access denied.'}
        </Alert>
      </Container>
    );
  }

  // Warning: Status Mismatch (If user manually navigates here)
  if (booking.status !== 'VERIFIED') {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="warning" variant="outlined" sx={{ borderRadius: 3, bgcolor: '#FFF' }}>
          <Typography fontWeight={700}>Payment Not Required</Typography>
          This booking is currently <b>{booking.status}</b>. 
          {booking.status === 'CONFIRMED' ? ' Payment has already been received.' : ' Please wait for verification.'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 12 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 6, 
          borderRadius: 6, 
          textAlign: 'center', 
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Box sx={{ p: 2, bgcolor: '#F1F5F9', borderRadius: '50%', color: '#0F172A', display: 'flex' }}>
            <CircularProgress size={48} thickness={2} sx={{ color: '#0F172A' }} />
          </Box>
          
          <Box>
            <Typography variant="h5" fontWeight={900} color="#0F172A" gutterBottom>
              Redirecting to Stripe
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You are being securely redirected to complete your payment.
            </Typography>
          </Box>

          <Divider sx={{ width: '100%', borderStyle: 'dashed' }} />

          <Box sx={{ width: '100%', p: 2, bgcolor: '#F8FAFC', borderRadius: 3 }}>
             <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography variant="caption" fontWeight={700} color="#64748B">BOOKING REF</Typography>
                <Typography variant="caption" fontWeight={800}>#{booking.id.slice(-8).toUpperCase()}</Typography>
             </Stack>
             <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" fontWeight={700} color="#64748B">AMOUNT DUE</Typography>
                <Typography variant="body1" fontWeight={900} color="#0F172A">€{Number(booking.totalPrice || 0).toFixed(2)}</Typography>
             </Stack>
          </Box>

          <Stack spacing={2} sx={{ width: '100%' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#10B981', opacity: 0.8 }}>
              <Typography variant="caption" fontWeight={700}>SSL ENCRYPTED SECURE PAYMENT</Typography>
            </Stack>
            <Box>
              <Button fullWidth variant="contained" onClick={onProceed} disabled={!onProceed} sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' } }}>Proceed to Payment</Button>
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>{error.message || 'Failed to initiate payment. Please try again.'}</Alert>
              )}
            </Box>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};