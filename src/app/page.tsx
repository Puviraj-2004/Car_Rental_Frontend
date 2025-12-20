'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { 
  Typography, Card, CardContent, CardMedia, Button, Box, 
  Container, Grid, TextField, MenuItem, FormControl, 
  InputLabel, Select, Paper 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getTranslation, getUserLanguage } from '@/lib/i18n';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

// 1. GraphQL Query
const GET_CARS = gql`
  query GetCars {
    cars {
      id
      brand
      model
      year
      pricePerDay
      critAirRating
      images {
        imagePath
        isPrimary
      }
    }
  }
`;

// 2. Mock Data (Backend வேலை செய்யாதபோது பயன்படுத்துவதற்கு)
const mockCars = [
  { id: '1', brand: 'Tesla', model: 'Model 3', year: 2024, pricePerDay: 120, critAirRating: 0, images: [] },
  { id: '2', brand: 'Toyota', model: 'Corolla', year: 2023, pricePerDay: 50, critAirRating: 1, images: [] },
  { id: '3', brand: 'BMW', model: 'X5', year: 2022, pricePerDay: 150, critAirRating: 2, images: [] },
  { id: '4', brand: 'Audi', model: 'A4', year: 2023, pricePerDay: 90, critAirRating: 2, images: [] }
];

const carBrands = ['Tesla', 'Toyota', 'BMW', 'Audi', 'Mercedes', 'Ford'];

export default function HomePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<string | null>(null);
  const [filters, setFilters] = useState({ brand: '', model: '', date: '', time: '' });

  // 3. Language & Consent Logic
  useEffect(() => {
    setLanguage(getUserLanguage());
  }, []);

  const { loading, error, data } = useQuery<{ cars: any[] }>(GET_CARS);
  const hasAnalyticsConsent = Cookies.get('gdpr-consent') === 'true';

  if (!language || loading) return <Container sx={{ py: 10, textAlign: 'center' }}><Typography>Loading...</Typography></Container>;

  const handleViewDetails = (carId: string) => {
    if (hasAnalyticsConsent) console.log(`Analytics: Viewing car ${carId}`);
    router.push(`/cars/${carId}`);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const rawCars = data?.cars || mockCars;
  const filteredCars = rawCars.filter((car: any) => {
    if (filters.brand && car.brand !== filters.brand) return false;
    if (filters.model && !car.model.toLowerCase().includes(filters.model.toLowerCase())) return false;
    return true;
  });

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', minHeight: '60vh', display: 'flex', alignItems: 'center', pb: 8, color: 'white' }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
                {getTranslation(language, 'hero.headline')}
              </Typography>
              <Typography variant="h5" sx={{ color: '#CBD5E1', mb: 4 }}>
                {getTranslation(language, 'hero.subtitle')}
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Filter Section */}
      <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 10, mb: 6 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Brand</InputLabel>
                <Select value={filters.brand} label="Brand" onChange={(e) => handleFilterChange('brand', e.target.value)}>
                  <MenuItem value=""><em>All Brands</em></MenuItem>
                  {carBrands.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Model" value={filters.model} onChange={(e) => handleFilterChange('model', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" startIcon={<SearchIcon />} sx={{ backgroundColor: '#293D91', height: '40px' }}>Search</Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Car Listings */}
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>{getTranslation(language, 'home.title')}</Typography>
        <Grid container spacing={3}>
          {filteredCars.map((car: any) => (
            <Grid item key={car.id} xs={12} sm={6} md={4}>
              <Card sx={{ transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                <CardMedia component="img" height="200" image={car.images?.[0]?.imagePath || "https://via.placeholder.com/300x200?text=No+Image"} />
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{car.brand} {car.model}</Typography>
                  <Typography variant="body2" color="text.secondary">Crit'Air: {car.critAirRating}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">€{car.pricePerDay}/day</Typography>
                    <Button variant="contained" size="small" sx={{ backgroundColor: '#293D91' }} onClick={() => handleViewDetails(car.id)}>
                      {getTranslation(language, 'carDetails.bookNow')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}