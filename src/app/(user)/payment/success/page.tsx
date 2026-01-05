'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Container, Paper, Typography, Button, Stack } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookingId = searchParams.get('bookingId');

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 72, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={900} gutterBottom>
          Payment Successful
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {bookingId ? `Booking ${bookingId.slice(-6).toUpperCase()} has been paid.` : 'Your payment has been received.'}
        </Typography>
        <Stack direction="row" spacing={1.5} justifyContent="center">
          <Button variant="contained" onClick={() => router.push('/bookingRecords')} sx={{ bgcolor: '#0F172A', fontWeight: 900 }}>
            Back to Bookings
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
