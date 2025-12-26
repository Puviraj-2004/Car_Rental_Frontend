'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';

// Components இம்போர்ட் செய்கிறோம்
import HeroSection from '@/components/home/HeroSection';
import TrustBadges from '@/components/home/TrustBadges';
import AIFeature from '@/components/home/AIFeature';
import FeaturedCars from '@/components/home/FeaturedFleet';

export default function HomePage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <HeroSection />
      <TrustBadges />
      <AIFeature />
      <FeaturedCars />
      
      {/* Call to Action Section */}
      <Box sx={{ py: 10, textAlign: 'center', bgcolor: 'white' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
          Ready to experience the drive?
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          size="large" 
          component={Link}
          href="/register"
          sx={{ mt: 2, px: 6, py: 2, borderRadius: '30px', fontWeight: 'bold', textTransform: 'none' }} 
        >
          Create Free Account
        </Button>
      </Box>
    </Box>
  );
}