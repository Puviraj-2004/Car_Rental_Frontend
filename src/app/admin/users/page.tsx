'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function UsersPage() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
          Users Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage and monitor all platform users
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
        <Typography>Users list coming soon...</Typography>
      </Paper>
    </Box>
  );
}
