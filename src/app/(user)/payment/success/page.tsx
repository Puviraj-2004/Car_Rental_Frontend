import { PaymentSuccessContainer } from '@/components/features/payment/PaymentSuccessContainer';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

export default function PaymentSuccessPage() {
  return (
    <Suspense 
      fallback={
        <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress sx={{ color: '#10B981' }} />
        </Box>
      }
    >
      <PaymentSuccessContainer />
    </Suspense>
  );
}