import { useMutation } from '@apollo/client';
import { REGISTER_MUTATION } from '@/lib/graphql/mutations';

export const useRegister = () => {
  const [register, { loading }] = useMutation(REGISTER_MUTATION);

  const executeRegister = async (input: any) => {
    return await register({
      variables: {
        input: {
          fullName: input.fullName,
          email: input.email,
          password: input.password,
          phoneNumber: input.phoneNumber
        }
      }
    });
  };

  return {
    executeRegister,
    loading
  };
};