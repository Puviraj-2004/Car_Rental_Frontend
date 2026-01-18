'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentSuccessView } from './PaymentSuccessView';

/**
 * Senior Architect Note:
 * This container handles client-side dynamic parameters.
 * Since useSearchParams() can cause pre-render bailing, we wrap the consumer.
 */
export const PaymentSuccessContainer = () => {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return <PaymentSuccessView bookingId={bookingId} />;
};