'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery } from '@apollo/client';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Box, Container, Typography, Paper, Alert, CircularProgress,
  Divider, Stack, Chip, Grid
} from '@mui/material';
import {
  CreditCard, Security, CheckCircle, Euro, CarRental
} from '@mui/icons-material';

// Import our existing Stripe component
import StripeCheckoutForm from '@/components/StripeCheckoutForm';

// GraphQL Queries
import { GET_BOOKING_QUERY } from '@/lib/graphql/queries';

// Initialize Stripe (this should be from env variable)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

interface PaymentPageProps {
  params: {
    bookingId: string;
  };
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch booking details
  const { data, loading, error } = useQuery(GET_BOOKING_QUERY, {
    variables: { id: params.bookingId },
    skip: !params.bookingId || status !== 'authenticated',
    fetchPolicy: 'network-only'
  });

  const booking = data?.booking;

  // Handle payment success
  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    // Redirect after success animation
    setTimeout(() => {
      router.push('/booking-records');
    }, 3000);
  };

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
  if (booking.status !== 'AWAITING_PAYMENT') {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="warning">
          This booking is not ready for payment. Current status: {booking.status}
        </Alert>
      </Container>
    );
  }

  // Calculate total amount including surcharge
  const totalAmount = booking.totalFinalPrice || booking.totalPrice;

  if (paymentSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" color="success.main" gutterBottom>
            Payment Successful! 🎉
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Your booking has been confirmed
          </Typography>

          <Box sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto', mb: 3 }}>
            <Typography variant="h6" gutterBottom>Booking Details:</Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Booking ID:</Typography>
                <Typography fontWeight="bold">{booking.id.slice(-8)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Car:</Typography>
                <Typography>{booking.car.brand.name} {booking.car.model.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Amount Paid:</Typography>
                <Typography fontWeight="bold">€{totalAmount.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Status:</Typography>
                <Chip label="CONFIRMED" color="success" size="small" />
              </Box>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Redirecting to your booking records...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <CarRental sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Complete Your Booking
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Secure payment to confirm your car rental
          </Typography>
        </Box>

        {/* Booking Summary */}
        <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <CarRental sx={{ mr: 1 }} />
            Booking Summary
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Car:</Typography>
                <Typography fontWeight="bold">
                  {booking.car.brand.name} {booking.car.model.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Pickup:</Typography>
                <Typography>{new Date(booking.startDate).toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Return:</Typography>
                <Typography>{new Date(booking.endDate).toLocaleDateString()}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Base Price:</Typography>
                <Typography>€{booking.basePrice}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tax (20%):</Typography>
                <Typography>€{booking.taxAmount.toFixed(2)}</Typography>
              </Box>
              {booking.surchargeAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="orange">Young Driver Fee:</Typography>
                  <Typography color="orange">€{booking.surchargeAmount.toFixed(2)}</Typography>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">Total:</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  €{totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Security Notice */}
        <Alert severity="info" sx={{ mt: 2 }} icon={<Security />}>
          <Typography variant="body2">
            <strong>Secure Payment:</strong> Your payment information is encrypted and processed securely by Stripe.
            We do not store your credit card details.
          </Typography>
        </Alert>
      </Paper>

      {/* Stripe Payment Form */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <CreditCard sx={{ mr: 1 }} />
          Payment Details
        </Typography>

        <Elements stripe={stripePromise}>
          <StripeCheckoutForm
            bookingId={params.bookingId}
            amount={totalAmount}
            onSuccess={handlePaymentSuccess}
          />
        </Elements>
      </Paper>
    </Container>
  );
}
