import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { Box, Typography, CircularProgress, Grid, Card, CardContent } from '@mui/material';
import Image from 'next/image';
import { GET_CAR_QUERY } from '@/lib/graphql/queries';

export default function CarDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data, loading, error } = useQuery(GET_CAR_QUERY, {
    variables: { id },
    skip: !id,
  });

  if (loading) return <CircularProgress />;
  if (error || !data?.car) return <Typography>Error loading car details.</Typography>;

  const { car } = data;
  const primaryImage = car.images?.find((img) => img.isPrimary)?.imagePath;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {car.brand.name} {car.model.name}
      </Typography>
      <Image src={primaryImage} alt={car.model.name} width={800} height={500} layout="responsive" />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="body1" gutterBottom>
            {car.descriptionEn}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Year: {car.year} | Fuel: {car.fuelType} | Transmission: {car.transmission} | Seats: {car.seats}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
