'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Grid, Paper, Tab, Tabs, Snackbar, Alert,
  Autocomplete, Typography, IconButton, Stack
} from '@mui/material';
import {
  DirectionsCar, Euro, PhotoCamera, Save,
  CloudUpload, Delete as DeleteIcon
} from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client';

// GraphQL Queries & Mutations
import { UPDATE_CAR_MUTATION, ADD_CAR_IMAGE_MUTATION, DELETE_CAR_IMAGE_MUTATION, SET_PRIMARY_CAR_IMAGE_MUTATION } from '@/lib/graphql/mutations';
import { GET_CAR_QUERY, GET_CAR_ENUMS, GET_BRANDS_QUERY, GET_MODELS_QUERY, GET_CARS_QUERY } from '@/lib/graphql/queries';

export default function EditCarPage() {
  const router = useRouter();
  const { id: carId } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [alert, setAlert] = useState({ open: false, msg: '', severity: 'info' as any });
  const [originalData, setOriginalData] = useState<any>(null);

  // Validate carId
  if (!carId) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Invalid Car ID
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            No car ID provided in the URL.
          </Typography>
          <Button variant="contained" onClick={() => router.push('/admin/cars')}>
            Go Back to Cars
          </Button>
        </Box>
      </Box>
    );
  }

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
  const [primaryImageIndex, setPrimaryImageIndex] = useState(-1);

  // 2. Models Query
  const { data: modelData } = useQuery(GET_MODELS_QUERY, {
    variables: { brandId: formData?.brandId },
    skip: !formData?.brandId,
  });

  useEffect(() => {
    if (carData?.car) {
      const { __typename, images, brand, model, createdAt, updatedAt, ...rest } = carData.car;
      const formDataWithIds = {
        ...rest,
        brandId: brand?.id || '',
        modelId: model?.id || ''
      };
      setFormData(formDataWithIds);
      setOriginalData(formDataWithIds); // Store original data for comparison
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
  const [setPrimaryCarImage] = useMutation(SET_PRIMARY_CAR_IMAGE_MUTATION);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: ['year', 'pricePerDay', 'depositAmount', 'dailyKmLimit', 'extraKmCharge', 'currentOdometer', 'seats'].includes(name) ? (value === '' ? null : Number(value)) : value
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

  const handleRemoveNewImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));

    // Adjust primary image index if needed (only if a primary was selected)
    if (primaryImageIndex >= 0) {
      if (primaryImageIndex === index) {
        setPrimaryImageIndex(-1); // Reset to no selection if primary was removed
      } else if (primaryImageIndex > index) {
        setPrimaryImageIndex(prev => prev - 1);
      }
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    try {
      await setPrimaryCarImage({ variables: { carId, imageId } });
      // Update local state
      setExistingImages(prev => prev.map(img => ({
        ...img,
        isPrimary: img.id === imageId
      })));
      setAlert({ open: true, msg: 'Primary image updated successfully!', severity: 'success' });
    } catch (err: any) {
      setAlert({ open: true, msg: 'Failed to update primary image.', severity: 'error' });
    }
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
    // Check if any data has actually changed
    if (originalData && JSON.stringify(formData) === JSON.stringify(originalData)) {
      setAlert({ open: true, msg: 'No changes detected. Please modify at least one field before updating.', severity: 'info' });
      return;
    }

    // Basic Validation - Schema Required Fields
    if (!formData.modelId || !formData.plateNumber || !formData.pricePerDay || formData.currentOdometer === 0 || !formData.critAirRating || !formData.status || !formData.requiredLicense || !formData.seats) {
      setAlert({ open: true, msg: 'Please fill all required fields: Model, Plate Number, Price Per Day, Current Odometer, Crit Air Rating, Seats, License Category, and Status!', severity: 'warning' });
      return;
    }

    setIsUpdating(true);
    console.log('Starting car update process...');
    try {
      // Only include fields that are part of UpdateCarInput (matching schema)
      const updateInput = {
        modelId: formData.modelId,
        year: formData.year,
        plateNumber: formData.plateNumber,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        seats: formData.seats,
        requiredLicense: formData.requiredLicense,
        pricePerDay: formData.pricePerDay,
        depositAmount: formData.depositAmount,
        dailyKmLimit: formData.dailyKmLimit,
        extraKmCharge: formData.extraKmCharge,
        currentOdometer: formData.currentOdometer,
        critAirRating: formData.critAirRating,
        status: formData.status
      };
      
      console.log('Updating car with input:', updateInput);
      const result = await updateCar({ variables: { id: carId, input: updateInput } });
      console.log('Update result:', result);

      if (selectedImages.length > 0) {
        const uploaded: string[] = [];
        try {
          for (let i = 0; i < selectedImages.length; i++) {
            const file = selectedImages[i];
            const isPrimary = i === primaryImageIndex;
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
      console.error('Update car error:', err);
      setAlert({ open: true, msg: err.message || 'Failed to update car', severity: 'error' });
      setIsUpdating(false);
    }
  };


  // Handle error case - show error message
  if (carError) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Unable to Load Car Details
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          This might be a temporary connection issue. The server may still be starting up.
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          <strong>Car ID:</strong> {carId}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1, fontSize: '0.75rem' }}>
          {carError.message}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Car ID: {carId}
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="outlined" onClick={() => window.location.reload()}>
            Retry
          </Button>
          <Button variant="contained" onClick={() => router.push('/admin/cars')}>
            Go Back to Cars
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  // Handle case where car is not found
  if (!formData) return (
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
          {!carData?.car ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <Typography color="error">Car not found or failed to load.</Typography>
            </Box>
          ) : activeTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={brandData?.brands || []}
                  getOptionLabel={(opt: any) => opt.name}
                  value={brandData?.brands.find((b: any) => b.id === formData.brandId) || null}
                  onChange={(_, newValue: any) => setFormData({ ...formData, brandId: newValue?.id || '', modelId: '' })}
                  renderInput={(p) => <TextField {...p} label="Brand" size="small" fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  disabled={!formData.brandId}
                  options={modelData?.models || []}
                  getOptionLabel={(opt: any) => opt.name}
                  value={modelData?.models.find((m: any) => m.id === formData.modelId) || null}
                  onChange={(_, newValue: any) => setFormData({ ...formData, modelId: newValue?.id || '' })}
                  renderInput={(p) => <TextField {...p} label="Model" size="small" required fullWidth />}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="Year" name="year" type="number" size="small" required value={formData.year} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>CritAir</InputLabel>
                  <Select name="critAirRating" value={formData.critAirRating} label="CritAir" onChange={handleInputChange}>
                    {enumData?.critAirEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Plate Number" name="plateNumber" size="small" required value={formData.plateNumber} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Fuel Type</InputLabel>
                  <Select name="fuelType" value={formData.fuelType} label="Fuel Type" onChange={handleInputChange}>
                    {enumData?.fuelTypeEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Transmission</InputLabel>
                  <Select name="transmission" value={formData.transmission} label="Transmission" onChange={handleInputChange}>
                    {enumData?.transmissionEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  label="Seats"
                  name="seats"
                  type="number"
                  size="small"
                  required
                  value={formData.seats ?? ''}
                  onChange={handleInputChange}
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>License Category</InputLabel>
                  <Select name="requiredLicense" value={formData.requiredLicense} label="License Category" onChange={handleInputChange}>
                    {enumData?.licenseCategoryEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Status</InputLabel>
                  <Select name="status" value={formData.status} label="Status" onChange={handleInputChange}>
                    {enumData?.carStatusEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#293D91' }}>
                  💰 Pricing & Deposits
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Price Per Day (€)"
                  name="pricePerDay"
                  type="number"
                  required
                  value={formData.pricePerDay ? formData.pricePerDay.toFixed(2) : ''}
                  onChange={handleInputChange}
                  InputProps={{ startAdornment: '€' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Security Deposit (€)"
                  name="depositAmount"
                  type="number"
                  value={formData.depositAmount ? formData.depositAmount.toFixed(2) : ''}
                  onChange={handleInputChange}
                  helperText="Required for insurance franchise"
                  InputProps={{ startAdornment: '€' }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#293D91' }}>
                  🚗 KM Limits & Meter Tracking
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Extra KM Charge (€)"
                  name="extraKmCharge"
                  type="number"
                  required
                  value={formData.extraKmCharge ? formData.extraKmCharge.toFixed(2) : ''}
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
                  label="Current Odometer (km)"
                  name="currentOdometer"
                  type="number"
                  required
                  value={formData.currentOdometer ?? ''}
                  onChange={handleInputChange}
                  helperText="Starting odometer reading"
                />
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

              {/* COMBINED IMAGES GALLERY */}
              <Grid container spacing={1}>
                {/* Existing Images */}
                {existingImages.map((img) => (
                  <Grid item xs={3} sm={2} key={`existing-${img.id}`}>
                    <Box sx={{ position: 'relative', height: 80, borderRadius: 2, overflow: 'hidden', border: img.isPrimary ? '2px solid #293D91' : '1px solid #E2E8F0', cursor: 'pointer' }} onClick={() => handleSetPrimaryImage(img.id)}>
                      <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="car" />
                      {img.isPrimary && <Box sx={{ position: 'absolute', bottom: 0, width: '100%', bgcolor: '#293D91', color: 'white', fontSize: '10px', textAlign: 'center' }}>MAIN</Box>}
                      <IconButton onClick={(e) => { e.stopPropagation(); handleRemoveExistingImage(img.id); }} size="small" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,0,0,0.7)', color: 'white', '&:hover': { bgcolor: 'rgba(255,0,0,0.9)' } }}>
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}

                {/* New Images to Upload */}
                {imagePreviews.map((p, i) => (
                  <Grid item xs={3} sm={2} key={`new-${i}`}>
                    <Box sx={{ position: 'relative', height: 80, borderRadius: 2, overflow: 'hidden', border: i === primaryImageIndex ? '2px solid #293D91' : '1px solid #E2E8F0', cursor: 'pointer' }} onClick={() => setPrimaryImageIndex(i)}>
                      <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="car" />
                      {i === primaryImageIndex && <Box sx={{ position: 'absolute', bottom: 0, width: '100%', bgcolor: '#293D91', color: 'white', fontSize: '10px', textAlign: 'center' }}>MAIN</Box>}
                      <IconButton onClick={(e) => { e.stopPropagation(); handleRemoveNewImage(i); }} size="small" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,0,0,0.7)', color: 'white', '&:hover': { bgcolor: 'rgba(255,0,0,0.9)' } }}>
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Empty State */}
              {existingImages.length === 0 && imagePreviews.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px dashed #CBD5E1', mt: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    No images yet. Click "Click to Upload Photos" above to add images.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* FOOTER */}
        <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={() => router.push('/admin/cars')} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} startIcon={<Save />} sx={{ bgcolor: '#293D91' }}>
            Update Car
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