'use client';

import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useStripePayment } from '@/hooks/useStripePayment';
import {StripeCheckoutView}  from './StripeCheckoutView';

interface CheckoutProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
}

/**
 * Senior Architect Note:
 * StripeCheckoutForm acts as the Container for payment logic.
 * It manages Stripe hooks and coordinates with useStripePayment hook.
 */
export default function StripeCheckoutForm({ bookingId, amount, onSuccess }: CheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const { processServerPayment } = useStripePayment();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card details not found.');
      setProcessing(false);
      return;
    }

    try {
      // 1. Create Payment Method in Stripe
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // 2. Process payment on our server
      const { data } = await processServerPayment({
        bookingId: bookingId,
        amount: amount,
        currency: "EUR",
        paymentMethod: "CREDIT_CARD",
        transactionId: paymentMethod.id,
      });

      // 3. Handle Success
      if (data?.createPayment?.status === 'COMPLETED' || data?.createPayment?.status === 'PENDING' || data?.createPayment?.status === 'SUCCEEDED') {
         onSuccess(); 
      } else {
         setError('Payment was not successful. Please try again.');
      }

    } catch (err: any) {
      setError(err.message || 'Payment processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <StripeCheckoutView
      amount={amount}
      error={error}
      processing={processing}
      stripeReady={!!stripe && !!elements}
      onSubmit={handleSubmit}
    />
  );
}