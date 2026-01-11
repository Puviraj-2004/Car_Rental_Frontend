import { useMutation, gql } from '@apollo/client';

const MOCK_FINALIZE_PAYMENT = gql`
  mutation MockFinalizePayment($bookingId: String!, $success: Boolean!) {
    mockFinalizePayment(bookingId: $bookingId, success: $success) {
      id
      status
    }
  }
`;

export const useMockPayment = () => {
  const [finalizePayment, { loading }] = useMutation(MOCK_FINALIZE_PAYMENT);

  const executeMockPayment = async (bookingId: string, success: boolean) => {
    return await finalizePayment({
      variables: { bookingId, success }
    });
  };

  return { executeMockPayment, loading };
};