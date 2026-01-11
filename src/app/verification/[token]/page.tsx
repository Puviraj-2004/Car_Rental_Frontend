import { VerificationContainer } from '@/components/features/verification/VerificationContainer';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function Page({ params }: PageProps) {
  const { token } = await params;

  return (
    <Suspense fallback={<Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>}>
      <VerificationContainer token={token} />
    </Suspense>
  );
}