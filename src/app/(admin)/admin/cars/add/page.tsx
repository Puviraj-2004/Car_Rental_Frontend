'use client';

import React, { useState } from 'react';
import {
  Box, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Grid, Paper, Tab, Tabs, Snackbar, Alert, Autocomplete, Stack, Typography, CircularProgress, IconButton
} from '@mui/material';
import { DirectionsCar, Euro, PhotoCamera, Save, CloudUpload, Delete as DeleteIcon } from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';

import { CREATE_CAR_MUTATION, ADD_CAR_IMAGE_MUTATION, DELETE_CAR_MUTATION } from '@/lib/graphql/mutations';
import { GET_CAR_ENUMS, GET_BRANDS_QUERY, GET_MODELS_QUERY, GET_CARS_QUERY } from '@/lib/graphql/queries';

export default function AddCarPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double submissions
  const [alert, setAlert] = useState({ open: false, msg: '', severity: 'info' as any });

  // --- Queries ---
  const { data: enumData } = useQuery(GET_CAR_ENUMS);
  const { data: brandData } = useQuery(GET_BRANDS_QUERY);

  // --- Form State ---
  const [formData, setFormData] = useState({
    brandId: '', // Brand selection for model filtering
    modelId: '', year: new Date().getFullYear(),
    plateNumber: '', fuelType: '', transmission: '',
    seats: 5, // Number of seats
    requiredLicense: '', // License category required to drive this car
    pricePerDay: 0, depositAmount: 0,
    // KM Limits & Meter Tracking
    dailyKmLimit: null as number | null,
    extraKmCharge: 0,
    currentOdometer: 0,
    critAirRating: '', status: ''
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  const { data: modelData } = useQuery(GET_MODELS_QUERY, {
    variables: { brandId: formData.brandId },
    skip: !formData.brandId,
  });

  // --- Mutations ---
  const [createCar] = useMutation(CREATE_CAR_MUTATION, { 
    refetchQueries: [{ query: GET_CARS_QUERY }] 
  });
  const [uploadImage] = useMutation(ADD_CAR_IMAGE_MUTATION);
  const [deleteCar] = useMutation(DELETE_CAR_MUTATION);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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

    // Adjust primary image index if needed
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Prevent double submissions
    if (isSubmitting || loading) {
      return;
    }

    // Clear any existing alerts to prevent showing stale error messages
    setAlert({ open: false, msg: '', severity: 'info' });

    // Set submitting state immediately before any other logic
    setIsSubmitting(true);

    // Basic Validation - Schema Required Fields
    if (!formData.modelId || !formData.plateNumber || !formData.pricePerDay || formData.currentOdometer === 0 || !formData.critAirRating || !formData.status || !formData.requiredLicense || !formData.seats) {
      setAlert({ open: true, msg: 'Please fill all required fields: Model, Plate Number, Price Per Day, Current Odometer, Crit Air Rating, Seats, License Category, and Status!', severity: 'warning' });
      setIsSubmitting(false);
      return;
    }

    setLoading(true);
    try {
      // 1. கார் விவரங்களை உருவாக்குதல்
      // Remove brandId from formData as it's not part of CreateCarInput
      const { brandId, ...carInput } = formData;
      const { data } = await createCar({
        variables: { input: carInput }
      });

      const carId = data?.createCar?.id;

      // 2. Cloudinary-க்கு படங்களை அப்லோட் செய்தல்
      if (carId && selectedImages.length > 0) {
        setAlert({ open: true, msg: 'Uploading images to Cloudinary...', severity: 'info' });
        const uploadedIds: string[] = [];
        try {
          for (let i = 0; i < selectedImages.length; i++) {
            const file = selectedImages[i];
            const res = await uploadImage({ variables: { carId, file, isPrimary: i === primaryImageIndex } });
            const created = res?.data?.addCarImage;
            if (created?.id) uploadedIds.push(created.id);
          }
          setAlert({ open: true, msg: 'Car and images added successfully!', severity: 'success' });
        } catch (err: any) {
          // Rollback: delete the created car (server will remove uploaded images too)
          try { await deleteCar({ variables: { id: carId } }); } catch (rollbackErr) { console.error('Rollback delete failed', rollbackErr); }
          setAlert({ open: true, msg: err?.message || 'Image upload failed; car creation rolled back.', severity: 'error' });
          setLoading(false);
          setIsSubmitting(false);
          return;
        }
      } else {
        setAlert({ open: true, msg: 'Car added successfully!', severity: 'success' });
      }
      setTimeout(() => router.push('/admin/cars'), 1500);

    } catch (e: any) {
      // 🛑 User Friendly Error Handling (English)

      let displayError = e.message;

      // Check for Prisma unique constraint error (P2002) specifically for duplicate plate numbers
      const isUniqueConstraintError = e.graphQLErrors?.some((error: any) =>
        error.extensions?.code === 'P2002' &&
        error.message?.includes('plateNumber')
      );

      if (isUniqueConstraintError) {
        displayError = "This plate number already exists! Please check and try a different one.";
      } else if (displayError.includes('createReadStream')) {
        displayError = "Image Upload Error: Please check server settings and try again.";
      } else if (displayError.includes('Field "brandId" is not defined')) {
        displayError = "Car creation failed due to invalid data. Please refresh the page and try again.";
      } else if (displayError.includes('GraphQL error')) {
        displayError = "Server error occurred. Please try again or contact support.";
      } else {
        // Fallback: show the raw error for debugging
        displayError = `Error: ${displayError}`;
      }

      setAlert({ open: true, msg: displayError, severity: 'error' });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 900, height: '100%', maxHeight: 680, display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
        
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
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={brandData?.brands || []}
                  getOptionLabel={(opt: any) => opt.name}
                  value={brandData?.brands?.find((b: any) => b.id === formData.brandId) || null}
                  onChange={(_, v: any) => setFormData({ ...formData, brandId: v?.id || '', modelId: '' })}
                  renderInput={(p) => <TextField {...p} label="Brand" size="small" fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  disabled={!formData.brandId}
                  options={modelData?.models || []}
                  getOptionLabel={(opt: any) => opt.name}
                  value={modelData?.models?.find((m: any) => m.id === formData.modelId) || null}
                  onChange={(_, v: any) => setFormData({ ...formData, modelId: v?.id || '' })}
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
                  value={formData.seats}
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
                  value={formData.dailyKmLimit || ''}
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
                  value={formData.currentOdometer || ''}
                  onChange={handleInputChange}
                  helperText="Starting odometer reading"
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 2 && (
            <Box sx={{ textAlign: 'center' }}>
              <Box component="label" sx={{ height: 120, border: '2px dashed #CBD5E1', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', cursor: 'pointer', '&:hover': { bgcolor: '#F1F5F9' } }}>
                <input hidden accept="image/*" multiple type="file" onChange={handleImageSelect} />
                <CloudUpload sx={{ fontSize: 40, color: '#64748B', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">Click to Upload Photos</Typography>
              </Box>
              <Grid container spacing={1} sx={{ mt: 3 }}>
                {imagePreviews.map((p, i) => (
                  <Grid item xs={3} sm={2} key={i}>
                    <Box sx={{ position: 'relative', height: 80, borderRadius: 2, overflow: 'hidden', border: i === primaryImageIndex ? '2px solid #293D91' : '1px solid #E2E8F0', cursor: 'pointer' }} onClick={() => setPrimaryImageIndex(i)}>
                      <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="car" />
                      {i === primaryImageIndex && <Box sx={{ position: 'absolute', bottom: 0, width: '100%', bgcolor: '#293D91', color: 'white', fontSize: '10px' }}>MAIN</Box>}
                      <IconButton onClick={(e) => { e.stopPropagation(); handleRemoveNewImage(i); }} size="small" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,0,0,0.7)', color: 'white', '&:hover': { bgcolor: 'rgba(255,0,0,0.9)' } }}>
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>

        {/* FOOTER */}
        <Box sx={{ p: { xs: 2, sm: 2 }, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={() => router.back()} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} startIcon={<Save />} sx={{ bgcolor: '#293D91' }}>
            Add Car
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