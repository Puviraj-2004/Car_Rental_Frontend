'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Grid, Paper, Tab, Tabs, Snackbar, Alert, 
  Stack, IconButton, Autocomplete, Switch, FormControlLabel, Typography, Divider
} from '@mui/material';
import {
  DirectionsCar, Euro, PhotoCamera, Save, Close, ArrowForward, 
  CloudUpload, Delete as DeleteIcon
} from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client';

// GraphQL Queries & Mutations
import { UPDATE_CAR_MUTATION, UPLOAD_CAR_IMAGES_MUTATION, DELETE_CAR_IMAGE_MUTATION } from '@/lib/graphql/mutations';
import { GET_CAR_QUERY, GET_CAR_ENUMS, GET_BRANDS_QUERY, GET_MODELS_QUERY, GET_CARS_QUERY } from '@/lib/graphql/queries';

export default function EditCarPage() {
  const router = useRouter();
  const { id: carId } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [alert, setAlert] = useState({ open: false, msg: '', severity: 'info' as any });

  // 1. Queries
  const { data: carData, loading: carLoading, error: carError } = useQuery(GET_CAR_QUERY, { 
    variables: { id: carId },
    fetchPolicy: 'no-cache'
  });
  
  const { data: enumData } = useQuery(GET_CAR_ENUMS);
  const { data: brandData } = useQuery(GET_BRANDS_QUERY);

  const [formData, setFormData] = useState<any>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);

  // 2. Models Query
  const { data: modelData } = useQuery(GET_MODELS_QUERY, {
    variables: { brandId: formData?.brandId },
    skip: !formData?.brandId,
  });

  useEffect(() => {
    if (carData?.car) {
      const { __typename, images, brand, model, createdAt, updatedAt, ...rest } = carData.car;
      setFormData({
        ...rest,
        brandId: brand?.id || '',
        modelId: model?.id || ''
      });
      setExistingImages(images || []);
    }
  }, [carData]);

  // Handle error case
  useEffect(() => {
    if (carError) {
      setAlert({ open: true, msg: `Error loading car: ${carError.message}`, severity: 'error' });
    }
  }, [carError]);

  // 3. Mutations
  const [updateCar] = useMutation(UPDATE_CAR_MUTATION, { refetchQueries: [{ query: GET_CARS_QUERY }] });
  const [uploadCarImages] = useMutation(UPLOAD_CAR_IMAGES_MUTATION);
  const [deleteCarImage] = useMutation(DELETE_CAR_IMAGE_MUTATION);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: ['year', 'seats', 'pricePerHour', 'pricePerKm', 'pricePerDay'].includes(name) ? Number(value) : value
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    if (confirm('Delete this image permanently?')) {
      try {
        await deleteCarImage({ variables: { imageId } });
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
      } catch (err: any) { setAlert({ open: true, msg: err.message, severity: 'error' }); }
    }
  };

  const handleSubmit = async () => {
    if (!formData.brandId || !formData.modelId || !formData.plateNumber) {
      setAlert({ open: true, msg: 'Please fill all required fields!', severity: 'warning' });
      return;
    }

    setIsUpdating(true);
    try {
      // Only include fields that are part of UpdateCarInput
      const updateInput = {
        year: formData.year,
        plateNumber: formData.plateNumber,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        seats: formData.seats,
        pricePerHour: formData.pricePerHour,
        pricePerKm: formData.pricePerKm,
        pricePerDay: formData.pricePerDay,
        critAirRating: formData.critAirRating,
        status: formData.status,
        descriptionEn: formData.descriptionEn,
        descriptionFr: formData.descriptionFr,
        brandId: formData.brandId,
        modelId: formData.modelId,
      };
      
      await updateCar({ variables: { id: carId, input: updateInput } });

      if (selectedImages.length > 0) {
        await uploadCarImages({ 
          variables: { input: { carId, images: selectedImages, primaryIndex: existingImages.length === 0 ? 0 : -1 } } 
        });
      }
      setAlert({ open: true, msg: 'Car updated successfully!', severity: 'success' });
      router.push('/admin/cars');
    } catch (err: any) {
      setAlert({ open: true, msg: err.message, severity: 'error' });
      setIsUpdating(false);
    }
  };

  if (carLoading && !formData) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress size={40} sx={{ color: '#293D91' }} />
    </Box>
  );

  // Handle error case - show error message instead of loading forever
  if (carError) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Car
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {carError.message}
        </Typography>
        <Button variant="contained" onClick={() => router.push('/admin/cars')}>
          Go Back to Cars
        </Button>
      </Box>
    </Box>
  );

  // Handle case where car is not found
  if (!formData && !carLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Car Not Found
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          The car you're looking for doesn't exist or may have been deleted.
        </Typography>
        <Button variant="contained" onClick={() => router.push('/admin/cars')}>
          Go Back to Cars
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 1 }}>
      {/* Tab Header - Exactly like Add Page */}
      <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
          <Tab icon={<DirectionsCar />} label="Identity" />
          <Tab icon={<Euro />} label="Pricing" />
          <Tab icon={<PhotoCamera />} label="Media" />
        </Tabs>
      </Paper>

      {/* Main Form Area */}
      <Box sx={{ minHeight: 400 }}>
        {activeTab === 0 && (
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={brandData?.brands || []}
                  getOptionLabel={(opt: any) => opt.name}
                  value={brandData?.brands.find((b: any) => b.id === formData.brandId) || null}
                  onChange={(_, newValue: any) => setFormData({ ...formData, brandId: newValue?.id || '', modelId: '' })}
                  renderInput={(p) => <TextField {...p} label="Select Brand" size="small" required />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  disabled={!formData.brandId}
                  options={modelData?.models || []}
                  getOptionLabel={(opt: any) => opt.name}
                  value={modelData?.models.find((m: any) => m.id === formData.modelId) || null}
                  onChange={(_, newValue: any) => setFormData({ ...formData, modelId: newValue?.id || '' })}
                  renderInput={(p) => <TextField {...p} label="Select Model" size="small" required />}
                />
              </Grid>
              <Grid item xs={6}><TextField fullWidth label="Year" name="year" type="number" value={formData.year} onChange={handleInputChange} size="small" /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Plate Number" name="plateNumber" value={formData.plateNumber} onChange={handleInputChange} size="small" /></Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Fuel</InputLabel>
                  <Select name="fuelType" value={formData.fuelType} onChange={handleInputChange} label="Fuel">
                    {enumData?.fuelTypeEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Transmission</InputLabel>
                  <Select name="transmission" value={formData.transmission} onChange={handleInputChange} label="Transmission">
                    {enumData?.transmissionEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>CritAir Rating</InputLabel>
                  <Select name="critAirRating" value={formData.critAirRating} onChange={handleInputChange} label="CritAir Rating">
                    {enumData?.critAirEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}</Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        )}

        {activeTab === 1 && (
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
            <Grid container spacing={2}>
              <Grid item xs={4}><TextField fullWidth size="small" label="Price/Hr (€)" name="pricePerHour" type="number" value={formData.pricePerHour} onChange={handleInputChange} /></Grid>
              <Grid item xs={4}><TextField fullWidth size="small" label="Price/Day (€)" name="pricePerDay" type="number" value={formData.pricePerDay} onChange={handleInputChange} /></Grid>
              <Grid item xs={4}><TextField fullWidth size="small" label="Price/Km (€)" name="pricePerKm" type="number" value={formData.pricePerKm} onChange={handleInputChange} /></Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select name="status" value={formData.status} onChange={handleInputChange} label="Status">
                    {enumData?.carStatusEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}</Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        )}

        {activeTab === 2 && (
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
            <Box component="label" sx={{ height: 100, border: '2px dashed #CBD5E1', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', cursor: 'pointer', mb: 2 }}>
              <input hidden accept="image/*" multiple type="file" onChange={handleImageSelect} />
              <CloudUpload color="primary" sx={{ mr: 1 }} /> Upload Images
            </Box>
            <Grid container spacing={1}>
              {imagePreviews.map((p, i) => (
                <Grid item xs={3} key={i}>
                  <Box sx={{ position: 'relative', height: 80, borderRadius: 2, overflow: 'hidden', border: i === 0 ? '2px solid #293D91' : '1px solid #E2E8F0' }}>
                    <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                </Grid>
              ))}
            </Grid>
            {existingImages.length > 0 && (
              <>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>EXISTING GALLERY</Typography>
                  <Grid container spacing={1}>
                    {existingImages.map((img) => (
                      <Grid item xs={3} key={img.id}>
                        <Box sx={{ position: 'relative', height: 80, borderRadius: 2, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                          <img src={`http://localhost:4000${img.imagePath}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <IconButton onClick={() => handleRemoveExistingImage(img.id)} size="small" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,0,0,0.7)', color: 'white' }}>
                            <DeleteIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </>
            )}
          </Paper>
        )}
      </Box>

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={() => router.push('/admin/cars')} startIcon={<Close />}>Cancel</Button>
        {activeTab < 2 ? (
          <Button variant="contained" onClick={() => setActiveTab(prev => prev + 1)} endIcon={<ArrowForward />}>Next</Button>
        ) : (
          <Button variant="contained" color="success" onClick={handleSubmit} disabled={isUpdating} startIcon={<Save />}>
            {isUpdating ? "Updating..." : "Confirm & Update"}
          </Button>
        )}

      </Stack>

      <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })}>
        <Alert severity={alert.severity}>{alert.msg}</Alert>
      </Snackbar>
    </Box>
  );
}