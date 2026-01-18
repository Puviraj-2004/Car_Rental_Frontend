import { useQuery } from '@apollo/client';
import { GET_PLATFORM_SETTINGS_QUERY } from '@/lib/graphql/queries';

export const useFooter = () => {
  const { data, loading, error } = useQuery(GET_PLATFORM_SETTINGS_QUERY);

  return {
    settings: data?.platformSettings || {},
    loading,
    error
  };
};