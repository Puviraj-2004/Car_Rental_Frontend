import { useMutation, gql } from '@apollo/client';

const CREATE_PAYMENT = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      id
      status
      transactionId
      booking {
        id
        status
      }
    }
  }
`;

export const useStripePayment = () => {
  const [createPayment, { loading: mutationLoading }] = useMutation(CREATE_PAYMENT);

  const processServerPayment = async (input: any) => {
    return await createPayment({
      variables: { input }
    });
  };

  return {
    processServerPayment,
    mutationLoading
  };
};