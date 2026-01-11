import { useQuery } from '@apollo/client';
import { GET_CAR_QUERY } from '@/lib/graphql/queries';

export const useCarDetails = (carId: string) => {
  const { data, loading, error } = useQuery(GET_CAR_QUERY, {
    variables: { id: carId },
    fetchPolicy: 'cache-and-network',
  });

  return {
    car: data?.car,
    loading,
    error,
  };
};