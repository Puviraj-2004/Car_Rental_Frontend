'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client/react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { getTranslation } from '@/lib/i18n';
import Cookies from 'js-cookie';

// GraphQL query to fetch cars
const GET_CARS = gql`
  query GetCars {
    cars {
      id
      brand
      model
      year
      pricePerDay
      imageUrl
      critAirRating
    }
  }
`;

export default function Home() {
  const [language, setLanguage] = useState('en');
  
  useEffect(() => {
    // Get language from localStorage or default to 'en'
    const lang = typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en';
    setLanguage(lang);
  }, []);

  const { loading, error, data } = useQuery(GET_CARS);

  // Check if user has given GDPR consent for analytics
  const hasAnalyticsConsent = Cookies.get('gdpr-consent') === 'true';

  const handleViewDetails = (carId: string) => {
    // Track event only if user has given consent
    if (hasAnalyticsConsent) {
      console.log(`Analytics: User viewed details for car ${carId}`);
    }
    
    // Navigate to car details page
    window.location.href = `/cars/${carId}`;
  };

  if (loading) return <Typography>{getTranslation(language, 'home.loading')}</Typography>;
  if (error) return <Typography>{getTranslation(language, 'errors.generic')}: {error.message}</Typography>;

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {getTranslation(language, 'home.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {data?.cars?.length || 0} {getTranslation(language, 'home.carsAvailable')}
        </Typography>
      </Box>
      
      {data?.cars && data.cars.length === 0 ? (
        <Typography align="center" sx={{ mt: 4 }}>
          {getTranslation(language, 'home.noCars')}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {data?.cars?.map((car: any) => (
            <Grid item xs={12} sm={6} md={4} key={car.id}>
              <Card>
                {car.imageUrl ? (
                  <CardMedia
                    component="img"
                    height="140"
                    image={car.imageUrl}
                    alt={`${car.brand} ${car.model}`}
                  />
                ) : (
                  <div style={{ height: 140, backgroundColor: '#f0f0f0' }} />
                )}
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {car.brand} {car.model}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getTranslation(language, 'carDetails.year')}: {car.year}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getTranslation(language, 'carDetails.critAir')}: {car.critAirRating}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    €{car.pricePerDay}/{getTranslation(language, 'carDetails.pricePerDay')}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    sx={{ mt: 2 }}
                    onClick={() => handleViewDetails(car.id)}
                  >
                    {getTranslation(language, 'carDetails.bookNow')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
}