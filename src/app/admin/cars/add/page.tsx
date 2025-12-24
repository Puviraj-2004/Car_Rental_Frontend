'use client';

import React, { useState } from 'react';
import {
  Box, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Grid, Paper, Tab, Tabs, Snackbar, Alert, Autocomplete, Stack, IconButton
} from '@mui/material';
import { DirectionsCar, Euro, PhotoCamera, Save, Close, ArrowForward, CloudUpload } from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';

import { CREATE_CAR_MUTATION, UPLOAD_CAR_IMAGES_MUTATION } from '@/lib/graphql/mutations';
import { GET_CAR_ENUMS, GET_BRANDS_QUERY, GET_MODELS_QUERY, GET_CARS_QUERY } from '@/lib/graphql/queries';

export default function AddCarPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, msg: '', severity: 'info' as any });

  const { data: enumData } = useQuery(GET_CAR_ENUMS);
  const { data: brandData } = useQuery(GET_BRANDS_QUERY);

  const [formData, setFormData] = useState({
    brandId: '', modelId: '', year: new Date().getFullYear(),
    plateNumber: '', fuelType: '', transmission: '',
    seats: 5, pricePerHour: 0, pricePerKm: 0, pricePerDay: 0,
    critAirRating: 'CRIT_AIR_3', availability: true, descriptionEn: '', descriptionFr: ''
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const { data: modelData } = useQuery(GET_MODELS_QUERY, {
    variables: { brandId: formData.brandId },
    skip: !formData.brandId,
  });

  const [createCar] = useMutation(CREATE_CAR_MUTATION, { refetchQueries: [{ query: GET_CARS_QUERY }] });
  const [uploadCarImages] = useMutation(UPLOAD_CAR_IMAGES_MUTATION);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: ['year', 'seats', 'pricePerHour', 'pricePerKm', 'pricePerDay'].includes(name) ? Number(value) : value }));
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
    if (!formData.brandId || !formData.modelId || !formData.plateNumber) {
      setAlert({ open: true, msg: 'Please fill all required fields!', severity: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await createCar({ variables: { input: formData } });
      if (selectedImages.length > 0 && data?.createCar?.id) {
        await uploadCarImages({ variables: { input: { carId: data.createCar.id, images: selectedImages, primaryIndex: 0 } } });
      }
      setAlert({ open: true, msg: 'Car added successfully!', severity: 'success' });
      router.push('/admin/cars');
    } catch (e: any) { setAlert({ open: true, msg: e.message, severity: 'error' }); }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 1 }}>
      <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
          <Tab icon={<DirectionsCar />} label="Identity" />
          <Tab icon={<Euro />} label="Pricing" />
          <Tab icon={<PhotoCamera />} label="Media" />
        </Tabs>
      </Paper>

      <Box sx={{ minHeight: 400 }}>
        {activeTab === 0 && (
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={brandData?.brands || []}
                  getOptionLabel={(opt) => opt.name}
                  value={brandData?.brands.find((b: any) => b.id === formData.brandId) || null}
                  onChange={(_, newValue) => setFormData({ ...formData, brandId: newValue?.id || '', modelId: '' })}
                  renderInput={(p) => <TextField {...p} label="Select Brand" size="small" required />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  disabled={!formData.brandId}
                  options={modelData?.models || []}
                  getOptionLabel={(opt) => opt.name}
                  value={modelData?.models.find((m: any) => m.id === formData.modelId) || null}
                  onChange={(_, newValue) => setFormData({ ...formData, modelId: newValue?.id || '' })}
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
            </Grid>
          </Paper>
        )}

        {activeTab === 1 && (
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
            <Grid container spacing={2}>
              <Grid item xs={4}><TextField fullWidth size="small" label="Price/Hr (€)" name="pricePerHour" type="number" value={formData.pricePerHour} onChange={handleInputChange} /></Grid>
              <Grid item xs={4}><TextField fullWidth size="small" label="Price/Day (€)" name="pricePerDay" type="number" value={formData.pricePerDay} onChange={handleInputChange} /></Grid>
              <Grid item xs={4}><TextField fullWidth size="small" label="Price/Km (€)" name="pricePerKm" type="number" value={formData.pricePerKm} onChange={handleInputChange} /></Grid>
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
                    <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="car" />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Box>

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={() => router.push('/admin/cars')} startIcon={<Close />}>Cancel</Button>
        {activeTab < 2 ? (
          <Button variant="contained" onClick={() => setActiveTab(prev => prev + 1)} endIcon={<ArrowForward />}>Next</Button>
        ) : (
          <Button variant="contained" color="success" onClick={handleSubmit} disabled={loading} startIcon={<Save />}>
            {loading ? "Saving..." : "Confirm & Save"}
          </Button>
        )}
      </Stack>
      <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })}><Alert severity={alert.severity}>{alert.msg}</Alert></Snackbar>
    </Box>
  );
}