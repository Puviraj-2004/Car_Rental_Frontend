'use client';

import React from 'react';
import { Box, Container, Grid, Typography, Stack } from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import VerifiedIcon from '@mui/icons-material/Verified';

export default function TrustBadges() {
  const items = [
    { icon: <MonetizationOnIcon />, title: 'No Hidden Fees', desc: 'Transparent pricing with all taxes included.' },
    { icon: <SupportAgentIcon />, title: '24/7 Support', desc: 'Our team is here to assist you anytime.' },
    { icon: <VerifiedIcon />, title: 'Fully Insured', desc: 'Every rental includes premium insurance.' }
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'white', borderBottom: '1px solid #E2E8F0' }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {items.map((item, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'rgba(37, 99, 235, 0.1)', color: 'primary.main' }}>
                  {React.cloneElement(item.icon as React.ReactElement, { sx: { fontSize: 32 } })}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}