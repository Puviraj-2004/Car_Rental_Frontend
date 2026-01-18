'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/hooks/graphql/useRegister';
import { RegisterView } from './RegisterView';

export const RegisterContainer = () => {
  const router = useRouter();
  const { executeRegister, loading } = useRegister();

  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', phoneNumber: '', gdprConsent: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [error, setError] = useState('');

  const validatePassword = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[!@#$%^&*]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    validatePassword(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.gdprConsent) {
      setError("Please agree to the terms.");
      return;
    }

    try {
      const { data } = await executeRegister(formData);
      if (data) {
        router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Try again.");
    }
  };

  return (
    <RegisterView
      formData={formData}
      setFormData={setFormData}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      passwordStrength={passwordStrength}
      error={error}
      loading={loading}
      onPasswordChange={handlePasswordChange}
      onSubmit={handleSubmit}
    />
  );
};