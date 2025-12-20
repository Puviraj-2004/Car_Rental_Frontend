'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CARS_QUERY } from '@/lib/graphql/queries';
import { DELETE_CAR_MUTATION } from '@/lib/graphql/mutations';

export default function CarsPage() {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [selectedCarName, setSelectedCarName] = useState('');

  const { loading, error, data, refetch } = useQuery(GET_CARS_QUERY);
  const [deleteCar] = useMutation(DELETE_CAR_MUTATION, {
    onCompleted: () => {
      setDeleteDialogOpen(false);
      refetch();
    },
    onError: (err) => {
      console.error('Error deleting car:', err);
    },
  });

  const handleDeleteClick = (carId: string, carName: string) => {
    setSelectedCarId(carId);
    setSelectedCarName(carName);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedCarId) {
      try {
        await deleteCar({
          variables: { id: selectedCarId },
        });
      } catch (err) {
        console.error('Error:', err);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
            Cars Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all vehicles in your rental fleet
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/admin/cars/add')}
          sx={{
            backgroundColor: '#293D91',
            textTransform: 'none',
            '&:hover': { backgroundColor: '#1E293B' },
          }}
        >
          Add New Car
        </Button>
      </Box>

      {/* Loading State */}
      {loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Paper>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'Failed to load cars'}
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !error && (!data?.cars || data.cars.length === 0) && (
        <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
          <Typography>No cars added yet. Click "Add New Car" to get started.</Typography>
        </Paper>
      )}

      {/* Cars Table */}
      {!loading && data?.cars && data.cars.length > 0 && (
        <TableContainer component={Paper} sx={{ border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, color: '#1E293B' }}>Brand / Model</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1E293B' }}>Year</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1E293B' }}>Plate</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1E293B' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1E293B' }} align="right">
                  Price/Day
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1E293B' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1E293B' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.cars.map((car: any) => (
                <TableRow key={car.id} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>
                      {car.brand} {car.model}
                    </Typography>
                  </TableCell>
                  <TableCell>{car.year}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{car.plateNumber}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{car.fuelType}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: 600 }}>€{car.pricePerDay.toFixed(2)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={car.availability ? 'Available' : 'Unavailable'}
                      color={car.availability ? 'success' : 'error'}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => router.push(`/admin/cars/${car.id}`)}
                      title="View Details"
                      sx={{ color: '#293D91' }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => router.push(`/admin/cars/${car.id}/edit`)}
                      title="Edit"
                      sx={{ color: '#F59E0B' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(car.id, `${car.brand} ${car.model}`)}
                      title="Delete"
                      sx={{ color: '#EF4444' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Car</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete {selectedCarName}? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
