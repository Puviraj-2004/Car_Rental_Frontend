import { useMutation } from '@apollo/client';
import { RESEND_OTP_MUTATION } from '@/lib/graphql/mutations';

export const useResendOtp = (onCompleted?: (data: any) => void, onError?: (err: any) => void) => {
  const [resendOtp, { loading }] = useMutation(RESEND_OTP_MUTATION, {
    onCompleted,
    onError
  });

  const executeResend = (email: string) => {
    resendOtp({ variables: { email } });
  };

  return {
    executeResend,
    loading
  };
};
