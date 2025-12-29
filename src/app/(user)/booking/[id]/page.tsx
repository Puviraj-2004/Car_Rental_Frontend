'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  Box, Container, Typography, Paper, Grid, CircularProgress, Alert, Card, CardMedia, CardContent, Chip
} from '@mui/material';
import { Event, Schedule, Euro } from '@mui/icons-material';
import { GET_BOOKING_BY_ID_QUERY } from '@/lib/graphql/queries';
import { format } from 'date-fns';

const BookingDetailsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewBooking = searchParams.get('new') === 'true';
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (isNewBooking) {
      const timer = setTimeout(() => {
        router.push('/my-bookings');
      }, 5000); // 5-second delay

      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [isNewBooking, router]);

  const { data, loading, error } = useQuery(GET_BOOKING_BY_ID_QUERY, {
    variables: { id },
    skip: !id,
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="error">Error loading booking details: {error.message}</Alert>
      </Container>
    );
  }

  if (!data?.booking) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="warning">Booking not found.</Alert>
      </Container>
    );
  }

  const { booking } = data;
  const primaryImage = booking.car.images.find((img: any) => img.isPrimary) || booking.car.images[0];

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {isNewBooking && (
        <Alert severity="success" sx={{ mb: 4, borderRadius: 3 }}>
          <Typography fontWeight="bold">Booking Reserved!</Typography>
          <Typography variant="body2">A magic verification link has been sent to your email. Please upload your documents to finalize your rental. You will be redirected to your bookings page shortly...</Typography>
        </Alert>
      )}
      <Typography variant="h4" fontWeight={900} mb={4}>
        Booking Confirmation
      </Typography>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ borderRadius: 3 }}>
              <CardMedia
                component="img"
                height="250"
                image={primaryImage?.imagePath}
                alt={`${booking.car.brand.name} ${booking.car.model.name}`}
              />
              <CardContent>
                <Typography variant="h5" fontWeight={800}>
                  {booking.car.brand.name} {booking.car.model.name}
                </Typography>
                <Chip label={booking.status} color={booking.status === 'CONFIRMED' ? 'success' : 'warning'} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Rental Details
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Event sx={{ mr: 1.5, color: 'text.secondary' }} />
              <Typography>
                <strong>From:</strong> {format(new Date(booking.startDate), 'PPP p')}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={2}>
              <Schedule sx={{ mr: 1.5, color: 'text.secondary' }} />
              <Typography>
                <strong>To:</strong> {format(new Date(booking.endDate), 'PPP p')}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={2}>
              <Euro sx={{ mr: 1.5, color: 'text.secondary' }} />
              <Typography>
                <strong>Total Price:</strong> €{booking.totalPrice.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default BookingDetailsPage;
