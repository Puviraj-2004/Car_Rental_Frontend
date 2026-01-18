import { WaitingForApprovalContainer } from '@/components/features/approval/WaitingForApprovalContainer';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

export default function WaitingForApprovalPage() {
  return (
    <Suspense 
      fallback={
        <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', bgcolor: '#F8FAFC' }}>
          <CircularProgress sx={{ color: '#0F172A' }} />
        </Box>
      }
    >
      <WaitingForApprovalContainer />
    </Suspense>
  );
}