'use client';

import React, { useState } from 'react';
import { useAdminBookings } from '@/hooks/useAdminBookings';
import { AdminBookingsView } from './AdminBookingsView';
import { AdminBookingDetailsModal } from './AdminBookingDetailsModal';
import { Box, CircularProgress, Typography } from '@mui/material';

export const AdminBookingsContainer = () => {
  const { bookings, loading, error, actions } = useAdminBookings();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRowClick = (booking: any) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  if (loading && !bookings.length) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">Error loading records: {error.message}</Typography>;

  return (
    <>
      <AdminBookingsView 
        bookings={bookings} 
        onRowClick={handleRowClick} 
      />
      <AdminBookingDetailsModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        booking={selectedBooking} 
        actions={actions}
      />
    </>
  );
};