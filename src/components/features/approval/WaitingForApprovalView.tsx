'use client';

import React from 'react';
import { Box, Container, Typography, Paper, Stack, Button, CircularProgress } from '@mui/material';
import { AccessTime as TimeIcon, Info as InfoIcon, DirectionsCar as CarIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface WaitingForApprovalViewProps {
  bookingId: string | null;
}

export const WaitingForApprovalView = ({ bookingId }: WaitingForApprovalViewProps) => {
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
          {/* Animated Icon Container */}
          <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Box sx={{ 
                width: 100, height: 100, borderRadius: '50%', 
                border: '2px dashed #7C3AED', display: 'flex', 
                alignItems: 'center', justifyContent: 'center' 
              }} />
            </motion.div>
            <Box sx={{ 
              position: 'absolute', top: '50%', left: '50%', 
              transform: 'translate(-50%, -50%)', color: '#7C3AED' 
            }}>
              <TimeIcon sx={{ fontSize: 48 }} />
            </Box>
          </Box>
          
          <Typography variant="h4" fontWeight={900} color="#0F172A" gutterBottom>
            Under Review
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
            Our team is currently verifying your documents. This process usually takes <b>15-30 minutes</b> during business hours.
          </Typography>

          <Stack spacing={2} sx={{ mb: 4 }}>
            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, textAlign: 'left', border: '1px solid #F1F5F9' }}>
               <InfoIcon sx={{ color: '#3B82F6' }} />
               <Typography variant="body2" color="#475569">
                 We will notify you via email once your account is approved.
               </Typography>
            </Box>

            {bookingId && (
              <Box sx={{ p: 2, bgcolor: '#F0F9FF', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, textAlign: 'left', border: '1px solid #E0F2FE' }}>
                 <CarIcon sx={{ color: '#0EA5E9' }} />
                 <Typography variant="body2" color="#0369A1" fontWeight={600}>
                   Booking Ref: #{bookingId.slice(-6).toUpperCase()}
                 </Typography>
              </Box>
            )}
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button 
              variant="contained" 
              fullWidth
              component={Link}
              href="/bookingRecords"
              sx={{ 
                bgcolor: '#0F172A', 
                py: 1.5, 
                borderRadius: 3, 
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: '#1E293B' }
              }}
            >
              My Bookings
            </Button>
            
            <Button 
              variant="outlined" 
              fullWidth
              component={Link}
              href="/"
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