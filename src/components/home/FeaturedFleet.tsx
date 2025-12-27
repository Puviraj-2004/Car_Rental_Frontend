'use client';

import React from 'react';
import { Box, Container, Grid, Typography, Card, CardContent, Button, Skeleton } from '@mui/material';
import Image from 'next/image';
import SafeImage from '@/components/SafeImage';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_CARS_QUERY } from '@/lib/graphql/queries';

export default function FeaturedCars() {
  const router = useRouter();

  // 🚀 Backend-ல் இருந்து கார்களை எடுக்கிறோம்
  const { data, loading, error } = useQuery(GET_CARS_QUERY, {
    variables: { filter: { status: 'AVAILABLE' } } // கிடைக்கும் கார்களை மட்டும் எடுக்க
  });

  if (error) return null; // எரர் வந்தால் இந்த செக்ஷன் தெரியாது

  // நாம் எல்லா கார்களையும் காட்டப் போவதில்லை, முதல் 3 கார்களை மட்டும் காட்டப்போகிறோம்
  const featuredCars = data?.cars?.slice(0, 3) || [];

  return (
    <Box sx={{ py: 12, bgcolor: '#0F172A', color: 'white' }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6 }}>
          <Box>
            <Typography variant="overline" sx={{ color: '#60A5FA', fontWeight: 'bold', letterSpacing: 2 }}>
              EXPLORE
            </Typography>
            <Typography variant="h3" fontWeight="bold">Our Premium Fleet</Typography>
          </Box>
          <Button 
            variant="outlined" 
            color="inherit" 
            onClick={() => router.push('/cars')}
            sx={{ borderRadius: '20px', px: 4 }}
          >
            View All Fleet
          </Button>
        </Box>

        <Grid container spacing={4}>
          {loading ? (
            // லோடிங் ஆகும்போது காட்டும் போலி கட்டங்கள் (Skeletons)
            [1, 2, 3].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={300} sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
              </Grid>
            ))
          ) : (
            featuredCars.map((car: any) => (
              <Grid item xs={12} sm={6} md={4} key={car.id}>
                <Card sx={{ 
                  bgcolor: 'rgba(255,255,255,0.03)', 
                  color: 'white', 
                  borderRadius: 4, 
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: '0.3s',
                  '&:hover': { transform: 'translateY(-10px)', bgcolor: 'rgba(255,255,255,0.07)' }
                }}>
                  <Box sx={{ position: 'relative', height: '240px' }}>
                    <SafeImage 
                      src={car.images?.find((img: any) => img.isPrimary)?.imagePath || '/images/cars/placeholder.png'} 
                      alt={car.model?.name || car.brand?.name || 'Car'} 
                      fill 
                      style={{ objectFit: 'cover' }} 
                      fallback={'/images/cars/placeholder.png'}
                    />
                  </Box>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#60A5FA', fontWeight: 'bold', letterSpacing: 1 }}>
                      {car.brand.name.toUpperCase()}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ mt: 1, mb: 3 }}>
                      {car.model.name}
                    </Typography>
                    
                    {/* உங்கள் விருப்பப்படி விலை (Price) இங்கே இல்லை */}
                    
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="secondary"
                      onClick={() => router.push(`/cars/${car.id}`)}
                      sx={{ borderRadius: 2, fontWeight: 'bold', py: 1.2 }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
}