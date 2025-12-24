'use client';

import React, { useState } from 'react';
import {
  Box, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Grid, Paper, Tab, Tabs, Snackbar, Alert, Autocomplete, Stack, Typography, Divider
} from '@mui/material';
import { DirectionsCar, Euro, PhotoCamera, Save, Close, CloudUpload } from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';

import { CREATE_CAR_MUTATION, UPLOAD_CAR_IMAGES_MUTATION } from '@/lib/graphql/mutations';
import { GET_CAR_ENUMS, GET_BRANDS_QUERY, GET_MODELS_QUERY, GET_CARS_QUERY } from '@/lib/graphql/queries';

export default function AddCarPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, msg: '', severity: 'info' as any });

  // Queries
  const { data: enumData } = useQuery(GET_CAR_ENUMS);
  const { data: brandData } = useQuery(GET_BRANDS_QUERY);

  // Form State
  const [formData, setFormData] = useState({
    brandId: '', modelId: '', year: new Date().getFullYear(),
    plateNumber: '', fuelType: '', transmission: '',
    seats: 5, pricePerHour: 0, pricePerKm: 0, pricePerDay: 0,
    critAirRating: 'CRIT_AIR_3', status: 'AVAILABLE', descriptionEn: '', descriptionFr: ''
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
    <Box sx={{ 
      height: 'calc(100vh - 80px)', // Fits within dashboard view without scrolling page
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          width: '100%', 
          maxWidth: 900, 
          height: '100%',
          maxHeight: 650, // Limits height so it fits on small laptops
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden', // Prevents outer scroll
          border: '1px solid #E2E8F0'
        }}
      >
        
        {/* HEADER: Tabs */}
        <Box sx={{ bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, v) => setActiveTab(v)} 
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<DirectionsCar fontSize="small" />} iconPosition="start" label="Identity" sx={{ minHeight: 60 }}/>
            <Tab icon={<Euro fontSize="small" />} iconPosition="start" label="Pricing" sx={{ minHeight: 60 }}/>
            <Tab icon={<PhotoCamera fontSize="small" />} iconPosition="start" label="Media" sx={{ minHeight: 60 }}/>
          </Tabs>
        </Box>

        {/* BODY: Scrollable Form Content */}
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto', // Only this part scrolls if screen is too small
          p: 4,
          bgcolor: '#fff'
        }}>
          
          {/* TAB 1: IDENTITY */}
          {activeTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={brandData?.brands || []}
                  getOptionLabel={(opt: any) => opt.name}
                  onChange={(_, v: any) => setFormData({ ...formData, brandId: v?.id || '', modelId: '' })}
                  renderInput={(p) => <TextField {...p} label="Brand" size="small" required fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  disabled={!formData.brandId}
                  options={modelData?.models || []}
                  getOptionLabel={(opt: any) => opt.name}
                  onChange={(_, v: any) => setFormData({ ...formData, modelId: v?.id || '' })}
                  renderInput={(p) => <TextField {...p} label="Model" size="small" required fullWidth />}
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField fullWidth label="Year" name="year" type="number" size="small" onChange={handleInputChange} value={formData.year} />
              </Grid>

              <Grid item xs={6} md={4}>
                <TextField fullWidth label="Plate Number" name="plateNumber" size="small" onChange={handleInputChange} value={formData.plateNumber} />
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
                <TextField fullWidth label="Seats" name="seats" type="number" size="small" onChange={handleInputChange} value={formData.seats} />
              </Grid>
            </Grid>
          )}

          {/* TAB 2: PRICING */}
          {activeTab === 1 && (
            <Box sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>Set your rates</Typography>
                </Grid>
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
                  <FormControl fullWidth size="small">
                    <InputLabel>Availability Status</InputLabel>
                    <Select name="status" value={formData.status} label="Availability Status" onChange={handleInputChange}>
                      {enumData?.carStatusEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB 3: MEDIA */}
          {activeTab === 2 && (
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Box component="label" sx={{ 
                height: 120, 
                border: '2px dashed #CBD5E1', 
                borderRadius: 3, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                bgcolor: '#F8FAFC', 
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#F1F5F9', borderColor: '#293D91' }
              }}>
                <input hidden accept="image/*" multiple type="file" onChange={handleImageSelect} />
                <CloudUpload sx={{ fontSize: 40, color: '#64748B', mb: 1 }} /> 
                <Typography variant="body2" color="textSecondary" fontWeight="bold">Click to Upload Photos</Typography>
              </Box>

              <Grid container spacing={1} sx={{ mt: 3 }}>
                {imagePreviews.map((p, i) => (
                  <Grid item xs={3} sm={2} key={i}>
                    <Box sx={{ 
                      position: 'relative', 
                      height: 80, 
                      borderRadius: 2, 
                      overflow: 'hidden', 
                      border: i === 0 ? '2px solid #293D91' : '1px solid #E2E8F0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="car" />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>

        {/* FOOTER: Fixed Actions */}
        <Box sx={{ 
          p: 2, 
          bgcolor: '#fff', 
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2
        }}>
          <Button 
            variant="text" 
            color="inherit" 
            onClick={() => router.back()} 
            sx={{ fontWeight: 600, color: '#64748B' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            disabled={loading} 
            startIcon={<Save />}
            sx={{ 
              px: 4, 
              borderRadius: 2,
              fontWeight: 'bold',
              bgcolor: '#293D91',
              '&:hover': { bgcolor: '#1a2a6b' }
            }}
          >
            {loading ? "Saving..." : "Add Car"}
          </Button>
        </Box>

      </Paper>
      
      <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })}>
        <Alert severity={alert.severity} variant="filled">{alert.msg}</Alert>
      </Snackbar>
    </Box>
  );
}