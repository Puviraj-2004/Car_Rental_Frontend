'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useBookingRecords } from '@/hooks/graphql/useBookingRecords';
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
      onPay={(id: string) => router.push(`/payment/${id}`)}
      cancelLoading={cancelLoading}
    />
  );
};