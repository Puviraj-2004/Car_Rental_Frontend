import { signIn } from 'next-auth/react';

export const useAuth = () => {
  const loginWithCredentials = async (input: any) => {
    return await signIn('credentials', {
      redirect: false,
      email: input.email,
      password: input.password,
    });
  };

  const loginWithGoogle = (callbackUrl: string) => {
    signIn('google', { callbackUrl });
  };

  return {
    loginWithCredentials,
    loginWithGoogle,
  };
};