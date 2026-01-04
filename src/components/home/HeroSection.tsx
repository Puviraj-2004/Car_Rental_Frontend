'use client';

import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Paper, TextField, InputAdornment, Button, Stack, Divider, IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SearchIcon from '@mui/icons-material/Search';
import dayjs from 'dayjs';

export default function HeroSection() {
  const router = useRouter();
  
  // State for search inputs
  const [startDate, setStartDate] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().add(2, 'day').format('YYYY-MM-DD'));

  const handleSearch = () => {
    // Redirect to listing page with query params
    const url = `/cars?startDate=${startDate}&endDate=${endDate}`;
    router.push(url);
  };

  return (
    <Box 
      sx={{ 
        position: 'relative', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        pt: { xs: 6, md: 4 }, 
        bgcolor: '#FFFFFF',
        overflow: 'hidden' 
      }}
    >
      
      {/* 1. INCREASED ROYAL PURPLE ARC */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: -450, // Moved up further for a wider arc
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: { xs: '180%', md: '140%' }, // Wider width
          height: 1000, // Taller height for deeper curve
          bgcolor: '#2189b6ff', // Deep Royal Purple
          background: 'radial-gradient(circle at center, #2189b6ff 0%, #219bb6ff 100%)', // Vibrant gradient
          borderRadius: '50%', 
          zIndex: 0, 
        }} 
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        
        {/* 2. HEADLINE */}
        <Box sx={{ mb: 6, maxWidth: '850px', mx: 'auto' }}>
          <Typography 
            variant="h1" 
            sx={{ 
              color: '#0F172A', 
              fontWeight: 800, 
              fontSize: { xs: '2.5rem', md: '4.8rem' }, 
              lineHeight: 1.1,
              mb: 3,
              letterSpacing: '-1.5px'
            }}
          >
            Drive Your Dream Car <br />
            <Box component="span" sx={{ color: '#ffffffff' }}>Anytime Anywhere</Box> {/* Royal Purple Highlight */}
          </Typography>
        </Box>

        {/* 3. NEW SEARCH FILTER (Replaces Buttons) */}
        <Paper
          elevation={4}
          sx={{
            display: 'inline-flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: { xs: 2, md: 0 },
            p: 1,
            mb: 8,
            borderRadius: { xs: '20px', md: '100px' },
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(124, 58, 237, 0.2)', // Subtle purple border
            boxShadow: '0 20px 40px -10px rgba(124, 58, 237, 0.15)',
            maxWidth: { xs: '100%', md: '700px' },
            width: '100%'
          }}
        >
          {/* Pickup Date */}
          <Box sx={{ px: 3, py: 1, width: '100%' }}>
            <Typography variant="caption" fontWeight={700} color="#7C3AED" sx={{ display: 'block', textAlign: 'left', mb: 0.5, letterSpacing: 0.5 }}>
              PICK-UP DATE
            </Typography>
            <TextField
              variant="standard"
              fullWidth
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputProps={{
                disableUnderline: true,
                startAdornment: <InputAdornment position="start"><CalendarMonthIcon sx={{ color: '#94A3B8' }} /></InputAdornment>,
                sx: { fontWeight: 600, color: '#1E293B' }
              }}
            />
          </Box>

          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, bgcolor: '#E2E8F0' }} />
          <Divider orientation="horizontal" flexItem sx={{ display: { xs: 'block', md: 'none' }, width: '100%' }} />

          {/* Drop-off Date */}
          <Box sx={{ px: 3, py: 1, width: '100%' }}>
            <Typography variant="caption" fontWeight={700} color="#7C3AED" sx={{ display: 'block', textAlign: 'left', mb: 0.5, letterSpacing: 0.5 }}>
              DROP-OFF DATE
            </Typography>
            <TextField
              variant="standard"
              fullWidth
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputProps={{
                disableUnderline: true,
                startAdornment: <InputAdornment position="start"><CalendarMonthIcon sx={{ color: '#94A3B8' }} /></InputAdornment>,
                sx: { fontWeight: 600, color: '#1E293B' }
              }}
            />
          </Box>

          {/* Search Button */}
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              borderRadius: '100px',
              minWidth: { xs: '100%', md: '60px' },
              height: { xs: '50px', md: '60px' },
              width: { xs: '100%', md: '60px' },
              bgcolor: '#7C3AED', // Royal Purple Button
              color: 'white',
              boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.4)',
              '&:hover': { bgcolor: '#6D28D9' }
            }}
          >
            <SearchIcon fontSize="medium" />
            <Typography sx={{ display: { xs: 'inline', md: 'none' }, ml: 1, fontWeight: 700 }}>Search Cars</Typography>
          </Button>
        </Paper>

        {/* 4. CAR IMAGE */}
        <Box 
          sx={{ 
            position: 'relative',
            width: '100%',
            maxWidth: '1000px',
            mx: 'auto',
            mb: 8,
            filter: 'drop-shadow(0 30px 30px rgba(0,0,0,0.15))' 
          }}
        >
          <img 
            src="/images/home/HeroSection.png" 
            alt="Luxury Sports Car" 
            style={{ 
              width: '100%', 
              height: 'auto', 
              objectFit: 'contain',
              display: 'block' 
            }} 
          />
        </Box>

      </Container>
    </Box>
  );
}