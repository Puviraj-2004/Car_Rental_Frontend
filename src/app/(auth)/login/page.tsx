import { LoginContainer } from '@/components/features/auth/LoginContainer';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

export default function LoginPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>}>
      <LoginContainer />
    </Suspense>
  );
}