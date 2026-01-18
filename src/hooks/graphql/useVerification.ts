import { useQuery, useMutation } from '@apollo/client';
import { GET_BOOKING_BY_TOKEN_QUERY } from '@/lib/graphql/queries';
import { 
  CREATE_OR_UPDATE_VERIFICATION_MUTATION, 
  PROCESS_DOCUMENT_OCR_MUTATION 
} from '@/lib/graphql/mutations';

export const useVerification = (token: string) => {
  const { data: bookingData, loading: bookingLoading } = useQuery(GET_BOOKING_BY_TOKEN_QUERY, { 
    variables: { token }, 
    skip: !token,
    fetchPolicy: 'network-only' 
  });

  const [processOCR] = useMutation(PROCESS_DOCUMENT_OCR_MUTATION);
  const [updateProfile] = useMutation(CREATE_OR_UPDATE_VERIFICATION_MUTATION);

  return {
    bookingData,
    bookingLoading,
    processOCR,
    updateProfile
  };
};