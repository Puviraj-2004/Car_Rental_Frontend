'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getTranslation } from '@/lib/i18n';

// GraphQL query to fetch booking details
const GET_BOOKING = gql`
  query GetBooking($id: ID!) {
    booking(id: $id) {
      id
      startDate
      endDate
      totalPrice
      basePrice
      taxAmount
      status
      car {
        brand
        model
      }
    }
  }
`;

export default function SuccessPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [language, setLanguage] = useState('en');
  
  useEffect(() => {
    // Get language from localStorage or default to 'en'
    const lang = typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en';
    setLanguage(lang);
  }, []);

  const { loading, error, data } = useQuery(GET_BOOKING, {
    variables: { id: params.id },
  });

  if (loading) return <Typography>{getTranslation(language, 'home.loading')}</Typography>;
  if (error) return <Typography>{getTranslation(language, 'errors.generic')}: {error.message}</Typography>;

  const booking = data?.booking;

  return (
    <div>
      <Box textAlign="center" sx={{ mb: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom>
          {getTranslation(language, 'booking.bookingConfirmed')}
        </Typography>
        <Typography variant="h5" color="text.secondary">
          {getTranslation(language, 'booking.thankYou')}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {getTranslation(language, 'booking.step1')}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6">
              {booking.car.brand} {booking.car.model}
            </Typography>
            <Typography variant="body1">
              {getTranslation(language, 'booking.bookingId')}: {booking.id}
            </Typography>
            <Typography variant="body1">
              {getTranslation(language, 'booking.status')}: {booking.status}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              {getTranslation(language, 'booking.startDate')}: {new Date(booking.startDate).toLocaleDateString()}
            </Typography>
            <Typography variant="body1">
              {getTranslation(language, 'booking.endDate')}: {new Date(booking.endDate).toLocaleDateString()}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              {getTranslation(language, 'booking.basePrice')}: €{booking.basePrice.toFixed(2)}
            </Typography>
            <Typography variant="body1">
              {getTranslation(language, 'booking.tax')}: €{booking.taxAmount.toFixed(2)}
            </Typography>
            <Typography variant="h6">
              {getTranslation(language, 'booking.totalPrice')}: €{booking.totalPrice.toFixed(2)}
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => router.push('/')}
          >
            {getTranslation(language, 'booking.browseMoreCars')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}