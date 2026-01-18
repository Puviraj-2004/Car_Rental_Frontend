import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_BOOKINGS_QUERY } from '@/lib/graphql/queries';
import { 
  UPDATE_BOOKING_STATUS_MUTATION, 
  START_TRIP_MUTATION, 
  COMPLETE_TRIP_MUTATION,
  VERIFY_DRIVER_PROFILE_MUTATION,
  FINISH_CAR_MAINTENANCE_MUTATION,
  CANCEL_BOOKING_MUTATION // Ensure this exists in your mutations file
} from '@/lib/graphql/mutations';

export const useAdminBookings = () => {
  const { data, loading, error, refetch } = useQuery(GET_ALL_BOOKINGS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [updateStatus] = useMutation(UPDATE_BOOKING_STATUS_MUTATION, { onCompleted: () => refetch() });
  const [startTrip] = useMutation(START_TRIP_MUTATION, { onCompleted: () => refetch() });
  const [completeTrip] = useMutation(COMPLETE_TRIP_MUTATION, { onCompleted: () => refetch() });
  const [verifyDoc] = useMutation(VERIFY_DRIVER_PROFILE_MUTATION, { onCompleted: () => refetch() });
  const [finishMaintenance] = useMutation(FINISH_CAR_MAINTENANCE_MUTATION, { onCompleted: () => refetch() });
  const [cancelBooking] = useMutation(CANCEL_BOOKING_MUTATION, { onCompleted: () => refetch() });

  // 1. Filter out Drafts
  const rawBookings = data?.bookings?.filter((b: any) => b.status !== 'DRAFT') || [];

  // 2. Apply Search & Status Filter
  const filteredBookings = useMemo(() => {
    return rawBookings.filter((b: any) => {
      // Status Filter
      if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;

      // Search Logic (ID, Name, or Plate Number)
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        b.id.toLowerCase().includes(query) ||
        b.user?.fullName?.toLowerCase().includes(query) ||
        b.car?.plateNumber?.toLowerCase().includes(query);

      return matchesSearch;
    });
  }, [rawBookings, searchQuery, statusFilter]);

  // Handle Cancellation
  const handleCancelBooking = async (id: string, reason: string) => {
    try {
      console.log(`Cancelling booking ${id}. Reason: ${reason}`); 
      // In a real scenario, you'd pass the reason variables: { id, reason }
      await cancelBooking({ variables: { id } });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return {
    bookings: filteredBookings,
    totalCount: rawBookings.length,
    loading,
    error,
    refetch,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    actions: { 
      updateStatus, 
      startTrip, 
      completeTrip, 
      verifyDoc, 
      finishMaintenance,
      cancelBooking: handleCancelBooking // Expose the wrapper function
    }
  };
};