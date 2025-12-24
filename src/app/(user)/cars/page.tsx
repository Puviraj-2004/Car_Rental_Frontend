'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CARS_QUERY } from '@/lib/graphql/queries'; // உங்கள் சரியான பாத்-ஐ கொடுக்கவும்
import { 
  Box, Container, Grid, Card, CardContent, CardMedia, 
  Typography, Button, TextField, MenuItem, Select, 
  FormControl, InputLabel, CircularProgress, Stack, SelectChangeEvent
} from '@mui/material';
import { 
  LocalGasStation, Settings, Person, Search, InfoOutlined
} from '@mui/icons-material';

// --- TYPES ---
interface FilterState {
  brand: string;
  fuelType: string;
  transmission: string;
}

export default function CarsPage() {
  const [isFiltered, setIsFiltered] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    brand: '',
    fuelType: '',
    transmission: ''
  });

  // 📡 GraphQL Query: ஆரம்பத்தில் எல்லா கார்களையும் எடுக்கும்
  const { data, loading, error, refetch } = useQuery(GET_CARS_QUERY, {
    variables: { filter: {} }
  });

  // 🔍 Search Button Logic
  const handleSearch = () => {
    const activeFilters: any = {};
    if (filters.brand) activeFilters.brand = filters.brand;
    if (filters.fuelType) activeFilters.fuelType = filters.fuelType;
    if (filters.transmission) activeFilters.transmission = filters.transmission;

    refetch({ filter: activeFilters });
    setIsFiltered(true); // சர்ச் செய்தவுடன் Book Now பட்டன் எனேபிள் ஆகும்
  };

  // 🔄 Handle Select Changes (Fixes 'unknown' error)
  const handleSelectChange = (e: SelectChangeEvent<string>, field: keyof FilterState) => {
    setFilters({ ...filters, [field]: e.target.value });
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress sx={{ color: '#293D91' }} />
    </Box>
  );

  if (error) return (
    <Container sx={{ py: 10, textAlign: 'center' }}>
      <Typography color="error" variant="h6">Error loading cars. Please check your connection.</Typography>
    </Container>
  );

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        
        {/* 🔍 MODERN FILTER BAR */}
        <Card sx={{ p: 3, mb: 6, borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
          <Typography variant="h6" fontWeight="800" sx={{ mb: 2.5, color: '#1E293B' }}>Find Your Perfect Ride</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3.5}>
              <TextField 
                fullWidth label="Car Brand" variant="outlined" size="small"
                placeholder="e.g. Tesla, BMW"
                value={filters.brand}
                onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Fuel</InputLabel>
                <Select 
                  label="Fuel"
                  value={filters.fuelType}
                  onChange={(e) => handleSelectChange(e, 'fuelType')}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="PETROL">Petrol</MenuItem>
                  <MenuItem value="DIESEL">Diesel</MenuItem>
                  <MenuItem value="ELECTRIC">Electric</MenuItem>
                  <MenuItem value="HYBRID">Hybrid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Transmission</InputLabel>
                <Select 
                  label="Transmission"
                  value={filters.transmission}
                  onChange={(e) => handleSelectChange(e, 'transmission')}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="MANUAL">Manual</MenuItem>
                  <MenuItem value="AUTOMATIC">Automatic</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3.5}>
              <Button 
                fullWidth variant="contained" 
                startIcon={<Search />} 
                onClick={handleSearch}
                sx={{ 
                  py: 1.4, bgcolor: '#293D91', borderRadius: '12px', fontWeight: '700',
                  textTransform: 'none', '&:hover': { bgcolor: '#1e2d6b' }
                }}
              >
                Search Cars
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* 🚗 CARS LISTING */}
        <Grid container spacing={4}>
          {data?.cars.length === 0 ? (
            <Grid item xs={12} sx={{ textAlign: 'center', py: 10 }}>
              <Typography variant="h6" color="textSecondary">No cars found matching your criteria.</Typography>
            </Grid>
          ) : (
            data?.cars.map((car: any) => (
              <Grid item xs={12} sm={6} md={4} key={car.id}>
                <Card sx={{ 
                  borderRadius: '24px', 
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 30px rgba(0,0,0,0.1)' }
                }}>
                  {/* Car Image */}
                  <CardMedia
                    component="img"
                    height="220"
                    // இமேஜ் சர்வர் URL-ஐ இங்கே சரிபார்க்கவும்
                    image={car.images?.find((img: any) => img.isPrimary)?.imagePath 
                      ? `http://localhost:4000${car.images.find((img: any) => img.isPrimary).imagePath}` 
                      : '/no-car-image.png'}
                    alt={`${car.brand} ${car.model}`}
                    sx={{ bgcolor: '#F1F5F9' }}
                  />

                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" fontWeight="800" color="#1E293B">
                          {car.brand} {car.model}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">{car.year}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" fontWeight="900" color="#293D91">€{car.pricePerDay}</Typography>
                        <Typography variant="caption" color="textSecondary">per day</Typography>
                      </Box>
                    </Stack>
                    
                    {/* Features Grid */}
                    <Grid container spacing={1} sx={{ mb: 3 }}>
                      <Grid item xs={4} display="flex" alignItems="center" gap={0.5}>
                        <LocalGasStation sx={{ fontSize: 18, color: '#64748B' }} /> 
                        <Typography variant="caption" fontWeight="600" color="#475569">{car.fuelType}</Typography>
                      </Grid>
                      <Grid item xs={4} display="flex" alignItems="center" gap={0.5}>
                        <Settings sx={{ fontSize: 18, color: '#64748B' }} /> 
                        <Typography variant="caption" fontWeight="600" color="#475569">{car.transmission === 'AUTOMATIC' ? 'Auto' : 'Manual'}</Typography>
                      </Grid>
                      <Grid item xs={4} display="flex" alignItems="center" gap={0.5}>
                        <Person sx={{ fontSize: 18, color: '#64748B' }} /> 
                        <Typography variant="caption" fontWeight="600" color="#475569">{car.seats} Seats</Typography>
                      </Grid>
                    </Grid>

                    {/* 🚀 ACTION BUTTON */}
                    {isFiltered ? (
                      <Button 
                        fullWidth variant="contained" 
                        sx={{ 
                          py: 1.5, borderRadius: '12px', bgcolor: '#10B981', fontWeight: '700',
                          textTransform: 'none', '&:hover': { bgcolor: '#059669' }
                        }}
                      >
                        Book Now
                      </Button>
                    ) : (
                      <Button 
                        fullWidth variant="outlined" disabled
                        startIcon={<InfoOutlined />}
                        sx={{ py: 1.5, borderRadius: '12px', textTransform: 'none', fontWeight: '600' }}
                      >
                        Filter to Enable Booking
                      </Button>
                    )}
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