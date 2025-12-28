'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import {
  Box, Container, Typography, CircularProgress, Alert, Card, CardContent, CardMedia, Grid, Button, Chip, Stack, Paper
} from '@mui/material';
import { GET_MY_BOOKINGS_QUERY } from '@/lib/graphql/queries';
import { format } from 'date-fns';

const MyBookingsPage = () => {
  const router = useRouter();
  const { data, loading, error } = useQuery(GET_MY_BOOKINGS_QUERY);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">Could not load your bookings: {error.message}</Alert>
      </Container>
    );
  }

  const bookings = data?.myBookings || [];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={900} mb={4}>
        My Bookings
      </Typography>

      {bookings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
          <Typography variant="h6" gutterBottom>You have no bookings yet.</Typography>
          <Button variant="contained" onClick={() => router.push('/cars')}>Find a Car</Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {bookings.map((booking: any) => {
            console.log('Booking dates:', { startDate: booking.startDate, endDate: booking.endDate });
            const primaryImage = booking.car.images.find((img: any) => img.isPrimary) || booking.car.images[0];
            return (
              <Grid item xs={12} md={6} lg={4} key={booking.id}>
                <Card sx={{ borderRadius: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={primaryImage?.imagePath}
                    alt={`${booking.car.brand.name} ${booking.car.model.name}`}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={800}>
                      {booking.car.brand.name} {booking.car.model.name}
                    </Typography>
                    <Stack direction="row" spacing={1} my={1}>
                        <Chip label={booking.status} color={booking.status === 'CONFIRMED' ? 'success' : 'default'} size="small"/>
                        <Chip label={`€${booking.totalPrice.toFixed(2)}`} color="primary" size="small" variant="outlined"/>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {(() => {
                        const start = new Date(parseInt(booking.startDate, 10));
                        const end = new Date(parseInt(booking.endDate, 10));
                        const isValidStart = !isNaN(start.getTime());
                        const isValidEnd = !isNaN(end.getTime());
                        if (isValidStart && isValidEnd) {
                          return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
                        }
                        return 'Invalid date range';
                      })()}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2 }}>
                    <Button fullWidth variant="contained" onClick={() => router.push(`/booking/${booking.id}`)}>
                      View Details
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default MyBookingsPage;
