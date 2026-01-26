'use client';

import React, { useState } from 'react';
import { useAdminBookings } from '@/hooks/useAdminBookings';
import { AdminBookingsView } from './AdminBookingsView';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

type ViewFilter = {
  label?: string;
  bookingType?: 'RENTAL' | 'REPLACEMENT';
  walkInOnly?: boolean;
};

export const AdminBookingsContainer = ({ viewFilter }: { viewFilter?: ViewFilter }) => {
  const router = useRouter();
  const { 
    bookings, loading, error, 
    searchQuery, setSearchQuery, 
    statusFilter, setStatusFilter,
  } = useAdminBookings({ bookingType: viewFilter?.bookingType, walkInOnly: viewFilter?.walkInOnly });

  const handleRowClick = (booking: any) => {
    // Navigate to booking details page instead of opening modal
    router.push(`/admin/bookings/${booking.id}`);
  };

  const handleCreateClick = () => {
    // Route to car selection page with correct params
    const params = new URLSearchParams();
    if (viewFilter?.bookingType === 'REPLACEMENT') {
      params.set('bookingType', 'REPLACEMENT');
      params.set('totalPrice', '0');
    } else {
      params.set('bookingType', 'RENTAL');
    }
    if (viewFilter?.walkInOnly) {
      params.set('isWalkIn', 'true');
    }
    router.push(`/admin/bookings/cars?${params.toString()}`);
  };

  if (loading && !bookings.length) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">Error loading records: {error.message}</Typography>;

  return (
    <AdminBookingsView 
      bookings={bookings} 
      onRowClick={handleRowClick}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      onCreateClick={handleCreateClick}
      viewLabel={viewFilter?.label}
    />
  );
};