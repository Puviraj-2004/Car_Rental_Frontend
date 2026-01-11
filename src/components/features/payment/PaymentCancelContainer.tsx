'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentCancelView } from './PaymentCancelView';

/**
 * Senior Architect Note:
 * This container extracts the search parameters.
 * Since it uses useSearchParams(), it MUST be wrapped in Suspense in the page layer.
 */
export const PaymentCancelContainer = () => {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return <PaymentCancelView bookingId={bookingId} />;
};