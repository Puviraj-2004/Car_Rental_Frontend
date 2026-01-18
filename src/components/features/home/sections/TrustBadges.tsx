'use client';

import React from 'react';
import { Box, Container, Grid, Typography, Paper, Stack } from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; // AI Icon

// Your specific brand color
const BRAND_COLOR = '#2189b6'; 

export default function TrustBadges() {
  const items = [
    { 
      icon: <MonetizationOnIcon />, 
      title: 'Transparent Pricing', 
      desc: 'No hidden fees. What you see is exactly what you pay.' 
    },
    { 
      icon: <SupportAgentIcon />, 
      title: '24/7 Expert Support', 
      desc: 'Our dedicated team is ready to assist you on the road anytime.' 
    },
    { 
      icon: <AutoAwesomeIcon />, // Changed Icon to AI/Sparkles
      title: 'AI Smart Availability', // Changed Title
      desc: 'Using advanced AI to check car availability instantly for real-time booking.' // Changed Description
    }
  ];

  return (
    <Box sx={{ py: 10, bgcolor: '#F8FAFC' }}>
      <Container maxWidth="xl">
        <Grid container spacing={4} justifyContent="center">
          {items.map((item, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  height: '100%',
                  borderRadius: 4,
                  bgcolor: 'white',
                  border: '1px solid #F1F5F9',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 30px rgba(33, 137, 182, 0.15)', // Brand color shadow
                    borderColor: 'transparent'
                  }
                }}
              >
                <Stack direction="column" alignItems="center" spacing={2} textAlign="center">
                  
                  {/* Icon Circle */}
                  <Box 
                    sx={{ 
                      p: 2.5, 
                      borderRadius: '50%', 
                      bgcolor: 'rgba(33, 137, 182, 0.1)', // #2189b6 with 10% opacity
                      color: BRAND_COLOR,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1
                    }}
                  >
                    {React.cloneElement(item.icon as React.ReactElement, { sx: { fontSize: 40 } })}
                  </Box>

                  {/* Text Content */}
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        color: '#0F172A',
                        mb: 1
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#64748B', 
                        lineHeight: 1.6 
                      }}
                    >
                      {item.desc}
                    </Typography>
                  </Box>

                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}