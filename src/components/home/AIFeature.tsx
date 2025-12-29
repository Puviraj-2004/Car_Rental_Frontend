'use client';

import React from 'react';
import { Box, Container, Grid, Typography, Stack, Chip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function AIFeature() {
  return (
    <Box sx={{ py: 12 }}>
      <Container maxWidth="lg">
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12}>
            <Stack spacing={3}>
              <Chip icon={<AutoAwesomeIcon />} label="AI POWERED" color="primary" variant="outlined" sx={{ width: 'fit-content', fontWeight: 'bold' }} />
              <Typography variant="h3" fontWeight="bold">Digital Identity Verification</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem', lineHeight: 1.8 }}>
                Skip the paperwork. Our AI technology analyzes your ID and driving license instantly for a secure experience.
              </Typography>
              {['Instant Document Recognition', 'Real-time Facial Matching', 'Encrypted Security'].map((t, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircleIcon sx={{ color: '#10B981' }} />
                  <Typography fontWeight="500">{t}</Typography>
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}