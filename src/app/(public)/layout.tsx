import React from 'react';
import Navbar from '@/components/features/layout/Navbar';
import Footer from '@/components/features/layout/Footer';
import Box from '@mui/material/Box';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}