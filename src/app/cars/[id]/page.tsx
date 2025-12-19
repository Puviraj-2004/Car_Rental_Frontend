'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { getTranslation } from '@/lib/i18n';
import Cookies from 'js-cookie';

// GraphQL query to fetch car details
const GET_CAR = gql`
  query GetCar($id: ID!) {
    car(id: $id) {
      id
      brand
      model
      year
      pricePerDay
      imageUrl
      critAirRating
      fuelType
      transmission
      seats
      doors
      descriptionEn
      descriptionFr
    }
  }
`;

export default function CarDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [language, setLanguage] = useState('en');
  
  useEffect(() => {
    // Get language from localStorage or default to 'en'
    const lang = typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en';
    setLanguage(lang);
  }, []);

  const { loading, error, data } = useQuery(GET_CAR, {
    variables: { id: params.id },
  });

  // Check if user has given GDPR consent for analytics
  const hasAnalyticsConsent = Cookies.get('gdpr-consent') === 'true';

  const handleBookNow = () => {
    // Track event only if user has given consent
    if (hasAnalyticsConsent) {
      console.log(`Analytics: User initiated booking for car ${params.id}`);
    }
    
    // Navigate to booking page
    router.push(`/booking/${params.id}`);
  };

  if (loading) return <Typography>{getTranslation(language, 'home.loading')}</Typography>;
  if (error) return <Typography>{getTranslation(language, 'errors.generic')}: {error.message}</Typography>;

  const car = data?.car;

  // Select description based on user language
  const description = language === 'fr' ? car.descriptionFr : car.descriptionEn;

  return (
    <div>
      <Button 
        variant="outlined" 
        onClick={() => router.back()}
        sx={{ mb: 2 }}
      >
        {getTranslation(language, 'booking.back')}
      </Button>
      
      <Card>
        {car.imageUrl ? (
          <CardMedia
            component="img"
            height="300"
            image={car.imageUrl}
            alt={`${car.brand} ${car.model}`}
          />
        ) : (
          <div style={{ height: 300, backgroundColor: '#f0f0f0' }} />
        )}
        
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {car.brand} {car.model}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label={`${getTranslation(language, 'carDetails.year')}: ${car.year}`} />
            <Chip label={`${getTranslation(language, 'carDetails.critAir')}: ${car.critAirRating}`} />
            <Chip label={car.fuelType} />
            <Chip label={car.transmission} />
            <Chip label={`${car.seats} ${getTranslation(language, 'carDetails.seats')}`} />
            <Chip label={`${car.doors} ${getTranslation(language, 'carDetails.doors')}`} />
          </Box>
          
          <Typography variant="h5" color="primary" gutterBottom>
            €{car.pricePerDay}/{getTranslation(language, 'carDetails.pricePerDay')}
          </Typography>
          
          <Typography variant="body1" paragraph>
            {description || getTranslation(language, 'carDetails.noDescription')}
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleBookNow}
          >
            {getTranslation(language, 'carDetails.bookNow')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}