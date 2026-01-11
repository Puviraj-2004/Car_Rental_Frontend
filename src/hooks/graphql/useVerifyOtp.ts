import { useMutation } from '@apollo/client';
import { VERIFY_OTP_MUTATION } from '@/lib/graphql/mutations';

export const useVerifyOtp = (onCompleted: (data: any) => void, onError: (err: any) => void) => {
  const [verifyOtp, { loading }] = useMutation(VERIFY_OTP_MUTATION, {
    onCompleted,
    onError
  });

  const executeVerify = (email: string, otp: string) => {
    verifyOtp({ variables: { email, otp } });
  };

  return {
    executeVerify,
    loading
  };
};