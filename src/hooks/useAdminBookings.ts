import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_BOOKINGS_QUERY } from '@/lib/graphql/queries';
import { 
  UPDATE_BOOKING_STATUS_MUTATION, 
  START_TRIP_MUTATION, 
  COMPLETE_TRIP_MUTATION,
  VERIFY_DRIVER_PROFILE_MUTATION,
  FINISH_CAR_MAINTENANCE_MUTATION
} from '@/lib/graphql/mutations';

export const useAdminBookings = () => {
  const { data, loading, error, refetch } = useQuery(GET_ALL_BOOKINGS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const [updateStatus] = useMutation(UPDATE_BOOKING_STATUS_MUTATION, { onCompleted: () => refetch() });
  const [startTrip] = useMutation(START_TRIP_MUTATION, { onCompleted: () => refetch() });
  const [completeTrip] = useMutation(COMPLETE_TRIP_MUTATION, { onCompleted: () => refetch() });
  const [verifyDoc] = useMutation(VERIFY_DRIVER_PROFILE_MUTATION, { onCompleted: () => refetch() });
  const [finishMaintenance] = useMutation(FINISH_CAR_MAINTENANCE_MUTATION, { onCompleted: () => refetch() });

  // Filter: Admin sees everything except DRAFT
  const bookings = data?.bookings?.filter((b: any) => b.status !== 'DRAFT') || [];

  return {
    bookings,
    loading,
    error,
    refetch,
    actions: { updateStatus, startTrip, completeTrip, verifyDoc, finishMaintenance }
  };
};