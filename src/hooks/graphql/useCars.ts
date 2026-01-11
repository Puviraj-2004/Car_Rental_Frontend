import { useQuery, useMutation } from '@apollo/client';
import { GET_CARS_QUERY, GET_CAR_ENUMS, GET_BRANDS_QUERY } from '@/lib/graphql/queries';
import { CREATE_BOOKING_MUTATION } from '@/lib/graphql/mutations';

export const useCars = (filterPayload: any, shouldSkip: boolean) => {
  const { data: carsData, loading: carsLoading, error: carsError } = useQuery(GET_CARS_QUERY, {
    variables: { filter: filterPayload },
    fetchPolicy: 'cache-and-network',
    skip: shouldSkip 
  });

  const { data: enumData } = useQuery(GET_CAR_ENUMS);
  const { data: brandData } = useQuery(GET_BRANDS_QUERY);
  const [createBooking, { loading: isBooking }] = useMutation(CREATE_BOOKING_MUTATION);

  return {
    cars: carsData?.cars || [],
    enums: enumData || {},
    brands: brandData?.brands || [],
    loading: carsLoading || isBooking,
    error: carsError,
    createBooking
  };
};