import { BookingContainer } from '@/components/features/booking/BookingContainer';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

export default function BookingPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>}>
      <BookingContainer />
    </Suspense>
  );
}