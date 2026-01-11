import { MockPaymentContainer } from '@/components/features/payment/MockPaymentContainer';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

export default function MockPaymentPage() {
  return (
    <Suspense 
      fallback={
        <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      }
    >
      <MockPaymentContainer />
    </Suspense>
  );
}