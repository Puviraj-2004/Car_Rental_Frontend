'use client';

import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Button, Stack } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { GET_BOOKING_QUERY } from '@/lib/graphql/queries';
import {
  START_TRIP_MUTATION,
  COMPLETE_TRIP_MUTATION,
  VERIFY_DRIVER_PROFILE_MUTATION,
  CANCEL_BOOKING_MUTATION,
} from '@/lib/graphql/mutations';
import { AdminBookingDetailsView } from './AdminBookingDetailsView';

interface AdminBookingDetailsContainerProps {
  bookingId: string;
}

export const AdminBookingDetailsContainer = ({ bookingId }: AdminBookingDetailsContainerProps) => {
  const router = useRouter();

  // Fetch booking data
  const { data, loading, error, refetch } = useQuery(GET_BOOKING_QUERY, {
    variables: { id: bookingId },
    fetchPolicy: 'cache-and-network',
  });

  // Mutations
  const [startTrip] = useMutation(START_TRIP_MUTATION, { onCompleted: () => refetch() });
  const [completeTrip] = useMutation(COMPLETE_TRIP_MUTATION, { onCompleted: () => refetch() });
  const [verifyDoc] = useMutation(VERIFY_DRIVER_PROFILE_MUTATION, { onCompleted: () => refetch() });
  const [cancelBookingMutation] = useMutation(CANCEL_BOOKING_MUTATION, { onCompleted: () => refetch() });

  // Action handlers
  const handleStartTrip = async (bookingId: string, startOdometer?: number, pickupNotes?: string) => {
    try {
      await startTrip({
        variables: {
          bookingId,
          ...(startOdometer !== undefined && { startOdometer }),
          ...(pickupNotes && { pickupNotes }),
        },
      });
      return true;
    } catch (e: any) {
      throw new Error(e.message || 'Failed to start trip');
    }
  };

  const handleCancelBooking = async (id: string, reason: string) => {
    try {
      await cancelBookingMutation({ variables: { id } });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Loading state
  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Stack spacing={2} alignItems="center">
          <Typography color="error" variant="h6">
            Failed to load booking details
          </Typography>
          <Typography color="text.secondary">{error.message}</Typography>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={handleBack}>
            Go Back
          </Button>
        </Stack>
      </Box>
    );
  }

  // Not found state
  if (!data?.booking) {
    return (
      <Box sx={{ p: 4 }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h6">Booking not found</Typography>
          <Typography color="text.secondary">The booking you&apos;re looking for doesn&apos;t exist.</Typography>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={handleBack}>
            Go Back
          </Button>
        </Stack>
      </Box>
    );
  }

  const actions = {
    startTrip: handleStartTrip,
    completeTrip,
    verifyDoc,
    cancelBooking: handleCancelBooking,
    refreshBooking: refetch,
  };

  return (
    <AdminBookingDetailsView
      booking={data.booking}
      actions={actions}
      onBack={handleBack}
    />
  );
};

export default AdminBookingDetailsContainer;
