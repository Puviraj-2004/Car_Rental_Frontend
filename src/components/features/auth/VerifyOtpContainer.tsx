'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyOtp } from '@/hooks/graphql/useVerifyOtp';
import { VerifyOtpView } from './VerifyOtpView';

export const VerifyOtpContainer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onCompleted = (data: any) => {
    if (data.verifyOTP.success) {
      setSuccess('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  const onError = (err: any) => {
    setError(err.message || 'Verification failed. Please check the code.');
  };

  const { executeVerify, loading } = useVerifyOtp(onCompleted, onError);

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    executeVerify(email, fullOtp);
  };

  return (
    <VerifyOtpView
      email={email}
      otp={otp}
      error={error}
      success={success}
      loading={loading}
      onOtpChange={handleOtpChange}
      onKeyDown={handleKeyDown}
      onSubmit={handleSubmit}
    />
  );
};