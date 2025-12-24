'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { 
  Typography, Card, CardContent, CardMedia, Button, Box, 
  Container, Grid, TextField, MenuItem, FormControl, 
  InputLabel, Select, Paper, CircularProgress 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getTranslation, getUserLanguage } from '@/lib/i18n';
import { GET_CARS_QUERY } from '@/lib/graphql/queries'; // 👈 உங்கள் குயரியை இங்கே இம்போர்ட் செய்யவும்
import { useRouter } from 'next/navigation';

const carBrands = ['Tesla', 'Toyota', 'BMW', 'Audi', 'Mercedes', 'Ford'];

export default function HomePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<string>('en');
  const [filters, setFilters] = useState({ brand: '', model: '' });
  const [searchTrigger, setSearchTrigger] = useState({ brand: '', model: '' });

  useEffect(() => {
    setLanguage(getUserLanguage());
  }, []);

  const { loading, error, data } = useQuery(GET_CARS_QUERY);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}><CircularProgress /></Box>;
  const handleSearch = () => {
    setSearchTrigger({ brand: filters.brand, model: filters.model });
  };

  const cars = data?.cars || [];
  
  const filteredCars = cars.filter((car: any) => {
    const brandMatch = searchTrigger.brand ? car.brand === searchTrigger.brand : true;
    const modelMatch = searchTrigger.model ? car.model.toLowerCase().includes(searchTrigger.model.toLowerCase()) : true;
    return brandMatch && modelMatch;
  });

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', 
        pt: { xs: 8, md: 12 }, pb: { xs: 12, md: 16 }, color: 'white' 
      }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2.5rem', md: '3.75rem' } }}>
            {getTranslation(language, 'hero.headline')}
          </Typography>
          <Typography variant="h5" sx={{ color: '#CBD5E1', mb: 4, maxWidth: '600px' }}>
            {getTranslation(language, 'hero.subtitle')}
          </Typography>
        </Container>
      </Box>

      {/* Filter Section (Sticky overlap) */}
      <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 10 }}>
        <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth size="small">
                <InputLabel>Brand</InputLabel>
                <Select 
                  value={filters.brand} 
                  label="Brand" 
                  onChange={(e) => setFilters({...filters, brand: e.target.value})}
                >
                  <MenuItem value="">All Brands</MenuItem>
                  {carBrands.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField 
                fullWidth size="small" label="Model" 
                value={filters.model} 
                onChange={(e) => setFilters({...filters, model: e.target.value})} 
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button 
                fullWidth variant="contained" 
                onClick={handleSearch}
                startIcon={<SearchIcon />} 
                sx={{ bgcolor: '#293D91', height: '40px' }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Car Grid */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          {getTranslation(language, 'home.title')}
        </Typography>
        
        <Grid container spacing={4}>
          {filteredCars.map((car: any) => (
            <Grid item key={car.id} xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 3, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia 
                  component="img" 
                  height="220" 
                  image={car.images && car.images.length > 0 
                    ? `http://localhost:4000${car.images[0].imagePath}` 
                    : "https://via.placeholder.com/400x250?text=No+Image"} 
                  alt={car.model}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{car.brand} {car.model}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{car.year}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>€{car.pricePerDay}/day</Typography>
                    <Button 
                      variant="contained" size="small" 
                      onClick={() => router.push(`/cars/${car.id}`)}
                      sx={{ bgcolor: '#293D91', textTransform: 'none', borderRadius: 2 }}
                    >
                      {getTranslation(language, 'carDetails.bookNow')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredCars.length === 0 && (
          <Typography sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
            No cars found matching your search.
          </Typography>
        )}
      </Container>
    </Box>
  );
}