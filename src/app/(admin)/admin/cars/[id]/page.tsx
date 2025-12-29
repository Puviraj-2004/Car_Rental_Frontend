'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Grid, Paper, Tab, Tabs, Snackbar, Alert,
  Autocomplete, Typography, IconButton
} from '@mui/material';
import {
  DirectionsCar, Euro, PhotoCamera, Save,
  CloudUpload, Delete as DeleteIcon
} from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client';

// GraphQL Queries & Mutations
import { UPDATE_CAR_MUTATION, ADD_CAR_IMAGE_MUTATION, DELETE_CAR_IMAGE_MUTATION } from '@/lib/graphql/mutations';
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
  const [uploadCarImages] = useMutation(ADD_CAR_IMAGE_MUTATION);
  const [deleteCarImage] = useMutation(DELETE_CAR_IMAGE_MUTATION);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: ['year', 'seats', 'pricePerHour', 'pricePerDay', 'dailyKmLimit', 'extraKmCharge', 'currentMileage'].includes(name) ? (value === '' ? null : Number(value)) : value
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
        // KM Limits & Meter Tracking
        dailyKmLimit: formData.dailyKmLimit,
        extraKmCharge: formData.extraKmCharge,
        currentMileage: formData.currentMileage,
        critAirRating: formData.critAirRating,
        status: formData.status,
        descriptionEn: formData.descriptionEn,
        descriptionFr: formData.descriptionFr,
        brandId: formData.brandId,
        modelId: formData.modelId,
      };
      
      await updateCar({ variables: { id: carId, input: updateInput } });

      if (selectedImages.length > 0) {
        const uploaded: string[] = [];
        try {
          for (let i = 0; i < selectedImages.length; i++) {
            const file = selectedImages[i];
            const isPrimary = existingImages.length === 0 && i === 0;
            const res = await uploadCarImages({ variables: { carId, file, isPrimary } });
            const added = res?.data?.addCarImage;
            if (added) {
              setExistingImages(prev => [...prev, added]);
              uploaded.push(added.id);
            }
          }
          // clear selected images after successful upload
          setSelectedImages([]);
          setImagePreviews([]);
        } catch (err: any) {
          // Rollback: delete images we just uploaded
          if (uploaded.length > 0) {
            try { await Promise.all(uploaded.map(id => deleteCarImage({ variables: { imageId: id } }))); } catch (e) { console.error('Failed to rollback uploaded images', e); }
          }
          setAlert({ open: true, msg: err?.message || 'Image upload failed; changes partially rolled back.', severity: 'error' });
          setIsUpdating(false);
          return;
        }
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
    <Box sx={{
      height: { xs: 'auto', md: 'calc(100vh - 80px)' },
      display: 'flex',
      alignItems: { xs: 'flex-start', md: 'center' },
      justifyContent: 'center',
      p: { xs: 1, sm: 2 },
      minHeight: { xs: '100vh', md: 'calc(100vh - 80px)' }
    }}>
      <Paper elevation={3} sx={{
        width: '100%',
        maxWidth: 900,
        height: { xs: 'auto', md: '100%' },
        maxHeight: { xs: 'none', md: 680 },
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid #E2E8F0'
      }}>

        {/* TABS HEADER */}
        <Box sx={{ bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
            <Tab icon={<DirectionsCar fontSize="small" />} iconPosition="start" label="Identity" />
            <Tab icon={<Euro fontSize="small" />} iconPosition="start" label="Pricing" />
            <Tab icon={<PhotoCamera fontSize="small" />} iconPosition="start" label="Media" />
          </Tabs>
        </Box>

        {/* FORM CONTENT */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 4 } }}>
          {activeTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={brandData?.brands || []}
                  getOptionLabel={(opt: any) => opt.name}
                  value={brandData?.brands.find((b: any) => b.id === formData.brandId) || null}
                  onChange={(_, newValue: any) => setFormData({ ...formData, brandId: newValue?.id || '', modelId: '' })}
                  renderInput={(p) => <TextField {...p} label="Brand" size="small" required fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  disabled={!formData.brandId}
                  options={modelData?.models || []}
                  getOptionLabel={(opt: any) => opt.name}
                  value={modelData?.models.find((m: any) => m.id === formData.modelId) || null}
                  onChange={(_, newValue: any) => setFormData({ ...formData, modelId: newValue?.id || '' })}
                  renderInput={(p) => <TextField {...p} label="Model" size="small" required fullWidth />}
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField fullWidth label="Year" name="year" type="number" size="small" value={formData.year} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Plate Number" name="plateNumber" size="small" required value={formData.plateNumber} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Fuel</InputLabel>
                  <Select name="fuelType" value={formData.fuelType} label="Fuel" onChange={handleInputChange}>
                    {enumData?.fuelTypeEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Transmission</InputLabel>
                  <Select name="transmission" value={formData.transmission} label="Transmission" onChange={handleInputChange}>
                    {enumData?.transmissionEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>CritAir</InputLabel>
                  <Select name="critAirRating" value={formData.critAirRating} label="CritAir" onChange={handleInputChange}>
                    {enumData?.critAirEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField fullWidth label="Seats" name="seats" type="number" size="small" value={formData.seats} onChange={handleInputChange} />
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <TextField fullWidth size="small" label="Per Hour (€)" name="pricePerHour" type="number" value={formData.pricePerHour} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth size="small" label="Per Day (€)" name="pricePerDay" type="number" value={formData.pricePerDay} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth size="small" label="Per Km (€)" name="pricePerKm" type="number" value={formData.pricePerKm} onChange={handleInputChange} />
              </Grid>

              {/* KM Limits & Meter Tracking Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#293D91' }}>
                  🚗 KM Limits & Meter Tracking
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Daily KM Limit"
                  name="dailyKmLimit"
                  type="number"
                  value={formData.dailyKmLimit ?? ''}
                  onChange={handleInputChange}
                  helperText="Leave empty for unlimited KM"
                  InputProps={{
                    endAdornment: formData.dailyKmLimit ? 'km/day' : null,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Extra KM Charge (€)"
                  name="extraKmCharge"
                  type="number"
                  value={formData.extraKmCharge ?? ''}
                  onChange={handleInputChange}
                  helperText="Cost per additional KM"
                  InputProps={{
                    startAdornment: '€',
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Current Mileage (km)"
                  name="currentMileage"
                  type="number"
                  value={formData.currentMileage ?? ''}
                  onChange={handleInputChange}
                  helperText="Starting odometer reading"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Security Deposit (€)" name="depositAmount" type="number" required value={formData.depositAmount} onChange={handleInputChange} helperText="Required for insurance franchise" />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Availability Status</InputLabel>
                  <Select name="status" value={formData.status} label="Availability Status" onChange={handleInputChange}>
                    {enumData?.carStatusEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {activeTab === 2 && (
            <Box sx={{ textAlign: 'center' }}>
              <Box component="label" sx={{ height: 120, border: '2px dashed #CBD5E1', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', cursor: 'pointer', '&:hover': { bgcolor: '#F1F5F9' }, mb: 3 }}>
                <input hidden accept="image/*" multiple type="file" onChange={handleImageSelect} />
                <CloudUpload sx={{ fontSize: 40, color: '#64748B', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">Click to Upload Photos</Typography>
              </Box>
              <Grid container spacing={1} sx={{ mb: 3 }}>
                {imagePreviews.map((p, i) => (
                  <Grid item xs={3} sm={2} key={i}>
                    <Box sx={{ position: 'relative', height: 80, borderRadius: 2, overflow: 'hidden', border: i === 0 ? '2px solid #293D91' : '1px solid #E2E8F0' }}>
                      <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="car" />
                      {i === 0 && <Box sx={{ position: 'absolute', bottom: 0, width: '100%', bgcolor: '#293D91', color: 'white', fontSize: '10px' }}>MAIN</Box>}
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
                        <Grid item xs={3} sm={2} key={img.id}>
                          <Box sx={{ position: 'relative', height: 80, borderRadius: 2, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                            <img src={img.imagePath} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="car" />
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
            </Box>
          )}
        </Box>

        {/* FOOTER */}
        <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={() => router.push('/admin/cars')} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isUpdating} startIcon={<Save />} sx={{ bgcolor: '#293D91' }}>
            {isUpdating ? <CircularProgress size={20} color="inherit" /> : "Update Car"}
          </Button>
        </Box>
      </Paper>

      <Snackbar open={alert.open} autoHideDuration={4000} onClose={() => setAlert({ ...alert, open: false })}>
        <Alert severity={alert.severity} variant="filled" onClose={() => setAlert({ ...alert, open: false })}>
          {alert.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}