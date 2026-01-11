import { PaymentCancelContainer } from '@/components/features/payment/PaymentCancelContainer';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

export default function PaymentCancelPage() {
  return (
    <Suspense 
      fallback={
        <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress sx={{ color: '#0F172A' }} />
        </Box>
      }
    >
      <PaymentCancelContainer />
    </Suspense>
  );
}