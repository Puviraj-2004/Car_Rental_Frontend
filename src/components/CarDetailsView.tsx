'use client';

import React from 'react';
import {
  Box, Grid, Typography, Stack, Chip, Divider, Button,
  IconButton, List, ListItem, ListItemIcon, ListItemText,
  Alert,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Settings as SettingsIcon,
  LocalGasStation as FuelIcon,
  EventSeat as SeatIcon,
  Speed as SpeedIcon,
  Verified as CritAirIcon,
  Euro as EuroIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';

interface CarDetailsProps {
  car: any;
  onClose: () => void;
  onBook: (carId: string) => void;
}

export default function CarDetailsView({ car, onClose, onBook }: CarDetailsProps) {
  if (!car) return null;

  // 💰 Rental Type Filter Logic (Show only non-zero prices)
  const pricingOptions = [
    { label: 'Per Hour', value: car.pricePerHour, icon: <AccessTime /> },
    { label: 'Per Day', value: car.pricePerDay, icon: <Event /> },
    { label: 'Per Km', value: car.pricePerKm, icon: <SpeedIcon /> },
  ].filter(option => option.value && option.value > 0);

  return (
    <Box sx={{ position: 'relative' }}>
      {/* 🔝 Header with Close Button */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="overline" color="primary" fontWeight={900} sx={{ letterSpacing: 2 }}>
            {car.brand.name.toUpperCase()}
          </Typography>
          <Typography variant="h4" fontWeight={900}>
            {car.model.name}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ bgcolor: '#F1F5F9' }}>
          <CloseIcon />
        </IconButton>
      </Stack>

      <Grid container spacing={4}>
        {/* 📸 Image Section */}
        <Grid item xs={12} md={7}>
          <Box
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              height: { xs: 250, md: 400 },
              bgcolor: '#F1F5F9',
              position: 'relative'
            }}
          >
            <img
              src={car.images?.find((img: any) => img.isPrimary)?.url || car.images?.[0]?.url}
              alt={car.model.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* CritAir Badge */}
            <Chip
              icon={<CritAirIcon sx={{ color: '#white !important' }} />}
              label={car.critAirRating.replace('_', ' ')}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                bgcolor: '#0F172A',
                color: 'white',
                fontWeight: 800
              }}
            />
          </Box>
        </Grid>

        {/* 📋 Details Section */}
        <Grid item xs={12} md={5}>
          <Typography variant="h6" fontWeight={800} mb={2}>Key Specifications</Typography>

          <Grid container spacing={2} mb={3}>
            <Grid item xs={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SettingsIcon color="action" fontSize="small" />
                <Typography variant="body2">{car.transmission}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FuelIcon color="action" fontSize="small" />
                <Typography variant="body2">{car.fuelType}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SeatIcon color="action" fontSize="small" />
                <Typography variant="body2">{car.seats} Seats</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SpeedIcon color="action" fontSize="small" />
                <Typography variant="body2">{car.mileage} KM Mileage</Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* 🏷️ Dynamic Pricing Section */}
          <Typography variant="h6" fontWeight={800} mb={2}>Rental Pricing</Typography>
          <Stack spacing={1.5} mb={4}>
            {pricingOptions.map((option, index) => (
              <Paper
                key={index}
                variant="outlined"
                sx={{ p: 1.5, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: '#E2E8F0' }}
              >
                <Typography variant="body2" fontWeight={700} color="text.secondary">{option.label}</Typography>
                <Typography variant="subtitle1" fontWeight={900} color="primary">€{option.value}</Typography>
              </Paper>
            ))}
          </Stack>

          {/* Security Deposit Info */}
          <Alert icon={<InfoIcon fontSize="inherit" />} severity="info" sx={{ mb: 4, borderRadius: 3 }}>
            Refundable Deposit: <strong>€{car.depositAmount?.toFixed(2)}</strong>
          </Alert>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => onBook(car.id)}
            sx={{
              py: 2,
              borderRadius: 3,
              fontWeight: 900,
              fontSize: 16,
              bgcolor: '#0F172A',
              '&:hover': { bgcolor: '#1E293B' }
            }}
          >
            Book This Vehicle
          </Button>
        </Grid>

        {/* 📝 Description Section */}
        <Grid item xs={12}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6" fontWeight={800} mb={1}>Description</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {car.descriptionEn || "This vehicle is well-maintained and perfect for your travel needs. Experience a smooth and comfortable ride with our premium fleet."}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

// 📌 Icons used in logic
function AccessTime() { return <AccessTimeIcon sx={{ fontSize: 18 }} />; }
function Event() { return <EventIcon sx={{ fontSize: 18 }} />; }
