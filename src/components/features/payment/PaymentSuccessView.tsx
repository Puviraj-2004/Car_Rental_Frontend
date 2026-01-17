'use client';

import React, { useEffect } from 'react';
import { Box, Container, Typography, Paper, Stack, Button, Divider } from '@mui/material';
import { CheckCircle as SuccessIcon, ReceiptLong as ReceiptIcon, Home as HomeIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useApolloClient } from '@apollo/client';

interface PaymentSuccessViewProps {
  bookingId: string | null;
}

export const PaymentSuccessView = ({ bookingId }: PaymentSuccessViewProps) => {
  const client = useApolloClient();

  // Clear cache to ensure fresh data after payment
  useEffect(() => {
    client.cache.evict({ fieldName: 'myBookings' });
    client.cache.gc();
  }, [client]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 4, md: 6 }, 
            textAlign: 'center', 
            borderRadius: 6, 
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <SuccessIcon sx={{ fontSize: 100, color: '#10B981', mb: 3 }} />
          </motion.div>
          
          <Typography variant="h4" fontWeight={900} color="#0F172A" gutterBottom>
            Payment Successful!
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
            Thank you for your payment. Your booking has been confirmed. A confirmation email has been sent to your registered address.
          </Typography>

          <Divider sx={{ mb: 4 }} />

          {bookingId && (
            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 3, mb: 4, border: '1px solid #F1F5F9' }}>
               <Typography variant="caption" fontWeight={700} color="#64748B" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                 Booking Reference
               </Typography>
               <Typography variant="h6" color="#0F172A" fontWeight={800} sx={{ mt: 0.5, fontFamily: 'monospace' }}>
                 #{bookingId.slice(-8).toUpperCase()}
               </Typography>
            </Box>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button 
              variant="contained" 
              fullWidth
              component={Link}
              href="/bookingRecords"
              startIcon={<ReceiptIcon />}
              sx={{ 
                bgcolor: '#0F172A', 
                py: 1.5, 
                borderRadius: 3, 
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: '#1E293B' }
              }}
            >
              View Booking
            </Button>
            
            <Button 
              variant="outlined" 
              fullWidth
              component={Link}
              href="/"
              startIcon={<HomeIcon />}
              sx={{ 
                borderColor: '#E2E8F0', 
                color: '#64748B', 
                py: 1.5, 
                borderRadius: 3, 
                fontWeight: 700,
                textTransform: 'none'
              }}
            >
              Back Home
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};