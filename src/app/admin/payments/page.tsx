'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function PaymentsPage() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
          Payments Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor all payment transactions
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
        <Typography>Payments list coming soon...</Typography>
      </Paper>
    </Box>
  );
}
