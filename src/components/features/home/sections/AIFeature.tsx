'use client';

import React from 'react';
import { Box, Container, Grid, Typography, Stack, Chip, Paper } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FingerprintIcon from '@mui/icons-material/Fingerprint';

export default function AIFeature() {
  return (
    <Box sx={{ py: 12, bgcolor: '#FFFFFF', overflow: 'hidden' }}>
      <Container maxWidth="xl">
        <Grid container spacing={8} alignItems="center">
          
          {/* LEFT SIDE: TEXT CONTENT */}
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              <Chip 
                icon={<AutoAwesomeIcon sx={{ fontSize: '16px !important' }} />} 
                label="AI POWERED SECURITY" 
                sx={{ 
                  width: 'fit-content', 
                  fontWeight: 800, 
                  bgcolor: 'rgba(124, 58, 237, 0.1)', // Royal Purple tint
                  color: '#7C3AED',
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                  px: 1
                }} 
              />
              
              <Box>
                <Typography 
                  variant="h3" 
                  fontWeight={800} 
                  sx={{ 
                    mb: 2, 
                    color: '#0F172A',
                    fontSize: { xs: '2rem', md: '3rem' } 
                  }}
                >
                  Digital Identity <br/>
                  <span style={{ color: '#7C3AED' }}>Verification in Seconds.</span>
                </Typography>
                
                <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '500px' }}>
                  Skip the manual paperwork. Our advanced AI technology analyzes your ID and facial biometrics instantly, ensuring a secure and frictionless booking experience.
                </Typography>
              </Box>

              <Stack spacing={2}>
                {[
                  'Instant Document Recognition (OCR)',  
                  'Bank-Grade Encrypted Security'
                ].map((t, i) => (
                  <Paper 
                    key={i} 
                    elevation={0}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 2,
                      border: '1px solid #F1F5F9',
                      borderRadius: 3,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateX(10px)',
                        borderColor: '#E2E8F0',
                        bgcolor: '#F8FAFC'
                      }
                    }}
                  >
                    <CheckCircleIcon sx={{ color: '#10B981' }} />
                    <Typography fontWeight="600" color="#334155">{t}</Typography>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* RIGHT SIDE: IMAGE */}
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {/* Decorative Blur Effect behind image */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  width: '80%', 
                  height: '80%', 
                  bgcolor: '#7C3AED', 
                  filter: 'blur(100px)', 
                  opacity: 0.15,
                  zIndex: 0 
                }} 
              />
              
              {/* Main Image */}
              <Box 
                component="img"
                // ⚠️ PLACE YOUR GENERATED IMAGE HERE
                src="/images/home/ai-check.png" 
                alt="AI Verification Process"
                sx={{ 
                  width: '100%',
                  maxWidth: '600px',
                  height: 'auto',
                  borderRadius: 6,
                  position: 'relative',
                  zIndex: 1,
                  // Adds a subtle glass-like border effect
                  border: '8px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' 
                }}
              />

              {/* Floating Badge Overlay (Optional for style) */}
              <Paper
                elevation={4}
                sx={{
                  position: 'absolute',
                  bottom: 40,
                  left: { xs: 0, md: -20 },
                  p: 2,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  zIndex: 2,
                  backdropFilter: 'blur(10px)',
                  bgcolor: 'rgba(255,255,255,0.9)'
                }}
              >
                <Box sx={{ p: 1.5, bgcolor: '#10B981', borderRadius: '50%', color: 'white', display: 'flex' }}>
                   <FingerprintIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800}>Identity Verified</Typography>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">100% Secure</Typography>
                </Box>
              </Paper>

            </Box>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}