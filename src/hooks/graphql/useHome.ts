import { useQuery } from '@apollo/client';
import { GET_CARS_QUERY } from '@/lib/graphql/queries';

export const useHome = () => {
  const { data, loading, error } = useQuery(GET_CARS_QUERY, {
    variables: { filter: { statuses: ['AVAILABLE'] } },
    fetchPolicy: 'cache-and-network'
  });

  const featuredCars = data?.cars?.slice(0, 3) || [];

  return {
    featuredCars,
    loading,
    error
  };
};