import { BookingRecordsContainer } from '@/components/features/bookingRecords/BookingRecordsContainer';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

export default function Page() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>}>
      <BookingRecordsContainer />
    </Suspense>
  );
}