'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Chip, CircularProgress,
  Alert, Grid, Card, CardMedia, CardContent, CardActions,
  ToggleButtonGroup, ToggleButton, Stack, Avatar, TextField, MenuItem,
  Divider, alpha
} from '@mui/material';
import { 
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, 
  ViewList as ListIcon, ViewModule as GridIcon, 
  DirectionsCar as CarIcon, LocalParking as PlateIcon,
  Clear as ClearIcon, EvStation as FuelIcon,
  SettingsInputComponent as GearIcon
} from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CARS_QUERY, GET_BRANDS_QUERY, GET_MODELS_QUERY } from '@/lib/graphql/queries';
import { DELETE_CAR_MUTATION } from '@/lib/graphql/mutations';

export default function CarsPage() {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState({ id: '', name: '' });

  // --- Filter States (Corrected for Enums) ---
  const [filters, setFilters] = useState({
    brandId: '',
    modelId: '',
    fuelType: undefined as string | undefined,
    transmission: undefined as string | undefined,
    status: undefined as string | undefined,
    critAirRating: undefined as string | undefined
  });

  const { loading, error, data, refetch } = useQuery(GET_CARS_QUERY, {
    variables: { filter: filters },
    fetchPolicy: 'cache-and-network'
  });

  const { data: brandData } = useQuery(GET_BRANDS_QUERY);
  const { data: modelData } = useQuery(GET_MODELS_QUERY, {
    variables: { brandId: filters.brandId },
    skip: !filters.brandId,
  });

  const [deleteCar] = useMutation(DELETE_CAR_MUTATION, {
    onCompleted: () => {
      setDeleteDialogOpen(false);
      refetch();
    },
  });

  const BACKEND_URL = 'http://localhost:4000';

  const resetFilters = () => {
    setFilters({ 
      brandId: '', 
      modelId: '', 
      fuelType: undefined, 
      transmission: undefined, 
      status: undefined,
      critAirRating: undefined 
    });
  };

  if (loading && !data) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress thickness={5} size={50} sx={{ color: '#293D91' }} />
    </Box>
  );

  return (
    <Box sx={{ pb: 5 }}>
      {/* Header Area */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1E293B' }}>Fleet Management</Typography>
          <Typography variant="body1" sx={{ color: '#64748B' }}>Total {data?.cars?.length || 0} vehicles tracked</Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', p: 0.5, borderRadius: 2 }}>
            <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small">
              <ToggleButton value="grid" sx={{ border: 'none' }}><GridIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="list" sx={{ border: 'none' }}><ListIcon fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
          </Paper>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/admin/cars/add')}
            sx={{ bgcolor: '#293D91', borderRadius: 2.5, textTransform: 'none', px: 4, fontWeight: 700 }}
          >
            Add Vehicle
          </Button>
        </Stack>
      </Stack>

      {/* 🔍 Corrected Filter Bar */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 4, border: '1px solid #E2E8F0' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField select fullWidth size="small" label="Brand" value={filters.brandId} onChange={(e) => setFilters({ ...filters, brandId: e.target.value, modelId: '' })}>
              <MenuItem value="">All Brands</MenuItem>
              {brandData?.brands.map((b: any) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField select fullWidth size="small" label="Model" value={filters.modelId} disabled={!filters.brandId} onChange={(e) => setFilters({ ...filters, modelId: e.target.value })}>
              <MenuItem value="">All Models</MenuItem>
              {modelData?.models.map((m: any) => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select fullWidth size="small" label="Fuel"
              value={filters.fuelType || ''}
              onChange={(e) => setFilters({ ...filters, fuelType: e.target.value === '' ? undefined : e.target.value })}
            >
              <MenuItem value="">All Fuels</MenuItem>
              <MenuItem value="PETROL">Petrol</MenuItem>
              <MenuItem value="DIESEL">Diesel</MenuItem>
              <MenuItem value="ELECTRIC">Electric</MenuItem>
              <MenuItem value="HYBRID">Hybrid</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select fullWidth size="small" label="Status"
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="AVAILABLE">Available</MenuItem>
              <MenuItem value="BOOKED">Booked</MenuItem>
              <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select fullWidth size="small" label="CritAir Rating"
              value={filters.critAirRating || ''}
              onChange={(e) => setFilters({ ...filters, critAirRating: e.target.value || undefined })}
            >
              <MenuItem value="">All Ratings</MenuItem>
              <MenuItem value="CRIT_AIR_0">Crit'Air 0</MenuItem>
              <MenuItem value="CRIT_AIR_1">Crit'Air 1</MenuItem>
              <MenuItem value="CRIT_AIR_2">Crit'Air 2</MenuItem>
              <MenuItem value="CRIT_AIR_3">Crit'Air 3</MenuItem>
              <MenuItem value="CRIT_AIR_4">Crit'Air 4</MenuItem>
              <MenuItem value="CRIT_AIR_5">Crit'Air 5</MenuItem>
              <MenuItem value="CRIT_AIR_6">Crit'Air 6</MenuItem>
              <MenuItem value="NO_STICKER">No Sticker</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={2.4}>
            <Button fullWidth variant="text" startIcon={<ClearIcon />} onClick={resetFilters} sx={{ color: '#64748B', textTransform: 'none' }}>
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error.message}</Alert>}

      {/* --- GRID VIEW --- */}
      {view === 'grid' && (
        <Grid container spacing={3}>
          {data?.cars.map((car: any) => (
            <Grid item xs={12} sm={6} lg={4} key={car.id}>
              <Card sx={{ borderRadius: 4, border: '1px solid #E2E8F0', boxShadow: 'none', '&:hover': { boxShadow: '0 10px 20px rgba(0,0,0,0.05)' } }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img" height="190"
                    image={car.images?.length > 0 ? `${BACKEND_URL}${car.images.find((i: any) => i.isPrimary)?.imagePath || car.images[0].imagePath}` : '/placeholder.png'}
                    sx={{ bgcolor: '#F8FAFC' }}
                  />
                  <Chip 
                    label={car.status} 
                    size="small" 
                    sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 800, bgcolor: car.status === 'AVAILABLE' ? '#DCFCE7' : car.status === 'BOOKED' ? '#FEE2E2' : '#FDE68A', color: car.status === 'AVAILABLE' ? '#166534' : car.status === 'BOOKED' ? '#991B1B' : '#92400E' }} 
                  />
                </Box>
                <CardContent>
                  <Typography variant="h6" fontWeight={800}>{car.brand.name} {car.model.name}</Typography>
                  <Stack direction="row" spacing={1} mt={1} mb={2}>
                    <Chip label={car.plateNumber} size="small" variant="outlined" icon={<PlateIcon sx={{ fontSize: '14px !important' }} />} />
                    <Chip label={car.fuelType} size="small" variant="outlined" icon={<FuelIcon sx={{ fontSize: '14px !important' }} />} />
                    <Chip label={car.critAirRating === 'NO_STICKER' ? 'No Sticker' : car.critAirRating.replace('CRIT_AIR_', 'Crit\'Air ')} size="small" variant="outlined" icon={<CarIcon sx={{ fontSize: '14px !important' }} />} />
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" fontWeight={900} color="#293D91">€{car.pricePerDay}<Typography component="span" variant="caption">/day</Typography></Typography>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" onClick={() => router.push(`/admin/cars/${car.id}/edit`)} sx={{ bgcolor: '#F1F5F9' }}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => { setSelectedCar({ id: car.id, name: car.model.name }); setDeleteDialogOpen(true); }} sx={{ bgcolor: alpha('#EF4444', 0.1) }}><DeleteIcon fontSize="small" /></IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* --- LIST VIEW --- */}
      {view === 'list' && (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Vehicle</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Details</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Daily Rate</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.cars.map((car: any) => (
                <TableRow key={car.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={`${BACKEND_URL}${car.images?.[0]?.imagePath}`} variant="rounded" sx={{ width: 60, height: 45, borderRadius: 2 }}><CarIcon /></Avatar>
                      <Box>
                        <Typography fontWeight={800}>{car.brand.name} {car.model.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{car.plateNumber}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{car.year} • {car.fuelType} • {car.critAirRating === 'NO_STICKER' ? 'No Sticker' : car.critAirRating.replace('CRIT_AIR_', 'Crit\'Air ')}</TableCell>
                  <TableCell><Typography fontWeight={900} color="#293D91">€{car.pricePerDay}</Typography></TableCell>
                  <TableCell><Chip label={car.status} size="small" sx={{ fontWeight: 800, bgcolor: car.status === 'AVAILABLE' ? '#DCFCE7' : car.status === 'BOOKED' ? '#FEE2E2' : '#FDE68A', color: car.status === 'AVAILABLE' ? '#166534' : car.status === 'BOOKED' ? '#991B1B' : '#92400E' }} /></TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => router.push(`/admin/cars/${car.id}/edit`)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => { setSelectedCar({ id: car.id, name: car.model.name }); setDeleteDialogOpen(true); }}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>Remove Vehicle?</DialogTitle>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => deleteCar({ variables: { id: selectedCar.id } })}>Yes, Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}