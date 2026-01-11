'use client';

import React from 'react';
import {
  Box, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Grid, Paper, Tab, Tabs, Typography, IconButton, Stack, Autocomplete, 
  Divider, Chip, CircularProgress
} from '@mui/material';
import {
  DirectionsCar, Euro, PhotoCamera, Save, CloudUpload, Delete as DeleteIcon
} from '@mui/icons-material';

interface AddCarViewProps {
  activeTab: number;
  setActiveTab: (value: number) => void;
  formData: any;
  setFormData: (data: any) => void;
  brandData: any;
  modelData: any;
  enumData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => void;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreviews: string[];
  primaryImageIndex: number;
  setPrimaryImageIndex: (index: number) => void;
  onRemoveNewImage: (index: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const AddCarView = ({
  activeTab,
  setActiveTab,
  formData,
  setFormData,
  brandData,
  modelData,
  enumData,
  onInputChange,
  onImageSelect,
  imagePreviews,
  primaryImageIndex,
  setPrimaryImageIndex,
  onRemoveNewImage,
  onSubmit,
  onCancel,
  isSubmitting
}: AddCarViewProps) => {

  return (
    <Paper elevation={3} sx={{ width: '100%', maxWidth: 900, height: '100%', maxHeight: 680, display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
      <Box sx={{ bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
          <Tab icon={<DirectionsCar fontSize="small" />} iconPosition="start" label="Identity" />
          <Tab icon={<Euro fontSize="small" />} iconPosition="start" label="Pricing" />
          <Tab icon={<PhotoCamera fontSize="small" />} iconPosition="start" label="Media" />
        </Tabs>
      </Box>

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
            <Grid item xs={6} md={3}><TextField fullWidth label="Year" name="year" type="number" size="small" required value={formData.year} onChange={onInputChange} /></Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small" required>
                <InputLabel>CritAir</InputLabel>
                <Select name="critAirRating" value={formData.critAirRating} label="CritAir" onChange={onInputChange as any}>
                  {enumData?.critAirEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Plate Number" name="plateNumber" size="small" required value={formData.plateNumber} onChange={onInputChange} /></Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Fuel Type</InputLabel>
                <Select name="fuelType" value={formData.fuelType} label="Fuel Type" onChange={onInputChange as any}>
                  {enumData?.fuelTypeEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Transmission</InputLabel>
                <Select name="transmission" value={formData.transmission} label="Transmission" onChange={onInputChange as any}>
                  {enumData?.transmissionEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}><TextField fullWidth label="Seats" name="seats" type="number" size="small" required value={formData.seats} onChange={onInputChange} /></Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small" required>
                <InputLabel>License</InputLabel>
                <Select name="requiredLicense" value={formData.requiredLicense} label="License" onChange={onInputChange as any}>
                  {enumData?.licenseCategoryEnum?.enumValues.map((e: any) => <MenuItem key={e.name} value={e.name}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
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
            <Grid item xs={12}><Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#293D91' }}>💰 Pricing & Deposits</Typography></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Price Per Day (€)" name="pricePerDay" type="number" required value={formData.pricePerDay || ''} onChange={onInputChange} InputProps={{ startAdornment: '€' }} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Security Deposit (€)" name="depositAmount" type="number" value={formData.depositAmount || ''} onChange={onInputChange} InputProps={{ startAdornment: '€' }} /></Grid>
            <Grid item xs={12}><Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#293D91' }}>🚗 KM Limits & Meter Tracking</Typography></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Daily KM Limit" name="dailyKmLimit" type="number" value={formData.dailyKmLimit || ''} onChange={onInputChange} InputProps={{ endAdornment: formData.dailyKmLimit ? 'km/day' : null }} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Extra KM Charge (€)" name="extraKmCharge" type="number" required value={formData.extraKmCharge || ''} onChange={onInputChange} InputProps={{ startAdornment: '€' }} /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Current Odometer (km)" name="currentOdometer" type="number" required value={formData.currentOdometer || ''} onChange={onInputChange} /></Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            <Box component="label" sx={{ height: 120, border: '2px dashed #CBD5E1', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', cursor: 'pointer', mb: 3 }}>
              <input hidden accept="image/*" multiple type="file" onChange={onImageSelect} />
              <CloudUpload sx={{ fontSize: 40, color: '#64748B', mb: 1 }} />
              <Typography variant="body2" color="textSecondary">Click to Upload Photos</Typography>
            </Box>
            <Grid container spacing={1}>
              {imagePreviews.map((p: string, i: number) => (
                <Grid item xs={3} sm={2} key={i}>
                  <Box sx={{ position: 'relative', height: 80, borderRadius: 2, overflow: 'hidden', border: i === primaryImageIndex ? '2px solid #293D91' : '1px solid #E2E8F0', cursor: 'pointer' }} onClick={() => setPrimaryImageIndex(i)}>
                    <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" />
                    {i === primaryImageIndex && <Box sx={{ position: 'absolute', bottom: 0, width: '100%', bgcolor: '#293D91', color: 'white', fontSize: '10px', textAlign: 'center' }}>MAIN</Box>}
                    <IconButton onClick={(e) => { e.stopPropagation(); onRemoveNewImage(i); }} size="small" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,0,0,0.7)', color: 'white' }}>
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel} color="inherit">Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={isSubmitting} startIcon={<Save />} sx={{ bgcolor: '#293D91' }}>
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Add Car'}
        </Button>
      </Box>
    </Paper>
  );
};