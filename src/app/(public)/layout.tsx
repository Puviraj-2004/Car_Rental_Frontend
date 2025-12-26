import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Box from '@mui/material/Box';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 1. நேவ்பார் */}
      <Navbar /> 

      {/* 2. மெயின் கன்டென்ட் (இங்கேதான் page.tsx வரும்) */}
      <Box component="main" sx={{ flexGrow: 1 , pt: { xs: 8, md: 9 }}}>
        {children}
      </Box>

      {/* 3. ஃபுட்டர் */}
      <Footer />
    </Box>
  );
}