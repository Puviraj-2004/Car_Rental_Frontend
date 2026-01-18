'use client';

import React from 'react';
import {
  Box, Grid, Typography, Stack, Chip, Divider, Button,
  IconButton, Paper, Alert, Container, Skeleton
} from '@mui/material';
import {
  Close as CloseIcon,
  Settings as SettingsIcon,
  LocalGasStation as FuelIcon,
  EventSeat as SeatIcon,
  Speed as SpeedIcon,
  Verified as CritAirIcon,
  Info as InfoIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon
} from '@mui/icons-material';

interface DetailsViewProps {
  car: any;
  loading: boolean;
  onClose: () => void;
  onBook: (carId: string) => void;
}

export const DetailsView = ({ car, loading, onClose, onBook }: DetailsViewProps) => {
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
      </Container>
    );
  }

  if (!car) return null;

  // 💰 Pricing Logic (Preserved)
  const pricingOptions = [
    { label: 'Per Hour', value: car.pricePerHour, icon: <AccessTimeIcon fontSize="small" /> },
    { label: 'Per Day', value: car.pricePerDay, icon: <EventIcon fontSize="small" /> },
    { label: 'Per Km', value: car.pricePerKm, icon: <SpeedIcon fontSize="small" /> },
  ].filter(option => option.value && option.value > 0);

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 2 }}>
              {car.brand.name.toUpperCase()}
            </Typography>
            <Typography variant="h3" fontWeight={900} sx={{ color: '#0F172A', lineHeight: 1.2 }}>
              {car.model.name}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ bgcolor: 'white', border: '1px solid #E2E8F0', '&:hover': { bgcolor: '#F1F5F9' } }}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Grid container spacing={5}>
          {/* Left: Image Gallery Style */}
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #E2E8F0', position: 'relative', bgcolor: 'white' }}>
              <Box sx={{ height: { xs: 300, md: 500 }, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                <img
                  src={car.images?.find((img: any) => img.isPrimary)?.url || car.images?.[0]?.url}
                  alt={car.model.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </Box>
              <Chip
                icon={<CritAirIcon sx={{ color: 'white !important' }} />}
                label={car.critAirRating.replace('_', ' ')}
                sx={{ position: 'absolute', top: 20, left: 20, bgcolor: '#0F172A', color: 'white', fontWeight: 800, px: 1 }}
              />
            </Paper>
          </Grid>

          {/* Right: Technical Specs & Booking */}
          <Grid item xs={12} md={5}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h6" fontWeight={800} mb={2} color="#0F172A">Technical Specifications</Typography>
                <Grid container spacing={2}>
                  {[
                    { icon: <SettingsIcon />, label: car.transmission },
                    { icon: <FuelIcon />, label: car.fuelType },
                    { icon: <SeatIcon />, label: `${car.seats} Seats` },
                    { icon: <SpeedIcon />, label: `${car.currentOdometer || 0} KM` },
                  ].map((spec, i) => (
                    <Grid item xs={6} key={i}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #F1F5F9' }}>
                        <Box sx={{ color: 'primary.main', display: 'flex' }}>{spec.icon}</Box>
                        <Typography variant="body2" fontWeight={600} color="#475569">{spec.label}</Typography>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={800} mb={2} color="#0F172A">Rental Pricing</Typography>
                <Stack spacing={2}>
                  {pricingOptions.map((option, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{ p: 2, px: 3, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E2E8F0', bgcolor: 'white' }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        {option.icon}
                        <Typography variant="body1" fontWeight={600} color="#64748B">{option.label}</Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={900} color="primary">€{option.value}</Typography>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              <Alert icon={<InfoIcon />} severity="info" sx={{ borderRadius: 3, bgcolor: '#EFF6FF', border: '1px solid #DBEAFE', color: '#1E40AF' }}>
                Refunable Security Deposit: <strong>€{car.depositAmount?.toFixed(2)}</strong>
              </Alert>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => onBook(car.id)}
                sx={{
                  py: 2.5,
                  borderRadius: 4,
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  bgcolor: '#0F172A',
                  textTransform: 'none',
                  boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)',
                  '&:hover': { bgcolor: '#1E293B', transform: 'translateY(-2px)' },
                  transition: '0.3s'
                }}
              >
                Book This Vehicle
              </Button>
            </Stack>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #E2E8F0' }}>
              <Typography variant="h6" fontWeight={800} mb={2}>About this vehicle</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: '800px' }}>
                {car.descriptionEn || "Experience luxury and performance with this meticulously maintained vehicle. Perfect for both city driving and long-distance travel, offering premium comfort and advanced safety features for a seamless journey."}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};