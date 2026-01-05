'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery } from '@apollo/client';
import { Container, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { CarRental } from '@mui/icons-material';

import { GET_BOOKING_QUERY } from '@/lib/graphql/queries';
import { CREATE_STRIPE_CHECKOUT_SESSION_MUTATION } from '@/lib/graphql/mutations';

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams<{ bookingId: string }>();
  const bookingId = typeof params?.bookingId === 'string' ? params.bookingId : '';

  const { status } = useSession();
  const [redirecting, setRedirecting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch booking details
  const { data, loading, error } = useQuery(GET_BOOKING_QUERY, {
    variables: { id: bookingId },
    skip: !bookingId || status !== 'authenticated',
    fetchPolicy: 'network-only'
  });

  const [createCheckoutSession] = useMutation(CREATE_STRIPE_CHECKOUT_SESSION_MUTATION);

  const booking = data?.booking;

  // Always call this hook (no conditional hooks). It will do nothing until we have booking.
  useEffect(() => {
    const run = async () => {
      if (status !== 'authenticated') return;
      if (!booking?.id) return;
      if (booking.status !== 'VERIFIED') return;
      if (redirecting) return;

      try {
        setRedirecting(true);
        const res = await createCheckoutSession({ variables: { bookingId: booking.id } });
        const url = res?.data?.createStripeCheckoutSession?.url;
        if (!url) throw new Error('Failed to create checkout session');
        window.location.href = url;
      } catch (e: any) {
        console.error(e);
        setRedirecting(false);
      }
    };

    run();
  }, [booking?.id, booking?.status, createCheckoutSession, redirecting, status]);

  if (status === 'loading' || loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={48} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading payment details...
        </Typography>
      </Container>
    );
  }

  if (!bookingId) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">Missing bookingId</Alert>
      </Container>
    );
  }

  if (error || !booking) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">
          {error?.message || 'Booking not found or access denied.'}
        </Alert>
      </Container>
    );
  }

  // Check if booking is in correct status for payment
  if (booking.status !== 'VERIFIED') {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="warning">
          This booking is not ready for payment. Current status: {booking.status}
        </Alert>
      </Container>
    );
  }

  const totalAmount = booking.totalPrice;

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
        <CarRental sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={900} gutterBottom>
          Redirecting to secure payment...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Amount: €{Number(totalAmount || 0).toFixed(2)}
        </Typography>
        <CircularProgress />
      </Paper>
    </Container>
  );
}
