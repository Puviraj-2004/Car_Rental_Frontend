'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePayment } from '@/hooks/graphql/usePayment';
import { PaymentView } from './PaymentView';

interface PaymentContainerProps {
  bookingId: string;
}

export const PaymentContainer = ({ bookingId }: PaymentContainerProps) => {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  
  // Only use the main payment hook (Stripe Redirect Flow)
  const { status, booking, loading, error, createCheckoutSession } = usePayment(bookingId);

  // Auth Guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Auto-Redirect to Stripe
  // Trigger Stripe on explicit user action to avoid unexpected GraphQL calls
  const handleProceedToStripe = async () => {
    if (status !== 'authenticated' || !booking?.id) return;
    try {
      setRedirecting(true);
      const res = await createCheckoutSession({ variables: { bookingId: booking.id } });
      const url = res?.data?.createStripeCheckoutSession?.url;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No redirection URL received');
      }
    } catch (e) {
      console.error('Stripe Redirection Error:', e);
      setRedirecting(false);
    }
  };

  return (
    <PaymentView 
      status={status}
      loading={loading || redirecting}
      error={error}
      booking={booking}
      bookingId={bookingId}
      onProceed={handleProceedToStripe}
    />
  );
};