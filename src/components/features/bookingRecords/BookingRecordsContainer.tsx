'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useBookingRecords } from '@/hooks/graphql/useBookingRecords';
import { useMutation } from '@apollo/client';
import { CREATE_STRIPE_CHECKOUT_SESSION_MUTATION } from '@/lib/graphql/mutations';
import { BookingRecordsView } from './BookingRecordsView';

export const BookingRecordsContainer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  
  const { bookings, loading, handleRefresh, cancelBooking, cancelLoading } = useBookingRecords(status);

  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copySnack, setCopySnack] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?redirect=/bookingRecords');
    if (searchParams.get('refresh')) {
      handleRefresh();
      router.replace('/bookingRecords');
    }
  }, [status, searchParams]);

  const handleCancel = async (id: string) => {
    if (window.confirm("Cancel this booking?")) {
      await cancelBooking({ variables: { id } });
      setDetailsOpen(false);
      handleRefresh();
    }
  };

  const [createCheckoutSession] = useMutation(CREATE_STRIPE_CHECKOUT_SESSION_MUTATION);

  const handleDirectPay = async (id: string) => {
    try {
      const res = await createCheckoutSession({ variables: { bookingId: id } });
      const url = res?.data?.createStripeCheckoutSession?.url;
      if (url) {
        window.location.href = url;
      } else {
        // fallback to internal payment page
        router.push(`/payment/${id}`);
      }
    } catch (err) {
      console.error('Payment redirect failed', err);
      router.push(`/payment/${id}`);
    }
  };

  return (
    <BookingRecordsView
      bookings={bookings}
      loading={loading}
      onRowClick={(b: any) => { setSelectedBooking(b); setDetailsOpen(true); }}
      detailsOpen={detailsOpen}
      setDetailsOpen={setDetailsOpen}
      selectedBooking={selectedBooking}
      copySnack={copySnack}
      setCopySnack={setCopySnack}
      onCopyLink={(token: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/verification/${token}`);
        setCopySnack(true);
      }}
      onCancel={handleCancel}
      onEdit={(id: string) => router.push(`/booking?bookingId=${id}`)}
      onPay={(id: string) => handleDirectPay(id)}
      cancelLoading={cancelLoading}
    />
  );
};