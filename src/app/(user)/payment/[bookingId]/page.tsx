import { PaymentContainer } from '@/components/features/payment/PaymentContainer';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

/**
 * Senior Architect Note:
 * Entry point for Payment domain. 
 * Orchestrates the async bookingId and wraps the container in Suspense.
 */
export default async function Page({ params }: PageProps) {
  const { bookingId } = await params;

  return (
    <Suspense 
      fallback={
        <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress sx={{ color: '#0F172A' }} />
        </Box>
      }
    >
      <PaymentContainer bookingId={bookingId} />
    </Suspense>
  );
}