'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Chip, CircularProgress,
  Alert, Grid, Card, CardMedia, CardContent, CardActions,
  ToggleButtonGroup, ToggleButton, Stack, Avatar
} from '@mui/material';
import { 
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, 
  ViewList as ListIcon, ViewModule as GridIcon, 
  DirectionsCar as CarIcon, LocalParking as PlateIcon 
} from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CARS_QUERY } from '@/lib/graphql/queries';
import { DELETE_CAR_MUTATION } from '@/lib/graphql/mutations';

export default function CarsPage() {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState({ id: '', name: '' });

  const { loading, error, data, refetch } = useQuery(GET_CARS_QUERY);
  const [deleteCar] = useMutation(DELETE_CAR_MUTATION, {
    onCompleted: () => {
      setDeleteDialogOpen(false);
      refetch();
    },
  });

  const BACKEND_URL ='http://localhost:4000';

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, nextView: 'list' | 'grid') => {
    if (nextView !== null) setView(nextView);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      {/* Top Header Section */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>Fleet Management</Typography>
          <Typography variant="body2" color="text.secondary">Total {data?.cars?.length || 0} vehicles in your catalog</Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <ToggleButtonGroup value={view} exclusive onChange={handleViewChange} size="small" sx={{ bgcolor: '#fff' }}>
            <ToggleButton value="list"><ListIcon /></ToggleButton>
            <ToggleButton value="grid"><GridIcon /></ToggleButton>
          </ToggleButtonGroup>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/admin/cars/add')}
            sx={{ bgcolor: '#293D91', borderRadius: 2, textTransform: 'none', px: 3 }}
          >
            Add Vehicle
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error.message}</Alert>}

      {/* --- GRID VIEW --- */}
      {view === 'grid' && (
        <Grid container spacing={3}>
          {data?.cars.map((car: any) => (
            <Grid item xs={12} sm={6} md={4} key={car.id}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={car.images && car.images.length > 0 
                    ? `${BACKEND_URL}${car.images[0].imagePath}` // முழுமையான URL
                    : '/placeholder-car.png'}
                  alt={car.model}
                />
                  <Chip
                    label={car.availability ? 'Available' : 'Booked'}
                    color={car.availability ? 'success' : 'error'}
                    sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 700, backdropFilter: 'blur(4px)' }}
                  />
                </Box>
                <CardContent sx={{ pb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{car.brand} {car.model}</Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1, color: 'text.secondary' }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <PlateIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{car.plateNumber}</Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>• {car.fuelType}</Typography>
                  </Stack>
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 800, mt: 2 }}>
                    €{car.pricePerDay} <Typography component="span" variant="caption" color="text.secondary">/ day</Typography>
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                  <Button size="small" variant="outlined" onClick={() => router.push(`/admin/cars/${car.id}/edit`)}>Edit</Button>
                  <IconButton color="error" size="small" onClick={() => { setSelectedCar({ id: car.id, name: car.model }); setDeleteDialogOpen(true); }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* --- LIST VIEW --- */}
      {view === 'list' && (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Vehicle</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Daily Rate</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.cars.map((car: any) => (
                <TableRow key={car.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={car.images?.[0]?.imagePath} variant="rounded" sx={{ width: 60, height: 45, bgcolor: '#f1f5f9' }}>
                        <CarIcon />
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{car.brand} {car.model}</Typography>
                        <Typography variant="caption" color="text.secondary">{car.plateNumber}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{car.year} • {car.fuelType} • {car.transmission}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 800, color: '#293D91' }}>€{car.pricePerDay}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={car.availability ? 'Live' : 'Maintenance'} size="small" color={car.availability ? 'success' : 'warning'} sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" sx={{ mr: 1, color: '#64748B' }} onClick={() => router.push(`/admin/cars/${car.id}/edit`)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => { setSelectedCar({ id: car.id, name: car.model }); setDeleteDialogOpen(true); }}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">Are you sure you want to remove <b>{selectedCar.name}</b> from the fleet? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#64748B' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => deleteCar({ variables: { id: selectedCar.id } })}>Delete Car</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}