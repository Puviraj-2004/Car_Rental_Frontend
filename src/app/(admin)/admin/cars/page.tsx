'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogActions, Chip, CircularProgress,
  Alert, Grid, Card, CardMedia, CardContent,
  ToggleButtonGroup, ToggleButton, Stack, Avatar,
  Divider, alpha, Checkbox, FormControlLabel
} from '@mui/material';
import { 
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, 
  ViewList as ListIcon, ViewModule as GridIcon, 
  DirectionsCar as CarIcon, LocalParking as PlateIcon,
  Clear as ClearIcon, EvStation as FuelIcon
} from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';

import { 
  GET_CARS_QUERY, 
  GET_BRANDS_QUERY, 
  GET_MODELS_QUERY, 
  GET_CAR_ENUMS 
} from '@/lib/graphql/queries';
import { DELETE_CAR_MUTATION } from '@/lib/graphql/mutations';

export default function CarsPage() {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState({ id: '', name: '' });

  const [filters, setFilters] = useState({
    brandIds: [] as string[],
    modelIds: [] as string[],
    fuelTypes: [] as string[],
    transmissions: [] as string[],
    statuses: [] as string[],
    critAirRatings: [] as string[],
    includeOutOfService: true
  });

  // For model filtering - use first selected brand or empty
  const selectedBrandForModels = filters.brandIds.length > 0 ? filters.brandIds[0] : '';

  const { loading, error, data, refetch } = useQuery(GET_CARS_QUERY, {
    variables: {
      filter: {
        ...filters,
        includeOutOfService: true // Admin should see ALL cars including OUT_OF_SERVICE
      }
    },
    fetchPolicy: 'cache-and-network'
  });

  const { data: brandData } = useQuery(GET_BRANDS_QUERY);
  const { data: modelData } = useQuery(GET_MODELS_QUERY, {
    variables: { brandId: selectedBrandForModels },
    skip: !selectedBrandForModels,
  });

  const { data: enumData } = useQuery(GET_CAR_ENUMS);

  const [deleteCar] = useMutation(DELETE_CAR_MUTATION, {
    onCompleted: () => {
      setDeleteDialogOpen(false);
      refetch();
    },
  });

  const resetFilters = () => {
    setFilters({
      brandIds: [],
      modelIds: [],
      fuelTypes: [],
      transmissions: [],
      statuses: [],
      critAirRatings: [],
      includeOutOfService: true
    });
  };

  const formatEnum = (text: string) => {
    if (!text) return '';
    return text.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };


  return (
    <Box sx={{ pb: 5 }}>
      {/* Header & Filter Bar (இவை அப்படியே இருக்கலாம்) */}
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
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/admin/cars/add')} sx={{ bgcolor: '#293D91', borderRadius: 2.5, textTransform: 'none', px: 4, fontWeight: 700 }}>
            Add Vehicle
          </Button>
        </Stack>
      </Stack>

      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 4, border: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>Filters</Typography>
          <Button variant="text" startIcon={<ClearIcon />} onClick={resetFilters} size="small">
            Reset All
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Brands Filter */}
          <Grid item xs={12} md={6} lg={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>Brands</Typography>
            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
              {brandData?.brands.map((brand: any) => (
                <FormControlLabel
                  key={brand.id}
                  control={
                    <Checkbox
                      size="small"
                      checked={filters.brandIds.includes(brand.id)}
                      onChange={(e) => {
                        const newBrandIds = e.target.checked
                          ? [...filters.brandIds, brand.id]
                          : filters.brandIds.filter(id => id !== brand.id);
                        setFilters({ ...filters, brandIds: newBrandIds, modelIds: [] });
                      }}
                    />
                  }
                  label={<Typography variant="body2">{brand.name}</Typography>}
                />
              ))}
            </Box>
          </Grid>

          {/* Models Filter */}
          <Grid item xs={12} md={6} lg={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>Models</Typography>
            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
              {modelData?.models.map((model: any) => (
                  <FormControlLabel
                    key={model.id}
                    control={
                      <Checkbox
                        size="small"
                        checked={filters.modelIds.includes(model.id)}
                        onChange={(e) => {
                          const newModelIds = e.target.checked
                            ? [...filters.modelIds, model.id]
                            : filters.modelIds.filter(id => id !== model.id);
                          setFilters({ ...filters, modelIds: newModelIds });
                        }}
                      />
                    }
                    label={<Typography variant="body2">{model.name}</Typography>}
                  />
                ))}
            </Box>
          </Grid>

          {/* Fuel Types Filter */}
          <Grid item xs={12} md={6} lg={2}>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>Fuel Type</Typography>
            <Box>
              {enumData?.fuelTypeEnum?.enumValues.map((fuel: any) => (
                <FormControlLabel
                  key={fuel.name}
                  control={
                    <Checkbox
                      size="small"
                      checked={filters.fuelTypes.includes(fuel.name)}
                      onChange={(e) => {
                        const newFuelTypes = e.target.checked
                          ? [...filters.fuelTypes, fuel.name]
                          : filters.fuelTypes.filter(type => type !== fuel.name);
                        setFilters({ ...filters, fuelTypes: newFuelTypes });
                      }}
                    />
                  }
                  label={<Typography variant="body2">{formatEnum(fuel.name)}</Typography>}
                />
              ))}
            </Box>
          </Grid>

          {/* Transmission Filter */}
          <Grid item xs={12} md={6} lg={2}>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>Transmission</Typography>
            <Box>
              {enumData?.transmissionEnum?.enumValues.map((trans: any) => (
                <FormControlLabel
                  key={trans.name}
                  control={
                    <Checkbox
                      size="small"
                      checked={filters.transmissions.includes(trans.name)}
                      onChange={(e) => {
                        const newTransmissions = e.target.checked
                          ? [...filters.transmissions, trans.name]
                          : filters.transmissions.filter(type => type !== trans.name);
                        setFilters({ ...filters, transmissions: newTransmissions });
                      }}
                    />
                  }
                  label={<Typography variant="body2">{formatEnum(trans.name)}</Typography>}
                />
              ))}
            </Box>
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} md={6} lg={2}>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>Status</Typography>
            <Box>
              {enumData?.carStatusEnum?.enumValues.map((status: any) => (
                <FormControlLabel
                  key={status.name}
                  control={
                    <Checkbox
                      size="small"
                      checked={filters.statuses.includes(status.name)}
                      onChange={(e) => {
                        const newStatuses = e.target.checked
                          ? [...filters.statuses, status.name]
                          : filters.statuses.filter(s => s !== status.name);
                        setFilters({ ...filters, statuses: newStatuses });
                      }}
                    />
                  }
                  label={<Typography variant="body2">{formatEnum(status.name)}</Typography>}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* --- GRID VIEW --- */}
      {view === 'grid' && (
        <Grid container spacing={3}>
          {data?.cars.map((car: any) => (
            <Grid item xs={12} sm={6} lg={4} key={car.id}>
              <Card sx={{ borderRadius: 4, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img" height="190"
                    // ✅ மாற்றப்பட்டது: API_BASE_URL நீக்கப்பட்டது
                    image={car.images?.length > 0 ? (car.images.find((i: any) => i.isPrimary)?.url || car.images[0].url) : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIiBmaWxsPSIjYWFhYWFhIiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
                    sx={{ bgcolor: '#F8FAFC', objectFit: 'cover' }}
                  />
                  <Chip label={car.status} size="small" sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 800, bgcolor: car.status === 'AVAILABLE' ? '#DCFCE7' : '#FEE2E2', color: car.status === 'AVAILABLE' ? '#166534' : '#991B1B' }} />
                </Box>
                <CardContent>
                  <Typography variant="h6" fontWeight={800}>{car.brand.name} {car.model.name}</Typography>
                  <Stack direction="row" spacing={1} mt={1} mb={2}>
                    <Chip label={car.plateNumber} size="small" variant="outlined" icon={<PlateIcon sx={{ fontSize: '14px' }} />} />
                    <Chip label={car.fuelType} size="small" variant="outlined" icon={<FuelIcon sx={{ fontSize: '14px' }} />} />
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" fontWeight={900} color="#293D91">€{car.pricePerDay?.toFixed(2)}<Typography component="span" variant="caption">/day</Typography></Typography>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          console.log('Navigating to edit car:', car.id);
                          router.push(`/admin/cars/${car.id}`);
                        }}
                        sx={{ bgcolor: '#F1F5F9' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
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
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #E2E8F0' }}>
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
                      {/* ✅ மாற்றப்பட்டது: API_BASE_URL நீக்கப்பட்டது */}
                      <Avatar 
                        src={car.images?.length > 0 ? (car.images.find((i: any) => i.isPrimary)?.url || car.images[0].url) : ''} 
                        variant="rounded" 
                        sx={{ width: 60, height: 45, borderRadius: 2 }}
                      ><CarIcon /></Avatar>
                      <Box>
                        <Typography fontWeight={800}>{car.brand.name} {car.model.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{car.plateNumber}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{car.year} • {car.fuelType} • {formatEnum(car.critAirRating)}</TableCell>
                  <TableCell><Typography fontWeight={900} color="#293D91">€{car.pricePerDay?.toFixed(2)}</Typography></TableCell>
                  <TableCell><Chip label={car.status} size="small" sx={{ fontWeight: 800, bgcolor: car.status === 'AVAILABLE' ? '#DCFCE7' : '#FEE2E2', color: car.status === 'AVAILABLE' ? '#166534' : '#991B1B' }} /></TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => {
                        console.log('Navigating to edit car:', car.id);
                        router.push(`/admin/cars/${car.id}`);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => { setSelectedCar({ id: car.id, name: car.model.name }); setDeleteDialogOpen(true); }}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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