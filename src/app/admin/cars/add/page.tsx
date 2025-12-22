'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Grid, Typography, Paper, Switch, FormControlLabel,
  IconButton, Stack, Tab, Tabs, Snackbar, Alert
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon, DirectionsCar as CarIcon, 
  Euro as PriceIcon, PhotoCamera as PhotoIcon, Save as SaveIcon,
  ArrowForward as NextIcon, Close as CloseIcon, Delete as DeleteIcon
} from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';

// GraphQL & Data
import { CREATE_CAR_MUTATION, UPLOAD_CAR_IMAGES_MUTATION } from '@/lib/graphql/mutations';
import { GET_CAR_ENUMS, GET_CARS_QUERY } from '@/lib/graphql/queries';
import { CAR_BRANDS } from '@/lib/carData';

export default function AddCarPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, msg: '', severity: 'warning' as 'warning' | 'error' });
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // 1. Fetch Dynamic Enums (Fuel & Transmission)
  const { data: enumData, loading: enumLoading } = useQuery(GET_CAR_ENUMS);

  const [formData, setFormData] = useState({
    brand: '', model: '', year: new Date().getFullYear(),
    plateNumber: '', fuelType: '', transmission: '',
    seats: 5, doors: 4, pricePerHour: 0, pricePerKm: 0,
    pricePerDay: 0, critAirRating: 'CRIT_AIR_3', availability: true,
    descriptionEn: '', descriptionFr: '',
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // 2. Mutations
  const [createCar] = useMutation(CREATE_CAR_MUTATION, {
    refetchQueries: [{ query: GET_CARS_QUERY }],
  });
  const [uploadCarImages] = useMutation(UPLOAD_CAR_IMAGES_MUTATION);

  // 3. Handlers
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;

    if (name === 'brand') {
      // பிராண்டிற்கு ஏற்ற மாடல்களை CAR_BRANDS-லிருந்து எடுத்தல்
      const brandObj = CAR_BRANDS.find(b => b.label === value);
      setAvailableModels(brandObj ? brandObj.models : []);
      setFormData(prev => ({ ...prev, brand: value, model: '' }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: ['year', 'seats', 'doors', 'pricePerHour', 'pricePerKm', 'pricePerDay'].includes(name)
          ? Number(value) : value 
      }));
    }
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

  const handleSubmit = async () => {
    // 🔍 User-Friendly Validation
    if (!formData.brand || !formData.model || !formData.plateNumber || !formData.fuelType || !formData.transmission) {
      setAlert({ open: true, msg: 'Please fill all required identity fields!', severity: 'warning' });
      setActiveTab(0);
      return;
    }

    setLoading(true);
    try {
      // CritAirRating Enum ஆக அனுப்பப்படுகிறது
      const { data } = await createCar({ 
        variables: { input: { ...formData, year: Number(formData.year) } } 
      });
      if (selectedImages.length > 0 && data?.createCar?.id) {
        await uploadCarImages({ variables: { input: { carId: data.createCar.id, images: selectedImages, primaryIndex: 0 } } });
      }
      router.push('/admin/cars');
    } catch (err: any) {
      setAlert({ open: true, msg: err.message, severity: 'error' });
    }
    setLoading(false);
  };

  if (enumLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 900, margin: 'auto', height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Tab Switcher - Headings removed for clean look */}
      <Paper elevation={0} sx={{ borderRadius: 3, mb: 1.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
          <Tab icon={<CarIcon />} label="Identity" sx={{ fontWeight: 700, minHeight: 65 }} />
          <Tab icon={<PriceIcon />} label="Pricing" sx={{ fontWeight: 700, minHeight: 65 }} />
          <Tab icon={<PhotoIcon />} label="Media" sx={{ fontWeight: 700, minHeight: 65 }} />
        </Tabs>
      </Paper>

      {/* Frames Area - Scrolling disabled */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        
        {/* FRAME 1: Identity (Space Optimized) */}
        {activeTab === 0 && (
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid #E2E8F0' }}>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Brand</InputLabel>
                  <Select name="brand" value={formData.brand} onChange={handleInputChange} label="Brand">
                    {CAR_BRANDS.map(b => <MenuItem key={b.label} value={b.label}>{b.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" disabled={!formData.brand}>
                  <InputLabel>Model</InputLabel>
                  <Select name="model" value={formData.model} onChange={handleInputChange} label="Model">
                    {availableModels.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}><TextField fullWidth size="small" label="Year" name="year" type="number" value={formData.year} onChange={handleInputChange} /></Grid>
              <Grid item xs={6}><TextField fullWidth size="small" label="Plate Number" name="plateNumber" value={formData.plateNumber} onChange={handleInputChange} /></Grid>
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
            </Grid>
          </Paper>
        )}

        {/* FRAME 2: Pricing */}
        {activeTab === 1 && (
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
            <Grid container spacing={2}>
              <Grid item xs={4}><TextField fullWidth size="small" label="Price/Hr (€)" name="pricePerHour" type="number" value={formData.pricePerHour} onChange={handleInputChange} /></Grid>
              <Grid item xs={4}><TextField fullWidth size="small" label="Price/Day (€)" name="pricePerDay" type="number" value={formData.pricePerDay} onChange={handleInputChange} /></Grid>
              <Grid item xs={4}><TextField fullWidth size="small" label="Price/Km (€)" name="pricePerKm" type="number" value={formData.pricePerKm} onChange={handleInputChange} /></Grid>
              <Grid item xs={6}><TextField fullWidth size="small" label="Seats" name="seats" type="number" value={formData.seats} onChange={handleInputChange} /></Grid>
              <Grid item xs={6}><TextField fullWidth size="small" label="Doors" name="doors" type="number" value={formData.doors} onChange={handleInputChange} /></Grid>
              <Grid item xs={12}><FormControlLabel control={<Switch size="small" checked={formData.availability} onChange={(e) => setFormData({...formData, availability: e.target.checked})} />} label="Available Now" /></Grid>
            </Grid>
          </Paper>
        )}

        {/* FRAME 3: Media & Desc (Stable Scroll) */}
        {activeTab === 2 && (
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block', color: '#64748B' }}>IMAGE GALLERY</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={4} sm={3}>
                      <Box component="label" sx={{ height: 80, border: '2px dashed #CBD5E1', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', cursor: 'pointer' }}>
                        <input hidden accept="image/*" multiple type="file" onChange={handleImageSelect} />
                        <CloudUploadIcon color="primary" sx={{ fontSize: 24 }} />
                      </Box>
                    </Grid>
                    {imagePreviews.map((p, i) => (
                      <Grid item xs={4} sm={3} key={i}>
                        <Box sx={{ position: 'relative', height: 80, borderRadius: 2, overflow: 'hidden', border: i === 0 ? '2px solid #293D91' : '1px solid #E2E8F0' }}>
                          <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="car" />
                          <IconButton size="small" onClick={() => { setImagePreviews(prev => prev.filter((_, idx) => idx !== i)); setSelectedImages(prev => prev.filter((_, idx) => idx !== i)); }} sx={{ position: 'absolute', top: 2, right: 2, p: 0.2, bgcolor: 'rgba(255,255,255,0.7)' }}>
                            <DeleteIcon sx={{ fontSize: 14, color: '#EF4444' }} />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                <Stack spacing={2}>
                  <TextField fullWidth multiline rows={2} label="Description (EN)" name="descriptionEn" value={formData.descriptionEn} onChange={handleInputChange} size="small" />
                  <TextField fullWidth multiline rows={2} label="Description (FR)" name="descriptionFr" value={formData.descriptionFr} onChange={handleInputChange} size="small" />
                </Stack>
              </Stack>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Snackbar Pop-up Alert */}
      <Snackbar open={alert.open} autoHideDuration={4000} onClose={() => setAlert({ ...alert, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={alert.severity} variant="filled" sx={{ width: '100%' }}>{alert.msg}</Alert>
      </Snackbar>

      {/* Bottom Navigation - Previous removed, Cancel added */}
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}>
        <Button variant="outlined" color="inherit" onClick={() => router.push('/admin/cars')} startIcon={<CloseIcon />} sx={{ px: 3, borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
        {activeTab < 2 ? (
          <Button variant="contained" onClick={() => setActiveTab(prev => prev + 1)} endIcon={<NextIcon />} sx={{ bgcolor: '#293D91', px: 5, borderRadius: 2, textTransform: 'none' }}>Next Step</Button>
        ) : (
          <Button variant="contained" color="success" onClick={handleSubmit} disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />} sx={{ px: 5, borderRadius: 2, textTransform: 'none' }}>
            {loading ? 'Saving...' : 'Confirm & Save'}
          </Button>
        )}
      </Stack>
    </Box>
  );
}