'use client';

import React from 'react';
import { Box, Container, Grid, Typography, Card, CardContent, Button, Skeleton } from '@mui/material';
import SafeImage from '@/components/SafeImage';
import { useQuery } from '@apollo/client';
import { GET_CARS_QUERY } from '@/lib/graphql/queries';
import { useRouter } from 'next/navigation';

export default function CarsPage() {
  const router = useRouter();
  const { data, loading, error } = useQuery(GET_CARS_QUERY, { variables: { filter: {} } });

  if (error) return (
    <Container sx={{ py: 12 }}>
      <Typography variant="h6">Failed to load cars.</Typography>
    </Container>
  );

  const cars = data?.cars || [];

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="xl">
        <Typography variant="h3" fontWeight="bold" sx={{ mb: 4 }}>Our Fleet</Typography>

        <Grid container spacing={4}>
          {loading ? (
            [1,2,3,4].map(i => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
              </Grid>
            ))
          ) : cars.length ? (
            cars.map((car: any) => (
              <Grid item xs={12} sm={6} md={3} key={car.id}>
                <Card sx={{ borderRadius: 2 }}>
                  <Box sx={{ position: 'relative', height: 200 }}>
                    <SafeImage src={car.images?.find((img:any) => img.isPrimary)?.imagePath || '/images/cars/placeholder.png'} alt={car.model?.name || car.brand?.name || 'Car'} fill style={{ objectFit: 'cover' }} fallback={'/images/cars/placeholder.png'} />
                  </Box>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">{car.brand.name.toUpperCase()}</Typography>
                    <Typography variant="h6" fontWeight="bold">{car.model.name}</Typography>
                    <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push(`/cars/${car.id}`)}>View</Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography>No cars available yet.</Typography>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}
