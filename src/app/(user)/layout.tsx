import React from 'react';
import Navbar from '@/components/features/layout/Navbar';
import Footer from '@/components/features/layout/Footer';
import Box from '@mui/material/Box';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box sx={{ flex: 1, paddingTop: '80px' }}> {/* Add padding-top to account for fixed navbar */}
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
