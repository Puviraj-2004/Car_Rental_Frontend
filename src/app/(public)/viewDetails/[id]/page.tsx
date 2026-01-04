'use client';

import React, { use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import {
  Box, Grid, Typography, Stack, Chip, Divider, Button,
  IconButton, Alert, Paper, CircularProgress, Container,
  Card, CardContent, Avatar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon,
  LocalGasStation as FuelIcon,
  EventSeat as SeatIcon,
  Speed as SpeedIcon,
  Verified as CritAirIcon,
  Euro as EuroIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  Build as BuildIcon,
  Security as SecurityIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import { GET_CAR_QUERY } from '@/lib/graphql/queries';

export default function CarDetailsPage() {
  const router = useRouter();
  const params = use(useParams()); // Next.js 15: unwrap Promise
  const carId = params.id;

  const { data, loading, error } = useQuery(GET_CAR_QUERY, {
    variables: { id: carId },
    skip: !carId
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading car details...</Typography>
      </Container>
    );
  }

  if (error || !data?.car) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Car not found</Typography>
        <Button onClick={() => router.back()} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  const car = data.car;

  // 💰 Rental Type Filter Logic (Show only non-zero prices)
  const pricingOptions = [
    { label: 'Per Day', value: car.pricePerDay, icon: <Event />, color: '#10B981' },
  ].filter(option => option.value && option.value > 0);

  // Technical specifications data
  const specifications = [
    { label: 'Model Year', value: car.year, icon: <CalendarIcon />, color: '#0F172A' },
    { label: 'Transmission', value: car.transmission, icon: <SettingsIcon />, color: '#374151' },
    { label: 'Fuel Type', value: car.fuelType || 'N/A', icon: <FuelIcon />, color: '#059669' },
    { label: 'Seating Capacity', value: `${car.seats} Seats`, icon: <SeatIcon />, color: '#7C3AED' },
    { label: 'Current Mileage', value: `${car.currentOdometer?.toLocaleString() || 'N/A'} KM`, icon: <SpeedIcon />, color: '#DC2626' },
    { label: 'Daily KM Limit', value: car.dailyKmLimit ? `${car.dailyKmLimit} KM` : 'Unlimited', icon: <TimelineIcon />, color: '#F59E0B' },
    { label: 'Extra KM Charge', value: car.extraKmCharge ? `€${car.extraKmCharge?.toFixed(2)}/KM` : 'N/A', icon: <EuroIcon />, color: '#10B981' },
    { label: 'CritAir Rating', value: car.critAirRating.replace('_', ' '), icon: <CritAirIcon />, color: '#0891B2' },
    { label: 'License Required', value: car.requiredLicense, icon: <BuildIcon />, color: '#EA580C' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* 🔙 Navigation Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E2E8F0', py: 2 }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              onClick={() => router.back()}
              sx={{
                bgcolor: '#F1F5F9',
                '&:hover': { bgcolor: '#E2E8F0' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ letterSpacing: 1.5 }}>
                {car.brand.name.toUpperCase()}
              </Typography>
              <Typography variant="h5" fontWeight={700} color="#0F172A">
                {car.model.name}
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* 🚗 Hero Image Section */}
          <Grid item xs={12}>
            <Card sx={{
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              position: 'relative',
              height: { xs: 300, md: 500 }
            }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.05) 100%)',
                    zIndex: 1
                  }
                }}
              >
                <img
                  src={car.images?.find((img: any) => img.isPrimary)?.url || car.images?.[0]?.url}
                  alt={car.model.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                {/* Status Badge */}
                <Chip
                  label={car.status.replace('_', ' ')}
                  sx={{
                    position: 'absolute',
                    top: 24,
                    right: 24,
                    bgcolor: car.status === 'AVAILABLE' ? '#10B981' : '#F59E0B',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    px: 2,
                    py: 1,
                    zIndex: 2
                  }}
                />

                {/* CritAir Badge */}
                <Chip
                  icon={<CritAirIcon sx={{ fontSize: '1rem !important' }} />}
                  label={car.critAirRating.replace('_', ' ')}
                  sx={{
                    position: 'absolute',
                    top: 24,
                    left: 24,
                    bgcolor: '#0F172A',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    px: 2,
                    py: 1,
                    zIndex: 2
                  }}
                />
              </Box>
            </Card>
          </Grid>

          {/* 📊 Technical Specifications */}
          <Grid item xs={12}>
            <Typography
              variant="h6"
              fontWeight={700}
              color="#0F172A"
              sx={{ mb: 3, textAlign: 'center' }}
            >
              TECHNICAL SPECIFICATIONS
            </Typography>

            <Grid container spacing={3}>
              {specifications.map((spec, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{
                    borderRadius: 2,
                    border: '1px solid #E2E8F0',
                    boxShadow: 'none',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Avatar sx={{
                        bgcolor: spec.color,
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.15)'
                      }}>
                        {React.cloneElement(spec.icon, { sx: { color: 'white' } })}
                      </Avatar>
                      <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ letterSpacing: 1 }}>
                        {spec.label}
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="#0F172A" sx={{ mt: 1 }}>
                        {spec.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* 💰 Pricing Section */}
          <Grid item xs={12}>
            <Typography
              variant="h6"
              fontWeight={700}
              color="#0F172A"
              sx={{ mb: 3, textAlign: 'center' }}
            >
              RENTAL PRICING
            </Typography>

            <Grid container spacing={3}>
              {pricingOptions.map((option, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{
                    borderRadius: 2,
                    border: `2px solid ${option.color}20`,
                    boxShadow: 'none',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: `0 8px 25px -5px ${option.color}30`,
                      transform: 'translateY(-4px)'
                    }
                  }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Avatar sx={{
                        bgcolor: option.color,
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.15)'
                      }}>
                        {React.cloneElement(option.icon, { sx: { color: 'white', fontSize: 24 } })}
                      </Avatar>
                      <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
                        {option.label}
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight={800}
                        sx={{
                          color: option.color,
                          fontFamily: 'monospace',
                          letterSpacing: '-0.02em'
                        }}
                      >
                        €{option.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* 🔒 Security & Action Section */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{
                  borderRadius: 2,
                  border: '1px solid #E2E8F0',
                  boxShadow: 'none',
                  bgcolor: '#F8FAFC'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#10B981', width: 40, height: 40 }}>
                        <SecurityIcon sx={{ color: 'white' }} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                          Security Deposit
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Fully refundable upon return
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      color="#10B981"
                      sx={{ fontFamily: 'monospace', letterSpacing: '-0.02em' }}
                    >
                      €{car.depositAmount?.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{
                  borderRadius: 2,
                  border: '1px solid #E2E8F0',
                  boxShadow: 'none',
                  bgcolor: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                  color: 'white'
                }}>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                      Ready to Book?
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => router.push(`/booking?carId=${car.id}`)}
                      sx={{
                        py: 2,
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: 16,
                        bgcolor: 'white',
                        color: '#0F172A',
                        boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.15)',
                        '&:hover': {
                          bgcolor: '#F1F5F9',
                          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)'
                        }
                      }}
                    >
                      Book This Vehicle
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* 📝 Description Section */}
          <Grid item xs={12}>
            <Card sx={{
              borderRadius: 2,
              border: '1px solid #E2E8F0',
              boxShadow: 'none'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#6366F1', width: 40, height: 40 }}>
                    <TimelineIcon sx={{ color: 'white' }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight={700} color="#0F172A">
                    Vehicle Description
                  </Typography>
                </Stack>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {car.descriptionEn || "This vehicle represents the pinnacle of automotive engineering, combining cutting-edge technology with exceptional performance. Every component has been meticulously designed and tested to deliver unparalleled reliability, safety, and driving experience. Our rigorous maintenance protocols ensure optimal condition, making it the perfect choice for discerning drivers who demand excellence."}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// 📌 Icons used in logic
function AccessTime() { return <AccessTimeIcon sx={{ fontSize: 18 }} />; }
function Event() { return <EventIcon sx={{ fontSize: 18 }} />; }
