'use client';

import React from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import { Box, Typography, Button, Alert, CircularProgress, Paper, Stack } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';

interface StripeCheckoutViewProps {
  amount: number;
  error: string;
  processing: boolean;
  stripeReady: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const CARD_OPTIONS = {
  style: {
    base: {
      color: '#1E293B',
      fontFamily: '"Inter", sans-serif',
      fontSize: '16px',
      '::placeholder': { color: '#94A3B8' },
    },
    invalid: { color: '#EF4444', iconColor: '#EF4444' },
  },
};

export const StripeCheckoutView = ({
  amount,
  error,
  processing,
  stripeReady,
  onSubmit
}: StripeCheckoutViewProps) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 4, 
        borderRadius: 4, 
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        maxWidth: 500,
        mx: 'auto'
      }}
    >
      <Box component="form" onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#0F172A">
              Payment Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Securely pay €{amount.toFixed(2)} to confirm your booking.
            </Typography>
          </Box>

          <Box sx={{ 
            p: 2, 
            border: '1px solid #E2E8F0', 
            borderRadius: 3, 
            bgcolor: '#F8FAFC',
            transition: '0.2s',
            '&:focus-within': { borderColor: '#2563EB', bgcolor: '#FFFFFF' }
          }}>
            <CardElement options={CARD_OPTIONS} />
          </Box>

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Button 
            type="submit"
            variant="contained" 
            size="large"
            disabled={!stripeReady || processing}
            fullWidth
            sx={{ 
              py: 2, 
              borderRadius: 10, 
              fontWeight: 800, 
              textTransform: 'none',
              bgcolor: '#0F172A',
              fontSize: '1rem',
              '&:hover': { bgcolor: '#1E293B' }
            }}
          >
            {processing ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={20} color="inherit" />
                <span>Processing...</span>
              </Stack>
            ) : (
              `Pay €${amount.toFixed(2)} Now`
            )}
          </Button>

          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ opacity: 0.6 }}>
            <ShieldIcon sx={{ fontSize: 16, color: '#10B981' }} />
            <Typography variant="caption" fontWeight={600}>
              Secured by Stripe with 256-bit encryption
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};