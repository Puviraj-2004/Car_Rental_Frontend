'use client';

import React, { useState } from 'react';
import {
  Box, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Grid, Paper, Tab, Tabs, Snackbar, Alert, Autocomplete, Stack, Typography, CircularProgress
} from '@mui/material';
import { DirectionsCar, Euro, PhotoCamera, Save, CloudUpload } from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';

import { CREATE_CAR_MUTATION, ADD_CAR_IMAGE_MUTATION, DELETE_CAR_MUTATION } from '@/lib/graphql/mutations';
import { GET_CAR_ENUMS, GET_BRANDS_QUERY, GET_MODELS_QUERY, GET_CARS_QUERY } from '@/lib/graphql/queries';

export default function AddCarPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, msg: '', severity: 'info' as any });

  // --- Queries ---
  const { data: enumData } = useQuery(GET_CAR_ENUMS);
  const { data: brandData } = useQuery(GET_BRANDS_QUERY);

  // --- Form State ---
  const [formData, setFormData] = useState({
    brandId: '', modelId: '', year: new Date().getFullYear(),
    plateNumber: '', fuelType: '', transmission: '',
    seats: 5, pricePerHour: 0, pricePerKm: 0, pricePerDay: 0,
    depositAmount: 0, 
    critAirRating: '', status: 'AVAILABLE', descriptionEn: '', descriptionFr: ''
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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
      [name]: ['year', 'seats', 'pricePerHour', 'pricePerKm', 'pricePerDay', 'depositAmount'].includes(name) ? Number(value) : value 
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

  const handleSubmit = async () => {
    // Basic Validation
    if (!formData.brandId || !formData.modelId || !formData.plateNumber) {
      setAlert({ open: true, msg: 'Please fill all required fields!', severity: 'warning' });
      return;
    }

    setLoading(true);
    try {
      // 1. கார் விவரங்களை உருவாக்குதல்
      const { data } = await createCar({ 
        variables: { input: { ...formData } } 
      });

      const carId = data?.createCar?.id;

      // 2. Cloudinary-க்கு படங்களை அப்லோட் செய்தல்
      if (carId && selectedImages.length > 0) {
        setAlert({ open: true, msg: 'Uploading images to Cloudinary...', severity: 'info' });
        const uploadedIds: string[] = [];
        try {
          for (let i = 0; i < selectedImages.length; i++) {
            const file = selectedImages[i];
            const res = await uploadImage({ variables: { carId, file, isPrimary: i === 0 } });
            const created = res?.data?.addCarImage;
            if (created?.id) uploadedIds.push(created.id);
          }
          setAlert({ open: true, msg: 'Car and images added successfully!', severity: 'success' });
        } catch (err: any) {
          // Rollback: delete the created car (server will remove uploaded images too)
          try { await deleteCar({ variables: { id: carId } }); } catch (rollbackErr) { console.error('Rollback delete failed', rollbackErr); }
          const message = err?.message || 'Image upload failed; car creation rolled back.';
          setAlert({ open: true, msg: message, severity: 'error' });
          setLoading(false);
          return;
        }
      } else {
        setAlert({ open: true, msg: 'Car added successfully!', severity: 'success' });
      }
      setTimeout(() => router.push('/admin/cars'), 1500);

    } catch (e: any) {
      // 🛑 பிழை மேலாண்மை (User Friendly Error Handling)
      let displayError = e.message;

      if (displayError.includes('plateNumber')) {
        displayError = "இந்த நம்பர் பிளேட் (Plate Number) ஏற்கனவே உள்ளது! தயவுசெய்து சரிபார்க்கவும்.";
      } else if (displayError.includes('createReadStream')) {
        displayError = "Image Upload Error: சர்வர் அமைப்புகளை சரிபார்க்கவும்.";
      }

      setAlert({ open: true, msg: displayError, severity: 'error' });
    } finally {
      setLoading(false);
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
        <Box sx={{ flex: 1, overflowY: 'auto', p: 4 }}>
          {activeTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={brandData?.brands || []}
                  getOptionLabel={(opt: any) => opt.name}
                  value={brandData?.brands?.find((b: any) => b.id === formData.brandId) || null}
                  onChange={(_, v: any) => setFormData({ ...formData, brandId: v?.id || '', modelId: '' })}
                  renderInput={(p) => <TextField {...p} label="Brand" size="small" required fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  disabled={!formData.brandId}
                  options={modelData?.models || []}
                  getOptionLabel={(opt: any) => opt.name}
                  value={modelData?.models?.find((m: any) => m.id === formData.modelId) || null}
                  onChange={(_, v: any) => setFormData({ ...formData, modelId: v?.id || '' })}
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
              <Box component="label" sx={{ height: 120, border: '2px dashed #CBD5E1', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', cursor: 'pointer', '&:hover': { bgcolor: '#F1F5F9' } }}>
                <input hidden accept="image/*" multiple type="file" onChange={handleImageSelect} />
                <CloudUpload sx={{ fontSize: 40, color: '#64748B', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">Click to Upload Photos</Typography>
              </Box>
              <Grid container spacing={1} sx={{ mt: 3 }}>
                {imagePreviews.map((p, i) => (
                  <Grid item xs={3} sm={2} key={i}>
                    <Box sx={{ position: 'relative', height: 80, borderRadius: 2, overflow: 'hidden', border: i === 0 ? '2px solid #293D91' : '1px solid #E2E8F0' }}>
                      <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="car" />
                      {i === 0 && <Box sx={{ position: 'absolute', bottom: 0, width: '100%', bgcolor: '#293D91', color: 'white', fontSize: '10px' }}>MAIN</Box>}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>

        {/* FOOTER */}
        <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={() => router.back()} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading} startIcon={<Save />} sx={{ bgcolor: '#293D91' }}>
            {loading ? <CircularProgress size={20} color="inherit" /> : "Add Car"}
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