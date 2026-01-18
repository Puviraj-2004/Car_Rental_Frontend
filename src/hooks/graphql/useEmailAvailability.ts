import { useLazyQuery } from '@apollo/client';
import { IS_EMAIL_AVAILABLE_QUERY } from '@/lib/graphql/queries';

export const useEmailAvailability = () => {
  const [checkEmail, { data, loading, error }] = useLazyQuery(IS_EMAIL_AVAILABLE_QUERY, {
    fetchPolicy: 'network-only'
  });

  const isAvailable = data?.isEmailAvailable ?? null;

  const executeCheck = async (email: string) => {
    if (!email || email.length < 5) return null;
    try {
      const res = await checkEmail({ variables: { email } });
      return res.data?.isEmailAvailable ?? null;
    } catch (e) {
      return null;
    }
  };

  return { executeCheck, isAvailable, loading, error };
};