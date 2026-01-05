'use client';

import React, { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { Container, Paper, Typography, Stack, Button, Alert, CircularProgress } from '@mui/material';
import { CreditCard, Cancel, CheckCircle } from '@mui/icons-material';

import { GET_BOOKING_QUERY } from '@/lib/graphql/queries';
import { MOCK_FINALIZE_PAYMENT_MUTATION } from '@/lib/graphql/mutations';

export default function MockCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = useMemo(() => searchParams.get('bookingId') || '', [searchParams]);

  const { data, loading, error } = useQuery(GET_BOOKING_QUERY, {
    variables: { id: bookingId },
    skip: !bookingId,
    fetchPolicy: 'network-only',
  });

  const [finalizePayment, { loading: finalizeLoading }] = useMutation(MOCK_FINALIZE_PAYMENT_MUTATION);

  const booking = data?.booking;

  const handleAction = async (success: boolean) => {
    if (!bookingId) return;
    try {
      await finalizePayment({ variables: { bookingId, success } });
      router.push(success ? `/payment/success?bookingId=${bookingId}` : `/payment/cancel?bookingId=${bookingId}`);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to finalize mock payment');
    }
  };

  if (!bookingId) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">Missing bookingId</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
          Loading mock checkout...
        </Typography>
      </Container>
    );
  }

  if (error || !booking) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">{error?.message || 'Booking not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CreditCard color="primary" />
            <Typography variant="h6" fontWeight={900}>
              Mock Stripe Checkout
            </Typography>
          </Stack>

          <Alert severity="info">
            MOCK_STRIPE is enabled. This page simulates Stripe checkout without any external API.
          </Alert>

          <Typography variant="body2" color="text.secondary">
            Booking: #{booking.id.slice(-6).toUpperCase()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current Status: {booking.status}
          </Typography>
          <Typography variant="h6" fontWeight={900}>
            Amount: €{Number(booking.totalPrice || 0).toFixed(2)}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<CheckCircle />}
              disabled={finalizeLoading}
              onClick={() => handleAction(true)}
              sx={{ bgcolor: '#0F172A', fontWeight: 900 }}
            >
              Pay (Success)
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              disabled={finalizeLoading}
              onClick={() => handleAction(false)}
              sx={{ fontWeight: 900 }}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
