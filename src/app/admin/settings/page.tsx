'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function SettingsPage() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure your application settings
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
        <Typography>Settings coming soon...</Typography>
      </Paper>
    </Box>
  );
}
