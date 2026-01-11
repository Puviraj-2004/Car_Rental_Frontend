import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_CAR_QUERY, 
  GET_ME_QUERY, 
  GET_PLATFORM_SETTINGS_QUERY, 
  GET_AVAILABLE_CARS_QUERY, 
  GET_BOOKING_QUERY, 
  CHECK_CAR_AVAILABILITY_QUERY 
} from '@/lib/graphql/queries';
import { 
  CREATE_BOOKING_MUTATION, 
  CONFIRM_RESERVATION_MUTATION 
} from '@/lib/graphql/mutations';

export const useBooking = (bookingId: string | null, carQueryId: string | null, startISO: string, endISO: string, hasDates: boolean, changeCarOpen: boolean) => {
  const { data: userData } = useQuery(GET_ME_QUERY);
  const { data: platformData } = useQuery(GET_PLATFORM_SETTINGS_QUERY);

  // 1. Get Booking Data
  const { data: bookingData, loading: bookingLoading, error: bookingError } = useQuery(GET_BOOKING_QUERY, {
    variables: { id: bookingId },
    skip: !bookingId,
    fetchPolicy: 'network-only'
  });

  // 2. Get Car Details (Only if we have a car ID)
  const { data: carData, loading: carLoading, error: carError } = useQuery(GET_CAR_QUERY, {
    variables: { id: carQueryId },
    skip: !carQueryId,
    fetchPolicy: 'cache-and-network'
  });

  // 3. Availability Check
  const { data: availabilityData, loading: checkingAvailability } = useQuery(CHECK_CAR_AVAILABILITY_QUERY, {
    variables: {
      carId: carQueryId,
      startDate: startISO || new Date().toISOString(),
      endDate: endISO || new Date().toISOString()
    },
    skip: !carQueryId || !hasDates,
    fetchPolicy: 'network-only'
  });

  // 4. Other Available Cars
  const { data: availableCarsData, loading: availableCarsLoading } = useQuery(GET_AVAILABLE_CARS_QUERY, {
    variables: {
      startDate: startISO || new Date().toISOString(),
      endDate: endISO || new Date().toISOString(),
    },
    skip: !changeCarOpen || !hasDates,
    fetchPolicy: 'network-only'
  });

  const [createBooking, { loading: createBookingLoading }] = useMutation(CREATE_BOOKING_MUTATION);
  const [confirmReservation, { loading: confirmReservationLoading }] = useMutation(CONFIRM_RESERVATION_MUTATION);

  return {
    userData, platformData, 
    bookingData: bookingData?.booking, bookingLoading, bookingError,
    carData: carData?.car, carLoading, carError,
    availabilityData, checkingAvailability,
    availableCarsData, availableCarsLoading,
    createBooking, createBookingLoading,
    confirmReservation, confirmReservationLoading
  };
};