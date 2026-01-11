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
  const { status, booking, loading, error, createCheckoutSession } = usePayment(bookingId);

  // Auth Guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Redirection Logic (Preserved from original)
  useEffect(() => {
    const triggerStripe = async () => {
      if (status !== 'authenticated' || !booking?.id || booking.status !== 'VERIFIED' || redirecting) {
        return;
      }

      try {
        setRedirecting(true);
        const res = await createCheckoutSession({ 
          variables: { bookingId: booking.id } 
        });
        
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

    triggerStripe();
  }, [booking, status, createCheckoutSession, redirecting]);

  return (
    <PaymentView 
      status={status}
      loading={loading}
      error={error}
      booking={booking}
      bookingId={bookingId}
    />
  );
};