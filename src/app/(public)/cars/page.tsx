'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { Box, Container, Grid, Typography, Card, CardContent, Button, Chip, Skeleton } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { GET_CARS_QUERY } from '@/lib/graphql/queries';

export default function CarsPage() {
  const router = useRouter();

  const { data, loading, error } = useQuery(GET_CARS_QUERY, {
    variables: { filter: { status: 'AVAILABLE' } },
  });

  const cars = data?.cars ?? [];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={900}>
            Fleet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Browse available cars and start a booking.
          </Typography>
        </Box>

        {error ? (
          <Typography color="error">Failed to load cars.</Typography>
        ) : (
          <Grid container spacing={3}>
            {loading
              ? Array.from({ length: 6 }).map((_, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 4 }} />
                  </Grid>
                ))
              : cars.map((car: any) => {
                  const primaryImage = car.images?.find((img: any) => img.isPrimary)?.imagePath;
                  const title = `${car.brand?.name ?? ''} ${car.model?.name ?? ''}`.trim();
                  return (
                    <Grid item xs={12} sm={6} md={4} key={car.id}>
                      <Card sx={{ borderRadius: 4, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ position: 'relative', height: 220, bgcolor: '#0F172A' }}>
                          <Image
                            src={primaryImage || 'https://via.placeholder.com/400x300/0F172A/FFFFFF?text=No+Image'}
                            alt={title || 'Car'}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </Box>
                        <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                            <Typography variant="h6" fontWeight={900}>
                              {title || 'Car'}
                            </Typography>
                            <Chip label={car.status} size="small" color="success" />
                          </Box>

                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {car.year} • {car.fuelType} • {car.transmission} • {car.seats} seats
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                            {car.pricePerDay ? <Chip size="small" label={`Day: €${car.pricePerDay}`} /> : null}
                            {car.pricePerHour ? <Chip size="small" label={`Hour: €${car.pricePerHour}`} /> : null}
                            {car.pricePerKm ? <Chip size="small" label={`KM: €${car.pricePerKm}`} /> : null}
                          </Box>

                          <Box sx={{ mt: 3, display: 'flex', gap: 1.5 }}>
                            <Button
                              variant="contained"
                              fullWidth
                              onClick={() => router.push(`/cars/${car.id}`)}
                              sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
                            >
                              View & Book
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}