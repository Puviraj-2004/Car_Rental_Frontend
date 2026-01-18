'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAdminBookings } from '@/hooks/useAdminBookings';
import { AdminBookingsView } from './AdminBookingsView';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

// Dynamically import the heavy modal component
const AdminBookingDetailsModal = dynamic(
  () => import('./AdminBookingDetailsModal').then(mod => mod.AdminBookingDetailsModal),
  { 
    loading: () => <CircularProgress />,
    ssr: false 
  }
);

export const AdminBookingsContainer = () => {
  const router = useRouter();
  const { 
    bookings, loading, error, 
    searchQuery, setSearchQuery, 
    statusFilter, setStatusFilter,
    actions 
  } = useAdminBookings();

  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRowClick = (booking: any) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const handleCreateClick = () => {
    // Navigate to a dedicated admin creation page or open a create modal
    // For now, let's assume route:
    router.push('/admin/bookings/create'); 
  };

  if (loading && !bookings.length) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">Error loading records: {error.message}</Typography>;

  return (
    <>
      <AdminBookingsView 
        bookings={bookings} 
        onRowClick={handleRowClick}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onCreateClick={handleCreateClick}
      />
      {modalOpen && (
        <AdminBookingDetailsModal 
          open={modalOpen} 
          onClose={() => setModalOpen(false)} 
          booking={selectedBooking} 
          actions={actions}
        />
      )}
    </>
  );
};