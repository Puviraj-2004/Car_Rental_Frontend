'use client';

import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Paper, TextField, InputAdornment, Button, Stack } from '@mui/material';
import Image from 'next/image';
import SafeImage from '@/components/SafeImage';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function HeroSection() {
  return (
    <Box sx={{ position: 'relative', minHeight: '85vh', display: 'flex', alignItems: 'center', py: { xs: 10, md: 0 } }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <SafeImage src="/images/home/hero-main.png" alt="Hero" fill style={{ objectFit: 'cover', filter: 'brightness(0.4)' }} priority fallback={'/images/home/hero-main.png'} />
      </Box>

      <Container maxWidth="xl">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="h1" sx={{ color: 'white', fontWeight: 900, fontSize: { xs: '2.8rem', md: '4.5rem' }, mb: 2 }}>
              Premium Drive. <br /> <span style={{ color: '#60A5FA' }}>Instant Access.</span>
            </Typography>
            <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, maxWidth: '600px' }}>
              Experience zero paperwork and instant AI identity verification.
            </Typography>
            <Button variant="contained" color="secondary" size="large" sx={{ borderRadius: '30px', px: 4, py: 1.5 }}>
              Browse Our Fleet
            </Button>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper elevation={24} sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(255, 255, 255, 0.98)' }}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Ready to Book?</Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="caption" fontWeight="800" color="text.secondary">PICK-UP DATE & TIME</Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <TextField fullWidth type="date" size="small" InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonthIcon fontSize="small"/></InputAdornment> }} />
                    <TextField sx={{ width: '140px' }} type="time" size="small" defaultValue="10:00" />
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight="800" color="text.secondary">DROP-OFF DATE & TIME</Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <TextField fullWidth type="date" size="small" InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonthIcon fontSize="small"/></InputAdornment> }} />
                    <TextField sx={{ width: '140px' }} type="time" size="small" defaultValue="10:00" />
                  </Stack>
                </Box>
                <Button fullWidth variant="contained" color="primary" size="large" sx={{ py: 2, fontWeight: 'bold' }}>Check Availability</Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}