import { useSession } from 'next-auth/react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BOOKING_QUERY } from '@/lib/graphql/queries';
import { CREATE_STRIPE_CHECKOUT_SESSION_MUTATION } from '@/lib/graphql/mutations';

export const usePayment = (bookingId: string) => {
  const { status } = useSession();

  const { data, loading, error } = useQuery(GET_BOOKING_QUERY, {
    variables: { id: bookingId },
    skip: !bookingId || status !== 'authenticated',
    fetchPolicy: 'network-only' // Always fetch fresh status
  });

  const [createCheckoutSession] = useMutation(CREATE_STRIPE_CHECKOUT_SESSION_MUTATION);

  return {
    status,
    booking: data?.booking,
    loading,
    error,
    createCheckoutSession
  };
};