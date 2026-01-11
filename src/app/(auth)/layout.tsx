// src/app/(auth)/layout.tsx
import React from 'react';
import { Box } from '@mui/material';
import Navbar from '@/components/features/layout/Navbar';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <Navbar />
      <Box
        sx={{
          height: 'calc(100vh - 64px)', // Subtract navbar height
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#f0f2f5',
          overflow: 'hidden'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}