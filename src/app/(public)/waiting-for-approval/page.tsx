'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Paper, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function WaitingForApprovalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          maxWidth: 640,
          width: '100%',
          p: 4,
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Waiting for Approval
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your documents have been submitted successfully and are pending admin review.
          You will be able to proceed to payment once an administrator verifies your profile.
        </Typography>

        {bookingId ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Booking ID: {bookingId}
          </Typography>
        ) : null}

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={() => router.push('/booking-records')}>
            View my bookings
          </Button>
          {bookingId ? (
            <Button variant="outlined" onClick={() => router.push(`/booking-records`)}>
              Track status
            </Button>
          ) : null}
        </Box>
      </Paper>
    </Box>
  );
}
