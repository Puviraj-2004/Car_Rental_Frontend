// src/app/(auth)/layout.tsx
import React from 'react';
import { Box } from '@mui/material';
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#f0f2f5', 
      }}
    >
      {children}
    </Box>
  );
}