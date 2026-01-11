'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMockPayment } from '@/hooks/graphql/useMockPayment';
import { MockPaymentView } from './MockPaymentView';

export const MockPaymentContainer = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');
  const { executeMockPayment, loading } = useMockPayment();

  const handleSimulate = async (success: boolean) => {
    if (!bookingId) return;
    try {
      await executeMockPayment(bookingId, success);
      if (success) {
        router.push(`/payment/success?bookingId=${bookingId}`);
      } else {
        router.push(`/payment/cancel?bookingId=${bookingId}`);
      }
    } catch (e) {
      alert("Mock Payment Error");
    }
  };

  return (
    <MockPaymentView 
      bookingId={bookingId} 
      loading={loading} 
      onSimulate={handleSimulate} 
    />
  );
};