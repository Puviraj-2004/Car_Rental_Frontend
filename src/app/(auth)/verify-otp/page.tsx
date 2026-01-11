import { VerifyOtpContainer } from '@/components/features/auth/VerifyOtpContainer';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>}>
      <VerifyOtpContainer />
    </Suspense>
  );
}