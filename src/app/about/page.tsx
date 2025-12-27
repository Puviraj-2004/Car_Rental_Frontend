'use client';

import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import SafeImage from '@/components/SafeImage';

export default function AboutPage() {
  return (
    <Box sx={{ minHeight: '60vh', py: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 2 }}>About Us</Typography>
            <Typography sx={{ color: 'text.secondary', mb: 3 }}>We are a boutique car rental platform focused on reliability, transparency, and modern digital verification to make rentals fast and secure.</Typography>
            <Typography sx={{ color: 'text.secondary' }}>Our mission is to provide premium vehicles with seamless booking, secure identity checks, and exceptional customer support.</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', height: 360, borderRadius: 3, overflow: 'hidden' }}>
              <SafeImage src="/images/home/hero-main.png" alt="About" fill style={{ objectFit: 'cover' }} fallback={'/images/home/hero-main.png'} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
