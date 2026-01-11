'use client';

import React from 'react';
import {
  Box, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Grid, Paper, Tab, Tabs, Typography, IconButton, Stack, Autocomplete, 
  Divider, Chip, Alert, LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  DirectionsCar, Euro, PhotoCamera, Save, CloudUpload, Delete as DeleteIcon
} from '@mui/icons-material';

export const EditCarView = ({
  activeTab, setActiveTab, formData, setFormData, brandData, modelData, enumData,
  onInputChange, onImageSelect, existingImages, imagePreviews, primaryImageIndex,
  setPrimaryImageIndex, onRemoveExistingImage, onRemoveNewImage, onSetPrimaryExisting,
  onSubmit, onCancel, isUpdating, isLoading
}: any) => {

  if (isLoading) return <Box sx={{ p: 5, textAlign: 'center' }}><LinearProgress /></Box>;

  return (
    <Paper elevation={0} sx={{ width: '100%', maxWidth: 900, borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
      <Box sx={{ bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
          <Tab icon={<DirectionsCar fontSize="small" />} iconPosition="start" label="Identity" />
          <Tab icon={<Euro fontSize="small" />} iconPosition="start" label="Pricing" />
          <Tab icon={<PhotoCamera fontSize="small" />} iconPosition="start" label="Media" />
        </Tabs>
      </Box>

      <Box sx={{ p: 4, minHeight: 400 }}>
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={brandData?.brands || []}
                getOptionLabel={(opt: any) => opt.name}
                value={brandData?.brands.find((b: any) => b.id === formData.brandId) || null}
                onChange={(_, val: any) => setFormData({ ...formData, brandId: val?.id || '', modelId: '' })}
                renderInput={(p) => <TextField {...p} label="Brand" size="small" />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                disabled={!formData.brandId}
                options={modelData?.models || []}
                getOptionLabel={(opt: any) => opt.name}
                value={modelData?.models.find((m: any) => m.id === formData.modelId) || null}
                onChange={(_, val: any) => setFormData({ ...formData, modelId: val?.id || '' })}
                renderInput={(p) => <TextField {...p} label="Model" size="small" required />}
              />
            </Grid>
            <Grid item xs={6} md={3}><TextField fullWidth label="Year" name="year" type="number" size="small" value={formData.year} onChange={onInputChange} /></Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>CritAir</InputLabel>
                <Select name="critAirRating" value={formData.critAirRating} label="CritAir" onChange={onInputChange}>
                  {enumData?.critAirEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Plate Number" name="plateNumber" size="small" value={formData.plateNumber} onChange={onInputChange} /></Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Transmission</InputLabel>
                <Select name="transmission" value={formData.transmission} label="Transmission" onChange={onInputChange}>
                  {enumData?.transmissionEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}><TextField fullWidth label="Seats" name="seats" type="number" size="small" value={formData.seats} onChange={onInputChange} /></Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select name="status" value={formData.status} label="Status" onChange={onInputChange}>
                  {enumData?.carStatusEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Price Per Day (€)" name="pricePerDay" type="number" value={formData.pricePerDay} onChange={onInputChange} InputProps={{ startAdornment: '€' }} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Security Deposit (€)" name="depositAmount" type="number" value={formData.depositAmount} onChange={onInputChange} InputProps={{ startAdornment: '€' }} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Daily KM Limit" name="dailyKmLimit" type="number" value={formData.dailyKmLimit || ''} onChange={onInputChange} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Current Odometer (km)" name="currentOdometer" type="number" value={formData.currentOdometer} onChange={onInputChange} /></Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Box>
            <Box component="label" sx={{ height: 120, border: '2px dashed #CBD5E1', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', cursor: 'pointer', mb: 3 }}>
              <input hidden accept="image/*" multiple type="file" onChange={onImageSelect} />
              <CloudUpload sx={{ fontSize: 40, color: '#64748B', mb: 1 }} />
              <Typography variant="body2">Click to Upload Photos</Typography>
            </Box>

            <Grid container spacing={2}>
              {existingImages.map((img: any) => (
                <Grid item xs={4} sm={3} md={2} key={img.id}>
                  <Box sx={{ position: 'relative', height: 100, borderRadius: 2, overflow: 'hidden', border: img.isPrimary ? '3px solid #293D91' : '1px solid #E2E8F0' }}>
                    <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onClick={() => onSetPrimaryExisting(img.id)} />
                    <IconButton size="small" onClick={() => onRemoveExistingImage(img.id)} sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,0,0,0.8)', color: 'white', '&:hover': { bgcolor: 'red' } }}>
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
              {imagePreviews.map((p: string, i: number) => (
                <Grid item xs={4} sm={3} md={2} key={i}>
                  <Box sx={{ position: 'relative', height: 100, borderRadius: 2, overflow: 'hidden', border: i === primaryImageIndex ? '3px solid #10B981' : '1px solid #E2E8F0' }}>
                    <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onClick={() => setPrimaryImageIndex(i)} />
                    <IconButton size="small" onClick={() => onRemoveNewImage(i)} sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.6)', color: 'white' }}>
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      <Box sx={{ p: 3, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel} disabled={isUpdating}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={isUpdating} sx={{ bgcolor: '#0F172A', px: 4, fontWeight: 700 }}>
          {isUpdating ? <CircularProgress size={24} color="inherit" /> : 'Update Car'}
        </Button>
      </Box>
    </Paper>
  );
};