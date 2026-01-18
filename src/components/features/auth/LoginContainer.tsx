'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSession } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import { LoginView } from './LoginView';

export const LoginContainer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithCredentials, loginWithGoogle } = useAuth();
  
  const redirectUrl = searchParams.get('redirect') || searchParams.get('callbackUrl') || '/';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginWithCredentials(formData);

    if (result?.error) {
      const msg = String(result.error);
      if (/verify/i.test(msg)) {
        // Redirect to OTP verification if backend blocks unverified users
        setError('Please verify your email to continue. Redirecting...');
        setLoading(false);
        router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
        return;
      }
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      const session = await getSession();
      const userRole = (session?.user as any)?.role;

      // Senior Logic: Targeted Redirection
      if (redirectUrl && redirectUrl !== '/' && redirectUrl.startsWith('/')) {
        router.push(redirectUrl);
      } else if (userRole === "ADMIN") {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
      router.refresh();
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle(redirectUrl);
  };

  return (
    <LoginView
      formData={formData}
      setFormData={setFormData}
      showPassword={showPassword}
      setShowPassword={setOpen => setShowPassword(!showPassword)}
      error={error}
      loading={loading}
      onSubmit={handleSubmit}
      onGoogleLogin={handleGoogleLogin}
    />
  );
};