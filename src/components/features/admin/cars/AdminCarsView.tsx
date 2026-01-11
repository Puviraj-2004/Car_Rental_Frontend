'use client';

import React from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogActions, Chip, Grid, Card, CardMedia, CardContent,
  ToggleButtonGroup, ToggleButton, Stack, Avatar, Divider, alpha,
  LinearProgress, Autocomplete, TextField, MenuItem
} from '@mui/material';
import { 
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, 
  ViewList as ListIcon, ViewModule as GridIcon, 
  DirectionsCar as CarIcon, LocalParking as PlateIcon,
  Clear as ClearIcon, EvStation as FuelIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

export const AdminCarsView = ({
  cars, brands, models, enums, filters, setFilters, resetFilters,
  view, setView, onDeleteClick, onEditClick, onAddClick,
  deleteDialogOpen, setDeleteDialogOpen, confirmDelete, loading
}: any) => {

  const formatEnum = (text: string) => {
    if (!text) return '';
    return text.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Logic check for active filter state
  const hasActiveFilters = 
    filters.brandIds.length > 0 || 
    filters.modelIds.length > 0 || 
    filters.fuelTypes.length > 0 || 
    filters.statuses.length > 0;

  return (
    <Box sx={{ pb: 5 }}>
      {/* 🔝 HEADER SECTION */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        spacing={2} 
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={900} color="#0F172A">Fleet Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your catalog of <b>{cars.length}</b> professional vehicles
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', p: 0.5, borderRadius: 2, bgcolor: 'white' }}>
            <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small">
              <ToggleButton value="grid" sx={{ border: 'none', px: 2 }}><GridIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="list" sx={{ border: 'none', px: 2 }}><ListIcon fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
          </Paper>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={onAddClick}
            sx={{ 
              bgcolor: '#0F172A', 
              borderRadius: 2.5, 
              textTransform: 'none', 
              px: 3, 
              fontWeight: 700, 
              '&:hover': { bgcolor: '#1E293B' } 
            }}
          >
            Add Vehicle
          </Button>
        </Stack>
      </Stack>

      {/* 🔍 COMPACT SINGLE-SELECT FILTER BAR */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 4, 
          borderRadius: 4, 
          border: '1px solid #E2E8F0', 
          bgcolor: 'white'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Brand Selection */}
          <Grid item xs={12} sm={6} md={2.5}>
            <Autocomplete
              size="small"
              options={brands}
              getOptionLabel={(option: any) => option.name}
              value={brands.find((b: any) => filters.brandIds.includes(b.id)) || null}
              onChange={(_, newValue) => {
                setFilters({ ...filters, brandIds: newValue ? [newValue.id] : [], modelIds: [] });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Brand" placeholder="All Brands" />
              )}
            />
          </Grid>

          {/* Model Selection */}
          <Grid item xs={12} sm={6} md={2.5}>
            <Autocomplete
              size="small"
              disabled={filters.brandIds.length === 0}
              options={models}
              getOptionLabel={(option: any) => option.name}
              value={models.find((m: any) => filters.modelIds.includes(m.id)) || null}
              onChange={(_, newValue) => {
                setFilters({ ...filters, modelIds: newValue ? [newValue.id] : [] });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Model" placeholder="All Models" />
              )}
            />
          </Grid>

          {/* Fuel Type */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Fuel"
              value={filters.fuelTypes[0] || ''}
              onChange={(e) => setFilters({ ...filters, fuelTypes: e.target.value ? [e.target.value] : [] })}
            >
              <MenuItem value="">Any Fuel</MenuItem>
              {enums.fuelTypeEnum?.enumValues.map((f: any) => (
                <MenuItem key={f.name} value={f.name}>{formatEnum(f.name)}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Status Selection */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              value={filters.statuses[0] || ''}
              onChange={(e) => setFilters({ ...filters, statuses: e.target.value ? [e.target.value] : [] })}
            >
              <MenuItem value="">Any Status</MenuItem>
              {enums.carStatusEnum?.enumValues.map((s: any) => (
                <MenuItem key={s.name} value={s.name}>{formatEnum(s.name)}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Clear Filters */}
          <Grid item xs={12} md={2.5} sx={{ textAlign: 'right' }}>
            <Button 
              fullWidth
              startIcon={<ClearIcon />} 
              onClick={resetFilters} 
              disabled={!hasActiveFilters}
              sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none', py: 1 }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 3, borderRadius: 2, height: 2 }} />}

      {/* 📦 DATA RENDERING: GRID VIEW */}
      {view === 'grid' ? (
        <Grid container spacing={3}>
          {cars.map((car: any) => (
            <Grid item xs={12} sm={6} lg={4} key={car.id}>
              <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #E2E8F0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)' } }}>
                <Box sx={{ position: 'relative', height: 200, bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', p: 2 }}>
                  <CardMedia component="img" image={car.images?.[0]?.url || ''} sx={{ objectFit: 'contain', height: '100%' }} />
                  <Chip 
                    label={car.status} 
                    size="small" 
                    sx={{ position: 'absolute', top: 16, right: 16, fontWeight: 900, fontSize: '0.65rem', bgcolor: car.status === 'AVAILABLE' ? '#DCFCE7' : '#FEE2E2', color: car.status === 'AVAILABLE' ? '#166534' : '#991B1B' }} 
                  />
                </Box>
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Typography variant="caption" color="primary" fontWeight={800}>{car.brand.name}</Typography>
                  <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 1.5 }}>{car.model.name}</Typography>
                  <Stack direction="row" spacing={1} mb={3}>
                    <Chip label={car.plateNumber} size="small" variant="outlined" icon={<PlateIcon sx={{ fontSize: 14 }} />} sx={{ fontWeight: 600 }} />
                    <Chip label={car.fuelType} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                  </Stack>
                  <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" fontWeight={900}>€{car.pricePerDay}<Typography component="span" variant="caption" color="text.secondary">/day</Typography></Typography>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" onClick={() => onEditClick(car.id)} sx={{ border: '1px solid #E2E8F0' }}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => onDeleteClick(car)} sx={{ border: '1px solid', borderColor: alpha('#EF4444', 0.2), bgcolor: alpha('#EF4444', 0.02) }}><DeleteIcon fontSize="small" /></IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        /* 📦 DATA RENDERING: LIST VIEW */
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>VEHICLE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>SPECIFICATIONS</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>DAILY RATE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>STATUS</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#64748B' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cars.map((car: any) => (
                <TableRow key={car.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={car.images?.[0]?.url} variant="rounded" sx={{ width: 50, height: 35, bgcolor: '#F1F5F9', border: '1px solid #E2E8F0' }}><CarIcon /></Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={800} color="#0F172A">{car.brand.name} {car.model.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{car.plateNumber}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="#334155" fontWeight={500}>{car.year} • {car.fuelType} • {car.transmission}</Typography>
                  </TableCell>
                  <TableCell><Typography fontWeight={900} color="#0F172A">€{car.pricePerDay?.toFixed(2)}</Typography></TableCell>
                  <TableCell>
                    <Chip label={car.status} size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: car.status === 'AVAILABLE' ? '#ECFDF5' : '#FEF2F2', color: car.status === 'AVAILABLE' ? '#047857' : '#B91C1C' }} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small" onClick={() => onEditClick(car.id)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => onDeleteClick(car)}><DeleteIcon fontSize="small" /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 🗑️ DELETE CONFIRMATION */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 900, textAlign: 'center', pt: 3 }}>Remove Vehicle</DialogTitle>
        <Box sx={{ px: 4, pb: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">Are you sure you want to delete this vehicle? This will release all records associated with this car.</Typography>
        </Box>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ fontWeight: 700, color: '#64748B' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDelete} sx={{ fontWeight: 700, borderRadius: 2, px: 3, bgcolor: '#EF4444' }}>Yes, Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};