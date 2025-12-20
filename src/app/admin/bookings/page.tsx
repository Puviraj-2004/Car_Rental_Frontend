'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function BookingsPage() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
          Bookings Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track and manage all car rental bookings
        </Typography>
      </Box>

      <Paper
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
          color: 'text.secondary',
        }}
      >
        <Typography>Bookings list coming soon...</Typography>
      </Paper>
    </Box>
  );
}
