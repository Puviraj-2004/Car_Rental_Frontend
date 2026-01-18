import { useEffect } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import { GET_MY_BOOKINGS_QUERY } from '@/lib/graphql/queries';
import { CANCEL_BOOKING_MUTATION } from '@/lib/graphql/mutations';

export const useBookingRecords = (status: string) => {
  const client = useApolloClient();
  const searchParams = useSearchParams();

  const { data, loading, error, refetch } = useQuery(GET_MY_BOOKINGS_QUERY, {
    fetchPolicy: 'cache-and-network',
    skip: status !== 'authenticated'
  });

  const [cancelBooking, { loading: cancelLoading }] = useMutation(CANCEL_BOOKING_MUTATION);

  // Filter out DRAFT bookings
  const bookings = data?.myBookings?.filter((b: any) => b.status !== 'DRAFT') || [];

  const handleRefresh = () => {
    client.cache.evict({ fieldName: 'myBookings' });
    client.cache.gc();
    refetch();
  };

  return {
    bookings,
    loading,
    error,
    handleRefresh,
    cancelBooking,
    cancelLoading
  };
};