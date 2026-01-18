'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Box, Container, Grid, Typography, Card, Button, Chip, Stack,
  Divider, Checkbox, FormControlLabel, FormGroup, 
  IconButton, Snackbar, Alert, TextField,
  MenuItem, Select, FormControl, Drawer, Paper
} from '@mui/material';
import {
  Settings as SettingsIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { FilterPanel } from './FilterPanel';

export const CarsView = ({
  mainFilter, onDateChange, onTimeChange, TIME_SLOTS,
  secondaryFilter, onCheckboxChange, brands, enums,
  loading, cars, isValidSelection, hasDates, onBookClick,
  alert, onAlertClose, topBarRef, validationError
}: any) => {

  // Memoized handlers to prevent unnecessary re-renders
  const handleDateChange = useCallback((field: string, value: string) => {
    onDateChange(field, value);
  }, [onDateChange]);

  const handleTimeChange = useCallback((field: string, value: string) => {
    onTimeChange(field, value);
  }, [onTimeChange]);

  const handleCheckboxChange = useCallback((key: string, value: string) => {
    onCheckboxChange(key, value);
  }, [onCheckboxChange]);

  // Drawer state for mobile filters
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 8 }}>
      
      {/* Date Selection Bar (Sticky) */}
      <Paper ref={topBarRef} elevation={0} sx={{ position: 'fixed', top: { xs: 56, sm: 64, md: 80 }, left: 0, right: 0, zIndex: 99, py: { xs: 1, md: 1.5 }, borderBottom: '1px solid #E2E8F0', bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2 } }}>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={10} lg={9}>
              <Box
                sx={{
                  overflowX: { xs: 'auto', md: 'visible' },
                  width: '100%',
                  pb: { xs: 0.5, md: 0 },
                  '::-webkit-scrollbar': { display: 'none' },
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'row', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    p: { xs: 1, md: 1.5 },
                    border: '1px solid #E2E8F0',
                    borderRadius: 3,
                    bgcolor: 'white',
                    borderColor: isValidSelection ? '#7C3AED' : 'transparent',
                    gap: { xs: 1, md: 2 },
                    boxShadow: 'none',
                    minHeight: { xs: 0, md: 0 },
                    minWidth: { xs: 600, md: 'unset' },
                  }}
                >
                <Box sx={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mb: 0.25, fontSize: { xs: 13, md: 15 }, display: 'flex', alignItems: 'center', gap: 0.5 }}><CalendarTodayIcon fontSize="small" /> Pickup</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <TextField fullWidth type="date" value={mainFilter.startDate} onChange={(e) => handleDateChange('startDate', e.target.value)}
                      inputProps={{ min: new Date().toISOString().split('T')[0] }}
                      InputProps={{ sx: { fontWeight: 600, fontSize: { xs: 13, md: 15 }, py: 0.5 } }}
                      variant="outlined"
                      size="small"
                    />
                    <FormControl variant="outlined" sx={{ minWidth: { xs: 80, md: 110 } }} size="small">
                      <Select value={mainFilter.startTime} onChange={(e) => handleTimeChange('startTime', e.target.value)} displayEmpty sx={{ fontWeight: 600, fontSize: { xs: 13, md: 15 } }}>
                        <MenuItem value="" disabled>Time</MenuItem>
                        {TIME_SLOTS.map((t: string) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, mx: 1.5 }} />
                <Box sx={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mb: 0.25, fontSize: { xs: 13, md: 15 }, display: 'flex', alignItems: 'center', gap: 0.5 }}>Return</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <TextField
                      fullWidth
                      type="date"
                      value={mainFilter.endDate}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      inputProps={{ min: mainFilter.startDate || new Date().toISOString().split('T')[0] }}
                      InputProps={{ sx: { fontWeight: 600, fontSize: { xs: 13, md: 15 }, py: 0.5 } }}
                      variant="outlined"
                      size="small"
                      disabled={!mainFilter.startDate || !mainFilter.startTime}
                    />
                    <FormControl variant="outlined" sx={{ minWidth: { xs: 80, md: 110 } }} size="small" disabled={!mainFilter.startDate || !mainFilter.startTime || !mainFilter.endDate}>
                      <Select
                        value={mainFilter.endTime}
                        onChange={(e) => handleTimeChange('endTime', e.target.value)}
                        displayEmpty
                        sx={{ fontWeight: 600, fontSize: { xs: 13, md: 15 } }}
                      >
                         <MenuItem value="" disabled>Time</MenuItem>
                        {TIME_SLOTS.map((t: string) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                </Paper>
              </Box>
              {/* Validation Alert below date filters */}
              {!!validationError && (
                <Box sx={{ mt: 2, width: '100%' }}>
                  <Alert severity="warning" variant="filled" sx={{ minWidth: 220, fontWeight: 600 }}>
                    {validationError}
                  </Alert>
                </Box>
              )}
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Mobile Filters Button */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SettingsIcon />}
          sx={{ borderRadius: '50px', boxShadow: 4, px: 3, py: 1.5, fontWeight: 700 }}
          onClick={() => setDrawerOpen(true)}
        >
          Filters
        </Button>
      </Box>

      {/* Mobile Drawer for Filters */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: '85vw', maxWidth: 340, p: 2, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 } }}
        ModalProps={{ keepMounted: true }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={800}>Filters</Typography>
          <IconButton onClick={() => setDrawerOpen(false)}><ArrowForwardIcon /></IconButton>
        </Box>
        <FilterPanel 
          brands={brands} 
          enums={enums} 
          secondaryFilter={secondaryFilter} 
          onCheckboxChange={handleCheckboxChange}
        />
      </Drawer>

      <Container maxWidth="xl" sx={{ mt: { xs: 30, md: 24 } }}>
        <Grid container spacing={4}>
          <Grid item md={3} sx={{ display: { xs: 'none', md: 'block' } }}><Paper sx={{ p: 3, position: 'sticky', top: 180, borderRadius: 4, border: '1px solid #E2E8F0' }}><FilterPanel brands={brands} enums={enums} secondaryFilter={secondaryFilter} onCheckboxChange={handleCheckboxChange} /></Paper></Grid>
          <Grid item xs={12} md={9}>
            <Typography variant="h5" fontWeight={800} color="#0F172A" mb={3}>{loading ? 'Updating fleet...' : `${cars.length} Vehicles Found`}</Typography>
            <Grid container spacing={3}>
              {cars.map((car: any) => (
                <Grid item xs={12} sm={6} lg={4} key={car.id}>
                  <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4, border: '1px solid #E2E8F0', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 4, borderColor: '#7C3AED' } }}>
                    <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between' }}><Box><Typography variant="overline" color="text.secondary" fontWeight={700}>{car.brand.name}</Typography><Typography variant="h6" fontWeight={800}>{car.model.name}</Typography></Box></Box>
                    <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <Image 
                        src={car.images?.[0]?.url || '/placeholder.jpg'} 
                        alt="car" 
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={cars.indexOf(car) === 0}
                        loading={cars.indexOf(car) === 0 ? 'eager' : 'lazy'}
                      />
                    </Box>
                    <Box sx={{ p: 2.5, flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} mb={3}><Chip size="small" label={car.transmission} /><Chip size="small" label={car.fuelType} /><Chip size="small" label={car.seats} /></Stack>
                      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                      <Box display="flex" alignItems="center" justifyContent="space-between"><Box><Typography variant="h6" fontWeight={800}>€{car.pricePerDay}</Typography><Typography variant="caption">/ day</Typography></Box>
                      <Button size="small" variant="contained" onClick={() => onBookClick(car)} sx={{ bgcolor: isValidSelection ? '#7C3AED' : '#94A3B8' }}>Book Now</Button></Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <Snackbar open={alert.open} autoHideDuration={4000} onClose={onAlertClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert severity={alert.severity} variant="filled">{alert.message}</Alert></Snackbar>
    </Box>
  );
};