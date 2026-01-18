'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { WaitingForApprovalView } from './WaitingForApprovalView';

/**
 * Senior Architect Note:
 * This container handles URL parameter extraction.
 * It is separated from the View to keep the UI pure.
 */
export const WaitingForApprovalContainer = () => {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return <WaitingForApprovalView bookingId={bookingId} />;
};