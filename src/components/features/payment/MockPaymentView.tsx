'use client';

import React from 'react';
import { Box, Container, Typography, Paper, Stack, Button, CircularProgress, Divider } from '@mui/material';
import { BugReport as DebugIcon, CheckCircle as SuccessIcon, Error as ErrorIcon } from '@mui/icons-material';

interface MockPaymentViewProps {
  bookingId: string | null;
  loading: boolean;
  onSimulate: (success: boolean) => void;
}

export const MockPaymentView = ({ bookingId, loading, onSimulate }: MockPaymentViewProps) => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 6, border: '1px solid #E2E8F0' }}>
          <Stack spacing={2} alignItems="center" mb={3}>
            <Box sx={{ p: 2, bgcolor: '#F1F5F9', borderRadius: '50%', color: '#64748B' }}>
              <DebugIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h5" fontWeight={900}>Mock Payment Gateway</Typography>
            <Typography variant="body2" color="text.secondary">
              This is a testing environment for <b>Booking: {bookingId?.slice(-6).toUpperCase()}</b>
            </Typography>
          </Stack>

          <Divider sx={{ mb: 4 }} />

          <Stack spacing={2}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SuccessIcon />}
              onClick={() => onSimulate(true)}
              disabled={loading}
              sx={{ bgcolor: '#10B981', py: 2, borderRadius: 3, fontWeight: 700, '&:hover': { bgcolor: '#059669' } }}
            >
              Simulate Success
            </Button>

            <Button
              variant="outlined"
              fullWidth
              size="large"
              color="error"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ErrorIcon />}
              onClick={() => onSimulate(false)}
              disabled={loading}
              sx={{ py: 2, borderRadius: 3, fontWeight: 700 }}
            >
              Simulate Failure
            </Button>
          </Stack>

          <Typography variant="caption" sx={{ display: 'block', mt: 4, color: '#94A3B8' }}>
            Only available in development mode (MOCK_STRIPE=true)
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};