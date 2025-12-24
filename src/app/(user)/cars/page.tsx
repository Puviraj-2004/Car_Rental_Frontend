'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_AVAILABLE_CARS_QUERY, GET_CARS_QUERY, GET_BRANDS_QUERY } from '@/lib/graphql/queries';
import { 
  Box, Container, Grid, Card, CardContent, CardMedia, 
  Typography, Button, TextField, MenuItem, Select, 
  FormControl, InputLabel, CircularProgress, Stack, SelectChangeEvent,
  Paper, Slider, Chip, Divider, Skeleton, InputAdornment
} from '@mui/material';
import { 
  LocalGasStation, Settings, Person, Search, 
  CalendarMonth, AccessTime, FilterList, RestartAlt
} from '@mui/icons-material';

export default function CarsPage() {
  const [dateFilters, setDateFilters] = useState({
    pickupDate: '',
    pickupTime: '10:00',
    dropoffDate: '',
    dropoffTime: '10:00'
  });
  
  const [filters, setFilters] = useState({
    brand: '',
    fuelType: '',
    transmission: '',
    maxPrice: 1000
  });

  const isSearchActive = dateFilters.pickupDate !== '' && dateFilters.dropoffDate !== '';

  // 1. Available Cars Query (When dates are selected)
  const { data: availableData, loading: availableLoading } = useQuery(GET_AVAILABLE_CARS_QUERY, {
    variables: {
      startDate: `${dateFilters.pickupDate}T${dateFilters.pickupTime}:00`,
      endDate: `${dateFilters.dropoffDate}T${dateFilters.dropoffTime}:00`
    },
    skip: !isSearchActive
  });

  // 2. All Cars Query (Default View)
  const { data: allCarsData, loading: allLoading } = useQuery(GET_CARS_QUERY, {
    skip: isSearchActive // Search ஆக்டிவ் ஆக இருந்தால் இதைத் தவிர்க்கவும்
  });

  const { data: brandsData } = useQuery(GET_BRANDS_QUERY);

  // Combine logic
  const displayCars = isSearchActive ? availableData?.availableCars : allCarsData?.cars;
  const isLoading = isSearchActive ? availableLoading : allLoading;

  // Secondary filtering on the client side for better performance
  const filteredCars = useMemo(() => {
    if (!displayCars) return [];
    
    return displayCars?.filter((car: any) => {
      // When dates are not selected, show all cars regardless of status
      if (!isSearchActive) {
        if (filters.brand && car.brand.name !== filters.brand) return false;
        if (filters.fuelType && car.fuelType !== filters.fuelType) return false;
        if (filters.transmission && car.transmission !== filters.transmission) return false;
        const price = car.pricePerDay || car.pricePerHour || 0;
        if (price > filters.maxPrice) return false;
        return true;
      }
      
      // When dates are selected, only show available cars
      if (car.status !== 'AVAILABLE') return false;
      
      if (filters.brand && car.brand.name !== filters.brand) return false;
      if (filters.fuelType && car.fuelType !== filters.fuelType) return false;
      if (filters.transmission && car.transmission !== filters.transmission) return false;
      const price = car.pricePerDay || car.pricePerHour || 0;
      if (price > filters.maxPrice) return false;
      return true;
    });
  }, [displayCars, filters, isSearchActive]);

  const resetFilters = () => {
    setFilters({ brand: '', fuelType: '', transmission: '', maxPrice: 1000 });
    setDateFilters({ pickupDate: '', pickupTime: '10:00', dropoffDate: '', dropoffTime: '10:00' });
  };

  return (
    <Box sx={{ bgcolor: '#F1F5F9', minHeight: '100vh' }}>
      
      {/* 🚀 TOP FIXED SEARCH BAR */}
      <Paper elevation={0} sx={{ 
        position: 'fixed', top: 64, left: 0, right: 0, zIndex: 1100, 
        bgcolor: 'white', borderBottom: '1px solid #E2E8F0', py: 2 
      }}>
        <Container maxWidth="xl">
          <Grid container spacing={2} alignItems="center">
            {/* Pickup */}
            <Grid item xs={12} md={5}>
              <Stack direction="row" spacing={1}>
                <TextField 
                  fullWidth label="Pickup Date" type="date" size="small"
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  InputLabelProps={{ shrink: true }}
                  value={dateFilters.pickupDate}
                  onChange={(e) => setDateFilters({...dateFilters, pickupDate: e.target.value, dropoffDate: ''})}
                />
                <TextField 
                  sx={{ width: 150 }} label="Time" type="time" size="small"
                  InputLabelProps={{ shrink: true }}
                  value={dateFilters.pickupTime}
                  onChange={(e) => setDateFilters({...dateFilters, pickupTime: e.target.value})}
                />
              </Stack>
            </Grid>

            {/* Return - Logic Fix: min date depends on pickupDate */}
            <Grid item xs={12} md={5}>
              <Stack direction="row" spacing={1}>
                <TextField 
                  fullWidth label="Return Date" type="date" size="small"
                  disabled={!dateFilters.pickupDate}
                  inputProps={{ min: dateFilters.pickupDate || new Date().toISOString().split('T')[0] }}
                  InputLabelProps={{ shrink: true }}
                  value={dateFilters.dropoffDate}
                  onChange={(e) => setDateFilters({...dateFilters, dropoffDate: e.target.value})}
                />
                <TextField 
                  sx={{ width: 150 }} label="Time" type="time" size="small"
                  InputLabelProps={{ shrink: true }}
                  value={dateFilters.dropoffTime}
                  onChange={(e) => setDateFilters({...dateFilters, dropoffTime: e.target.value})}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button 
                fullWidth variant="contained" disableElevation
                onClick={resetFilters} startIcon={<RestartAlt />}
                sx={{ bgcolor: '#1E293B', borderRadius: 2, py: 1, textTransform: 'none' }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>

          {/* Secondary Filters Row */}
          <Stack direction="row" spacing={2} sx={{ mt: 2, overflowX: 'auto', alignItems: 'center' }}>
            <FilterList fontSize="small" color="action" />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select value={filters.brand} displayEmpty onChange={(e) => setFilters({...filters, brand: e.target.value})}>
                <MenuItem value="">All Brands</MenuItem>
                {brandsData?.brands?.map((b: any) => <MenuItem key={b.id} value={b.name}>{b.name}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select value={filters.fuelType} displayEmpty onChange={(e) => setFilters({...filters, fuelType: e.target.value})}>
                <MenuItem value="">Any Fuel</MenuItem>
                <MenuItem value="PETROL">Petrol</MenuItem>
                <MenuItem value="DIESEL">Diesel</MenuItem>
                <MenuItem value="ELECTRIC">Electric</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select value={filters.transmission} displayEmpty onChange={(e) => setFilters({...filters, transmission: e.target.value})}>
                <MenuItem value="">Any Gear</MenuItem>
                <MenuItem value="AUTOMATIC">Automatic</MenuItem>
                <MenuItem value="MANUAL">Manual</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ minWidth: 150, ml: 'auto !important' }}>
              <Typography variant="caption" color="textSecondary">Max Price: €{filters.maxPrice}</Typography>
              <Slider 
                size="small" value={filters.maxPrice} min={0} max={1000} step={50}
                onChange={(_, v) => setFilters({...filters, maxPrice: v as number})}
                sx={{ color: '#293D91' }}
              />
            </Box>
          </Stack>
        </Container>
      </Paper>

      {/* 🚀 CARS GRID AREA */}
      <Container maxWidth="xl" sx={{ pt: 28, pb: 10 }}>
        
        {/* Status Text */}
        <Typography variant="h5" fontWeight="800" sx={{ mb: 3, color: '#1E293B' }}>
          {isSearchActive ? `Available Cars for Your Dates` : 'Browse All Cars'}
          <Typography component="span" sx={{ ml: 2, fontWeight: 400, color: 'text.secondary', fontSize: '1rem' }}>
            ({filteredCars?.length || 0} found)
          </Typography>
        </Typography>

        {isLoading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4 }} />
                <Skeleton sx={{ mt: 1 }} width="70%" />
                <Skeleton width="40%" />
              </Grid>
            ))}
          </Grid>
        ) : filteredCars?.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: 8 }}>
            <Typography variant="h6" color="textSecondary">No cars match your search criteria.</Typography>
            <Button sx={{ mt: 2 }} onClick={resetFilters}>Show All Cars</Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredCars?.map((car: any) => (
              <Grid item xs={12} sm={6} md={3} key={car.id}>
                <Card sx={{ 
                  borderRadius: 5, overflow: 'hidden', border: '1px solid #E2E8F0',
                  boxShadow: 'none', transition: '0.3s',
                  '&:hover': { boxShadow: '0 12px 24px rgba(0,0,0,0.08)', borderColor: '#293D91' }
                }}>
                  <Box sx={{ position: 'relative', height: 180, bgcolor: '#f8f8f8' }}>
                    <CardMedia
                      component="img" image={car.images?.[0] ? `http://localhost:4000${car.images[0].imagePath}` : '/no-car.png'}
                      sx={{ height: '100%', objectFit: 'cover' }}
                    />
                  </Box>

                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight="800" sx={{ mb: 1.5, color: '#1E293B' }} noWrap>
                      {car.brand.name} {car.model.name}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} mb={3} flexWrap="wrap" useFlexGap>
                      <Chip label={car.fuelType} size="small" icon={<LocalGasStation sx={{ fontSize: 14 }} />} sx={{ borderRadius: 1.5 }} />
                      <Chip label={car.transmission === 'AUTOMATIC' ? 'Auto' : 'Manual'} size="small" icon={<Settings sx={{ fontSize: 14 }} />} sx={{ borderRadius: 1.5 }} />
                      <Chip label={`${car.seats} Seats`} size="small" icon={<Person sx={{ fontSize: 14 }} />} sx={{ borderRadius: 1.5 }} />
                    </Stack>

                    <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h5" fontWeight="900" color="#293D91">
                          €{car.pricePerDay || car.pricePerHour}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">per day</Typography>
                      </Box>
                      <Button 
                        variant="contained" disableElevation
                        sx={{ bgcolor: '#293D91', borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                        href={`/cars/${car.id}`}
                      >
                        View Details
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}