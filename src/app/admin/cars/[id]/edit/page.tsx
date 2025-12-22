'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Grid, Typography, Paper, Switch, FormControlLabel,
  IconButton, Stack, Tab, Tabs, Snackbar, Alert, ImageList, ImageListItem
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon, DirectionsCar as CarIcon, 
  Euro as PriceIcon, PhotoCamera as PhotoIcon, Save as SaveIcon,
  ArrowForward as NextIcon, Close as CloseIcon, Delete as DeleteIcon
} from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client';

// GraphQL & Data
import { UPDATE_CAR_MUTATION, UPLOAD_CAR_IMAGES_MUTATION, DELETE_CAR_IMAGE_MUTATION } from '@/lib/graphql/mutations';
import { GET_CAR_QUERY, GET_CAR_ENUMS, GET_CARS_QUERY } from '@/lib/graphql/queries';
import { CAR_BRANDS } from '@/lib/carData';

export default function EditCarPage() {
  const router = useRouter();
  const { id: carId } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, msg: '', severity: 'success' as 'success' | 'error' | 'warning' });
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // 1. Fetching Data
  const { data: carData, loading: carLoading } = useQuery(GET_CAR_QUERY, { variables: { id: carId }, fetchPolicy: 'network-only' });
  const { data: enumData } = useQuery(GET_CAR_ENUMS);

  const [formData, setFormData] = useState<any>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);

  useEffect(() => {
    if (carData?.car) {
      const { __typename, images, bookings, createdAt, updatedAt, ...rest } = carData.car;
      setFormData(rest);
      setExistingImages(images || []);
      
      const brandObj = CAR_BRANDS.find(b => b.label === rest.brand);
      setAvailableModels(brandObj ? brandObj.models : []);
    }
  }, [carData]);

  // 2. Mutations
  const [updateCar] = useMutation(UPDATE_CAR_MUTATION, {
    refetchQueries: [{ query: GET_CARS_QUERY }],
  });
  const [uploadCarImages] = useMutation(UPLOAD_CAR_IMAGES_MUTATION);
  const [deleteCarImage] = useMutation(DELETE_CAR_IMAGE_MUTATION);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === 'brand') {
      const brandObj = CAR_BRANDS.find(b => b.label === value);
      setAvailableModels(brandObj ? brandObj.models : []);
      setFormData((prev: any) => ({ ...prev, brand: value, model: '' }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: ['year', 'seats', 'doors', 'pricePerHour', 'pricePerKm', 'pricePerDay'].includes(name) ? Number(value) : value
      }));
    }
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    if (window.confirm('Delete this image?')) {
      try {
        await deleteCarImage({ variables: { imageId } });
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
      } catch (err: any) { setAlert({ open: true, msg: err.message, severity: 'error' }); }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { id, ...input } = formData;
      await updateCar({ variables: { id: carId, input } });
      
      if (selectedImages.length > 0) {
        await uploadCarImages({ variables: { input: { carId, images: selectedImages, primaryIndex: existingImages.length === 0 ? 0 : -1 } } });
      }
      setAlert({ open: true, msg: 'Car updated successfully!', severity: 'success' });
      setTimeout(() => router.push('/admin/cars'), 1500);
    } catch (err: any) { setAlert({ open: true, msg: err.message, severity: 'error' }); }
    setLoading(false);
  };

  if (carLoading || !formData) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 900, margin: 'auto', height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Tab Switcher */}
      <Paper elevation={0} sx={{ borderRadius: 3, mb: 1.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
          <Tab icon={<CarIcon />} label="Identity" sx={{ fontWeight: 700, minHeight: 65 }} />
          <Tab icon={<PriceIcon />} label="Pricing" sx={{ fontWeight: 700, minHeight: 65 }} />
          <Tab icon={<PhotoIcon />} label="Media" sx={{ fontWeight: 700, minHeight: 65 }} />
        </Tabs>
      </Paper>

      {/* Frame Container */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        
        {/* FRAME 1: Identity - Year Field சேர்க்கப்பட்டுள்ளது */}
        {activeTab === 0 && (
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid #E2E8F0' }}>
            <Grid container spacing={1.5}>
              {/* 1. Brand Selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Brand</InputLabel>
                  <Select name="brand" value={formData.brand} onChange={handleInputChange} label="Brand">
                    {CAR_BRANDS.map(b => <MenuItem key={b.label} value={b.label}>{b.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              {/* 2. Model Selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" disabled={!formData.brand}>
                  <InputLabel>Model</InputLabel>
                  <Select name="model" value={formData.model} onChange={handleInputChange} label="Model">
                    {availableModels.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              {/* 3. Year Field (இதுதான் நீங்கள் கேட்டது) */}
              <Grid item xs={6}>
                <TextField 
                  fullWidth 
                  size="small" 
                  label="Year" 
                  name="year" 
                  type="number" 
                  value={formData.year} 
                  onChange={handleInputChange} 
                />
              </Grid>

              {/* 4. Plate Number */}
              <Grid item xs={6}>
                <TextField 
                  fullWidth 
                  size="small" 
                  label="Plate Number" 
                  name="plateNumber" 
                  value={formData.plateNumber} 
                  onChange={handleInputChange} 
                />
              </Grid>

              {/* 5. Fuel Type */}
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Fuel</InputLabel>
                  <Select name="fuelType" value={formData.fuelType} onChange={handleInputChange} label="Fuel">
                    {enumData?.fuelTypeEnum?.enumValues.map((e: any) => (
                      <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* 6. Transmission Type */}
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Transmission</InputLabel>
                  <Select name="transmission" value={formData.transmission} onChange={handleInputChange} label="Transmission">
                    {enumData?.transmissionEnum?.enumValues.map((e: any) => (
                      <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* FRAME 2: Pricing */}
        {activeTab === 1 && (
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
            <Grid container spacing={2}>
              <Grid item xs={4}><TextField fullWidth size="small" label="Price/Hr" name="pricePerHour" type="number" value={formData.pricePerHour} onChange={handleInputChange} /></Grid>
              <Grid item xs={4}><TextField fullWidth size="small" label="Price/Day" name="pricePerDay" type="number" value={formData.pricePerDay} onChange={handleInputChange} /></Grid>
              <Grid item xs={4}><TextField fullWidth size="small" label="Price/Km" name="pricePerKm" type="number" value={formData.pricePerKm} onChange={handleInputChange} /></Grid>
              <Grid item xs={12}><FormControlLabel control={<Switch checked={formData.availability} onChange={(e) => setFormData({...formData, availability: e.target.checked})} />} label="Available" /></Grid>
            </Grid>
          </Paper>
        )}

        {/* FRAME 3: Media & Desc */}
        {activeTab === 2 && (
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>GALLERY</Typography>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {existingImages.map((img) => (
                  <Grid item xs={3} key={img.id}>
                    <Box sx={{ position: 'relative', height: 80, borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
                      <img src={`http://localhost:4000${img.imagePath}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <IconButton onClick={() => handleRemoveExistingImage(img.id)} size="small" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,0,0,0.7)', color: 'white' }}>
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <TextField fullWidth multiline rows={2} label="Description (EN)" name="descriptionEn" value={formData.descriptionEn} onChange={handleInputChange} sx={{ mb: 1 }} />
              <TextField fullWidth multiline rows={2} label="Description (FR)" name="descriptionFr" value={formData.descriptionFr} onChange={handleInputChange} />
            </Box>
          </Paper>
        )}
      </Box>

      {/* Alert */}
      <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={alert.severity} variant="filled">{alert.msg}</Alert>
      </Snackbar>

      {/* Footer Nav */}
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}>
        <Button variant="outlined" onClick={() => router.push('/admin/cars')} startIcon={<CloseIcon />}>Cancel</Button>
        <Button variant="contained" color="success" onClick={handleSubmit} disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}>
          {loading ? 'Updating...' : 'Update Car'}
        </Button>
      </Stack>
    </Box>
  );
}