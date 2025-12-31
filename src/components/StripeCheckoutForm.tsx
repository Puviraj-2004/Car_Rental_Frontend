'use client';

import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

const CREATE_PAYMENT = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      id
      status
      transactionId
      booking {
        id
        status
      }
    }
  }
`;

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

interface CheckoutProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
}

export default function StripeCheckoutForm({ bookingId, amount, onSuccess }: CheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const [createPayment] = useMutation(CREATE_PAYMENT);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProcessing(true);
    setError('');

    if (!stripe || !elements) {
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Credit card details not found.');
      setProcessing(false);
      return;
    }

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      const { data } = await createPayment({
        variables: {
          input: {
            bookingId: bookingId,
            amount: amount,
            currency: "EUR",
            paymentMethod: "CREDIT_CARD",
            transactionId: paymentMethod.id,
          }
        }
      });

      if (data?.createPayment?.status === 'COMPLETED' || data?.createPayment?.status === 'PENDING') {
         onSuccess(); 
      } else {
         setError('Payment failed on server side.');
      }

    } catch (err: any) {
      setError(err.message || 'Payment processing failed.');
    }

    setProcessing(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: 'auto', p: 2 }}>
      
      <Typography variant="h6" gutterBottom>
        Pay €{amount.toFixed(2)} to Confirm
      </Typography>

      <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa', mb: 3 }}>
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
        sx={{ py: 1.5, fontWeight: 'bold' }}
      >
        {processing ? (
          <>
            <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
            Processing...
          </>
        ) : (
          `Pay €${amount.toFixed(2)}`
        )}
      </Button>
      
      <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
        Payments are secured by Stripe.
      </Typography>
    </Box>
  );
}