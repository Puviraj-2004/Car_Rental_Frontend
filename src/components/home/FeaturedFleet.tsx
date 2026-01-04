'use client';

import React from 'react';
import { Box, Container, Grid, Typography, Card, Button, Stack, IconButton, Skeleton } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_CARS_QUERY } from '@/lib/graphql/queries';
import SafeImage from '@/components/SafeImage';

// Icons
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

export default function FeaturedFleet() {
  const router = useRouter();
  
  const { data, loading, error } = useQuery(GET_CARS_QUERY, {
    variables: { filter: { statuses: ['AVAILABLE'] } } 
  });

  if (error) return null; 
  const featuredCars = data?.cars?.slice(0, 3) || [];

  return (
    <Box sx={{ py: 10, bgcolor: '#FFFFFF' }}>
      <Container maxWidth="xl">
        
        {/* HEADER */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="overline" sx={{ color: '#94A3B8', fontWeight: 800, letterSpacing: 1.5 }}>
            POPULAR DEALS
          </Typography>
          <Typography variant="h3" sx={{ color: '#0F172A', fontWeight: 800, mt: 1 }}>
            Most Popular Cars
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {loading ? (
            [1, 2, 3].map((i) => (
              <Grid item xs={12} md={4} key={i}>
                <Skeleton variant="rectangular" height={380} sx={{ borderRadius: 4 }} />
              </Grid>
            ))
          ) : (
            featuredCars.map((car: any) => (
              <Grid item xs={12} md={4} key={car.id}>
                <Card 
                  elevation={0}
                  sx={{
                    bgcolor: '#F8F9FB', 
                    borderRadius: 5,
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    border: '1px solid transparent',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: '#F1F5F9',
                      transform: 'translateY(-5px)',
                      borderColor: 'rgba(124, 58, 237, 0.2)',
                      '& .car-image': { transform: 'scale(1.05)' } // Slight zoom on hover
                    }
                  }}
                  onClick={() => router.push(`/cars/viewDetails/${car.id}`)}
                >
                  {/* 1. TOP INFO */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ lineHeight: 1.2 }}>
                        {car.brand.name}
                      </Typography>
                      <Typography variant="caption" color="#64748B" fontWeight={500}>
                        {car.model.name}
                      </Typography>
                    </Box>
                    <IconButton size="small" sx={{ color: '#94A3B8' }}>
                      <FavoriteBorderIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* 2. CAR IMAGE - Increased Height & Full Width */}
                  <Box 
                    className="car-image"
                    sx={{ 
                      height: 220, // Increased from 160 to 220 to fill space
                      width: '100%',
                      position: 'relative', 
                      my: 1, // Reduced margin
                      transition: 'transform 0.3s ease',
                      filter: 'drop-shadow(0 15px 15px rgba(0,0,0,0.1))'
                    }}
                  >
                    <SafeImage
                      src={(car.images.find((img: { isPrimary: boolean }) => img.isPrimary) || car.images[0])?.url}
                      alt={`${car.brand.name} ${car.model.name}`}
                      fill
                      style={{ 
                        objectFit: 'contain', // Keeps whole car visible
                        objectPosition: 'center' // Centers it perfectly
                      }}
                    />
                  </Box>

                  {/* 3. SPECS */}
                  <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    alignItems="center" 
                    sx={{ mb: 3, mt: 'auto', px: 1 }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center" color="#64748B">
                      <LocalGasStationIcon sx={{ fontSize: 18 }} />
                      <Typography variant="caption" fontWeight={600}>{car.fuelType}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center" color="#64748B">
                      <SettingsIcon sx={{ fontSize: 18 }} />
                      <Typography variant="caption" fontWeight={600}>{car.transmission}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center" color="#64748B">
                      <PeopleIcon sx={{ fontSize: 18 }} />
                      <Typography variant="caption" fontWeight={600}>{car.seats} People</Typography>
                    </Stack>
                  </Stack>

                  {/* 4. FOOTER */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" fontWeight={800} color="#0F172A">
                        €{car.pricePerDay?.toFixed(0)}
                        <Typography component="span" variant="caption" color="#64748B" sx={{ ml: 0.5 }}>
                          /day
                        </Typography>
                      </Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                      sx={{ 
                        bgcolor: '#7C3AED', 
                        color: 'white',
                        borderRadius: '50px',
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 3,
                        boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.4)',
                        '&:hover': { bgcolor: '#6D28D9' }
                      }}
                    >
                      Rent Now
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
}