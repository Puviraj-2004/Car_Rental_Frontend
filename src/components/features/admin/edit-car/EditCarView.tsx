'use client';

import React, { useMemo } from 'react';
import {
  Box, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Grid, Paper, Tab, Tabs, Typography, IconButton, Autocomplete, 
  Divider, LinearProgress, CircularProgress, Stack, alpha,
  Chip
} from '@mui/material';
import {
  DirectionsCar, Euro, PhotoCamera, CloudUpload, Delete as DeleteIcon, Save
} from '@mui/icons-material';

export const EditCarView = ({
  activeTab, setActiveTab, formData, setFormData,
  brandData, modelData, enumData,
  onInputChange, onImageSelect, existingImages, imagePreviews, primaryImageIndex,
  setPrimaryImageIndex, onRemoveExistingImage, onRemoveNewImage, onSetPrimaryExisting,
  onSubmit, onCancel, isUpdating
}: any) => {

  if (!formData || !modelData?.models) {
    return <Box sx={{ width: '100%', p: 5 }}><LinearProgress /></Box>;
  }

  // Find currently selected brand object
  const selectedBrand = useMemo(() => 
    brandData?.brands?.find((b: any) => b.id === formData.brandId) || null,
  [brandData?.brands, formData.brandId]);

  // Find currently selected model object
  const selectedModel = useMemo(() => 
    modelData.models.find((m: any) => m.id === formData.modelId) || null,
  [modelData.models, formData.modelId]);

  // Filter models to show only those belonging to the selected brand
  const filteredModels = useMemo(() => {
    if (!formData.brandId) return [];
    return modelData.models.filter((m: any) => m.brandId === formData.brandId);
  }, [modelData.models, formData.brandId]);

  const handleBrandChange = (_: any, newBrand: any) => {
    setFormData({ 
      ...formData, 
      brandId: newBrand?.id || '',
      modelId: '' // Reset model when brand changes
    });
  };

  const handleModelChange = (_: any, newModel: any) => {
    setFormData({ 
      ...formData, 
      modelId: newModel?.id || '',
      brandId: newModel?.brandId || formData.brandId // Sync brand if model is picked directly
    });
  };

  return (
    <Paper elevation={0} sx={{ 
      width: '100%', maxWidth: 900, borderRadius: 4, 
      border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: 'white'
    }}>
      {/* 📑 TABS SECTION */}
      <Box sx={{ bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth" 
          sx={{ '& .MuiTab-root': { py: 2, fontWeight: 700, textTransform: 'none' } }}>
          <Tab icon={<DirectionsCar fontSize="small" />} iconPosition="start" label="Vehicle Identity" />
          <Tab icon={<Euro fontSize="small" />} iconPosition="start" label="Price & Limits" />
          <Tab icon={<PhotoCamera fontSize="small" />} iconPosition="start" label="Gallery" />
        </Tabs>
      </Box>

      {/* 📝 FORM CONTENT */}
      <Box sx={{ p: { xs: 3, md: 5 }, minHeight: 450 }}>
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={brandData?.brands || []}
                getOptionLabel={(opt: any) => opt.name}
                value={selectedBrand}
                onChange={handleBrandChange}
                renderInput={(p) => <TextField {...p} label="Brand" size="small" fullWidth />}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                disabled={!formData.brandId}
                options={filteredModels}
                getOptionLabel={(opt: any) => opt.name}
                value={selectedModel}
                onChange={handleModelChange}
                renderInput={(p) => <TextField {...p} label="Model" size="small" required fullWidth />}
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField fullWidth label="Year" name="year" type="number" size="small" required value={formData.year} onChange={onInputChange} />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>CritAir</InputLabel>
                <Select name="critAirRating" value={formData.critAirRating} label="CritAir" onChange={onInputChange as any}>
                  {enumData?.critAirEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Plate Number" name="plateNumber" size="small" required value={formData.plateNumber} onChange={onInputChange} />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Fuel Type</InputLabel>
                <Select name="fuelType" value={formData.fuelType} label="Fuel Type" onChange={onInputChange as any}>
                  {enumData?.fuelTypeEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Transmission</InputLabel>
                <Select name="transmission" value={formData.transmission} label="Transmission" onChange={onInputChange as any}>
                  {enumData?.transmissionEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <TextField fullWidth label="Seats" name="seats" type="number" size="small" value={formData.seats} onChange={onInputChange} />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select name="status" value={formData.status} label="Status" onChange={onInputChange as any}>
                  {enumData?.carStatusEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" label="Price Per Day (€)" name="pricePerDay" type="number" required value={formData.pricePerDay} onChange={onInputChange} InputProps={{ startAdornment: '€ ' }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" label="Security Deposit (€)" name="depositAmount" type="number" value={formData.depositAmount} onChange={onInputChange} InputProps={{ startAdornment: '€ ' }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" label="Daily KM Limit" name="dailyKmLimit" type="number" value={formData.dailyKmLimit} onChange={onInputChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" label="Extra KM Charge (€)" name="extraKmCharge" type="number" value={formData.extraKmCharge} onChange={onInputChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Current Odometer (km)" name="currentOdometer" type="number" value={formData.currentOdometer} onChange={onInputChange} />
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Box>
             <Box component="label" sx={{ 
                height: 140, border: '2px dashed #E2E8F0', borderRadius: 4, 
                display: 'flex', flexDirection: 'column', alignItems: 'center', 
                justifyContent: 'center', bgcolor: '#F8FAFC', cursor: 'pointer', mb: 3,
                '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' }
              }}>
              <input hidden accept="image/*" multiple type="file" onChange={onImageSelect} />
              <CloudUpload sx={{ fontSize: 32, color: '#64748B', mb: 1 }} />
              <Typography variant="body2" fontWeight={600} color="#64748B">Upload Vehicle Images</Typography>
            </Box>
            
            <Grid container spacing={2}>
              {existingImages.map((img: any) => (
                <Grid item xs={4} sm={3} md={2} key={img.id}>
                  <Box sx={{ 
                    position: 'relative', height: 100, borderRadius: 3, overflow: 'hidden', 
                    border: img.isPrimary ? '3px solid #0F172A' : '1px solid #E2E8F0', cursor: 'pointer' 
                  }} onClick={() => onSetPrimaryExisting(img.id)}>
                    <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="car" />
                    {img.isPrimary && <Chip label="MAIN" size="small" sx={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', height: 16, fontSize: 9, bgcolor: '#0F172A', color: 'white' }} />}
                    <IconButton onClick={(e) => { e.stopPropagation(); onRemoveExistingImage(img.id); }} size="small" sx={{ position: 'absolute', top: 4, right: 4, bgcolor: alpha('#EF4444', 0.9), color: 'white', '&:hover': { bgcolor: '#EF4444' } }}>
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
              {imagePreviews.map((p: string, i: number) => (
                <Grid item xs={4} sm={3} md={2} key={i}>
                  <Box sx={{ 
                    position: 'relative', height: 100, borderRadius: 3, overflow: 'hidden', 
                    border: i === primaryImageIndex ? '3px solid #10B981' : '1px solid #E2E8F0', cursor: 'pointer' 
                  }} onClick={() => setPrimaryImageIndex(i)}>
                    <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" />
                    <IconButton onClick={(e) => { e.stopPropagation(); onRemoveNewImage(i); }} size="small" sx={{ position: 'absolute', top: 4, right: 4, bgcolor: alpha('#EF4444', 0.9), color: 'white' }}>
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      {/* 🏁 FOOTER ACTIONS */}
      <Divider />
      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ p: 3, bgcolor: '#F8FAFC' }}>
        <Button onClick={onCancel} sx={{ fontWeight: 700, color: '#64748B', textTransform: 'none' }}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={onSubmit} 
          disabled={isUpdating} 
          startIcon={isUpdating ? <CircularProgress size={18} color="inherit" /> : <Save />} 
          sx={{ 
            bgcolor: '#0F172A', borderRadius: 2.5, px: 4, fontWeight: 700, textTransform: 'none',
            '&:hover': { bgcolor: '#1E293B' }
          }}
        >
          {isUpdating ? 'Updating...' : 'Save Changes'}
        </Button>
      </Stack>
    </Paper>
  );
};