'use client';

import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { gql, useMutation } from '@apollo/client/react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { getTranslation } from '@/lib/i18n';

// GraphQL mutation to create booking
const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      startDate
      endDate
      totalPrice
      basePrice
      taxAmount
      status
    }
  }
`;

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#000',
      fontFamily: 'Arial, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: 'rgba(0,0,0,0.5)',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

export default function StripeCheckoutForm({ 
  carId, 
  startDate, 
  endDate, 
  pickupLocation, 
  dropoffLocation,
  onSuccess 
}: { 
  carId: string; 
  startDate: string; 
  endDate: string; 
  pickupLocation: string; 
  dropoffLocation: string;
  onSuccess: (bookingId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Get language from localStorage or default to 'en'
    const lang = typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en';
    setLanguage(lang);
  }, []);

  const [createBooking] = useMutation(CREATE_BOOKING);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProcessing(true);
    setError('');

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      setError(getTranslation(language, 'errors.stripeNotLoaded'));
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError(getTranslation(language, 'errors.cardElementNotFound'));
      setProcessing(false);
      return;
    }

    try {
      // Create booking in our system first
      const { data } = await createBooking({
        variables: {
          input: {
            carId,
            startDate,
            endDate,
            pickupLocation: pickupLocation || null,
            dropoffLocation: dropoffLocation || null,
          }
        }
      });

      // In a real implementation, we would call our backend to create a Stripe payment intent
      // and then confirm the payment with Stripe.js
      // For this example, we'll simulate a successful payment

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate successful payment
      const paymentResult = { error: null };

      if (paymentResult.error) {
        setError(paymentResult.error.message);
      } else {
        // Payment successful, redirect to success page
        onSuccess(data.createBooking.id);
      }
    } catch (err: any) {
      setError(err.message || getTranslation(language, 'errors.generic'));
    }

    setProcessing(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        label={getTranslation(language, 'booking.email')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      
      <TextField
        label={getTranslation(language, 'booking.nameOnCard')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      
      <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1, mt: 2, mb: 2 }}>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Button 
        type="submit"
        variant="contained" 
        color="primary" 
        size="large"
        disabled={!stripe || processing}
        fullWidth
        sx={{ mt: 2 }}
      >
        {processing ? (
          <>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            {getTranslation(language, 'booking.processing')}
          </>
        ) : (
          getTranslation(language, 'booking.payNow')
        )}
      </Button>
      
      <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
        {getTranslation(language, 'booking.testCardInfo')}
      </Typography>
    </Box>
  );
}