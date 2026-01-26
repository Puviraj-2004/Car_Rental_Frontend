'use client';

import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Button, Stack } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { GET_BOOKING_QUERY } from '@/lib/graphql/queries';
import { VERIFY_DRIVER_PROFILE_MUTATION } from '@/lib/graphql/mutations';
import { AdminDocumentsView } from './AdminDocumentsView';

interface AdminDocumentsContainerProps {
  bookingId: string;
}

export const AdminDocumentsContainer = ({ bookingId }: AdminDocumentsContainerProps) => {
  const router = useRouter();

  // Fetch booking data
  const { data, loading, error, refetch } = useQuery(GET_BOOKING_QUERY, {
    variables: { id: bookingId },
    fetchPolicy: 'cache-and-network',
  });

  // Mutations
  const [verifyDocMutation] = useMutation(VERIFY_DRIVER_PROFILE_MUTATION, {
    onCompleted: () => refetch(),
  });

  // Action handlers
  const handleApprove = async () => {
    try {
      await verifyDocMutation({
        variables: {
          userId: bookingId, // Note: backend uses bookingId but param is named userId
          status: 'APPROVED',
        },
      });
      return true;
    } catch (e: any) {
      throw new Error(e.message || 'Failed to approve documents');
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await verifyDocMutation({
        variables: {
          userId: bookingId,
          status: 'REJECTED',
          reason,
        },
      });
      return true;
    } catch (e: any) {
      throw new Error(e.message || 'Failed to reject documents');
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
    approve: handleApprove,
    reject: handleReject,
    refresh: refetch,
  };

  return (
    <AdminDocumentsView
      booking={data.booking}
      actions={actions}
      onBack={handleBack}
    />
  );
};

export default AdminDocumentsContainer;
