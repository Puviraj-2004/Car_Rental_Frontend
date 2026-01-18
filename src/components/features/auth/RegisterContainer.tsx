'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/hooks/graphql/useRegister';
import { RegisterView } from './RegisterView';
import { useEmailAvailability } from '@/hooks/graphql/useEmailAvailability';

export const RegisterContainer = () => {
  const router = useRouter();
  const { executeRegister, loading } = useRegister();

  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', phoneNumber: '', gdprConsent: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; phone?: string; password?: string; confirmPassword?: string }>({});
  const { executeCheck } = useEmailAvailability();
  const emailCheckTimer = useRef<NodeJS.Timeout | null>(null);

  const validatePassword = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[!@#$%^&*]/.test(password)) strength += 25;
    setPasswordStrength(strength);
    if (strength < 75) {
      setFieldErrors(prev => ({ ...prev, password: 'Password must be 8+ chars, include uppercase, number and symbol' }));
    } else {
      setFieldErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    validatePassword(password);
    if (formData.confirmPassword && formData.confirmPassword !== password) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else {
      setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFieldErrors(prev => ({ ...prev, email: 'Enter a valid email address' }));
    } else {
      setFieldErrors(prev => ({ ...prev, email: undefined }));
    }

    // Debounced availability check
    if (emailCheckTimer.current) clearTimeout(emailCheckTimer.current);
    emailCheckTimer.current = setTimeout(async () => {
      // Only check if basic format passes
      if (!emailRegex.test(email)) return;
      const available = await executeCheck(email);
      if (available === false) {
        setFieldErrors(prev => ({ ...prev, email: 'Email is already in use' }));
      } else if (available === true) {
        // Only clear if previously set as taken
        setFieldErrors(prev => ({ ...prev, email: prev.email === 'Email is already in use' ? undefined : prev.email }));
      }
    }, 500);
  };

  const validatePhone = (phone: string) => {
    const clean = phone.replace(/[^\d+]/g, '');
    const digits = clean.replace(/^\+/, '');
    if (!/^\+?[1-9]\d{6,14}$/.test(clean) || digits.length < 7 || digits.length > 15) {
      setFieldErrors(prev => ({ ...prev, phone: 'Enter a valid phone (with country code)' }));
    } else {
      setFieldErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.gdprConsent) {
      setError("Please agree to the terms.");
      return;
    }

    if (fieldErrors.email || fieldErrors.phone || fieldErrors.password || fieldErrors.confirmPassword) {
      setError('Please fix the highlighted errors.');
      return;
    }

    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.phoneNumber || !formData.fullName) {
      setError('All fields are required.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const { data } = await executeRegister(formData);
      if (data?.register?.email) {
        // Registration successful - redirect to OTP verification
        router.push(`/verify-otp?email=${encodeURIComponent(data.register.email)}`);
      }
    } catch (err: any) {
      const msg = err?.message || "Registration failed. Try again.";
      if (/exists|already/i.test(msg)) {
        setError('An account already exists with this email.');
      } else {
        setError(msg);
      }
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
      fieldErrors={fieldErrors}
      onEmailChange={(email: string) => { setFormData({ ...formData, email }); validateEmail(email); }}
      onPhoneChange={(phone: string) => { setFormData({ ...formData, phoneNumber: phone }); validatePhone(phone); }}
      onConfirmPasswordChange={(cp: string) => {
        setFormData({ ...formData, confirmPassword: cp });
        if (cp !== formData.password) {
          setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
        } else {
          setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
        }
      }}
      disableSubmit={
        !!(loading ||
        !formData.gdprConsent ||
        !formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !formData.phoneNumber ||
        formData.password !== formData.confirmPassword ||
        fieldErrors.email || fieldErrors.phone || fieldErrors.password || fieldErrors.confirmPassword)
      }
    />
  );
};