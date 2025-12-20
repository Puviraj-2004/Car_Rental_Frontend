'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Grid,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  SelectChangeEvent,
  ImageList,
  ImageListItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { CREATE_CAR_MUTATION, UPLOAD_CAR_IMAGES_MUTATION } from '@/lib/graphql/mutations';

export default function AddCarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    plateNumber: '',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    seats: 5,
    doors: 4,
    pricePerHour: 0,
    pricePerKm: 0,
    pricePerDay: 0,
    critAirRating: 3,
    availability: true,
    descriptionEn: '',
    descriptionFr: '',
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [createCar] = useMutation(CREATE_CAR_MUTATION, {
    onCompleted: (data) => {
      setSuccess(true);
      setError('');
      setTimeout(() => {
        router.push('/admin/cars');
      }, 2000);
    },
    onError: (err) => {
      setError(err.message || 'Failed to create car');
      setSuccess(false);
    },
  });

  const [uploadCarImages] = useMutation(UPLOAD_CAR_IMAGES_MUTATION, {
    onError: (err) => {
      console.error('Error uploading images:', err);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['year', 'seats', 'doors', 'pricePerHour', 'pricePerKm', 'pricePerDay', 'critAirRating'].includes(name)
        ? isNaN(Number(value))
          ? 0
          : Number(value)
        : value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First, create the car
      const carResult = await createCar({
        variables: {
          input: {
            ...formData,
            year: parseInt(String(formData.year)),
            seats: parseInt(String(formData.seats)),
            doors: parseInt(String(formData.doors)),
            pricePerHour: parseFloat(String(formData.pricePerHour)),
            pricePerKm: parseFloat(String(formData.pricePerKm)),
            pricePerDay: parseFloat(String(formData.pricePerDay)),
            critAirRating: parseInt(String(formData.critAirRating)),
          },
        },
      });

      // Then, upload images if any
      if (selectedImages.length > 0 && carResult.data?.createCar?.id) {
        const carId = carResult.data.createCar.id;

        try {
          // Upload images
          await uploadCarImages({
            variables: {
              input: {
                carId,
                images: selectedImages,
                altTexts: selectedImages.map((_, i) => `Car Image ${i + 1}`),
                primaryIndex: 0, // First image is primary
              },
            },
          });
        } catch (imageErr) {
          console.warn('Warning: Car created but image upload failed:', imageErr);
          // Continue anyway - car was created successfully
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create car. Make sure the backend is running at http://localhost:4000');
      console.error('Error details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
          Add New Car
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the car details to add a new vehicle to your fleet
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Car added successfully! Redirecting to cars list...
        </Alert>
      )}

      {/* Form */}
      <Card sx={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Vehicle Information */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1E293B' }}>
                    Vehicle Information
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Brand"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Model"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Year"
                        name="year"
                        type="number"
                        value={formData.year}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Plate Number"
                        name="plateNumber"
                        value={formData.plateNumber}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Fuel Type</InputLabel>
                        <Select name="fuelType" value={formData.fuelType} onChange={handleSelectChange} label="Fuel Type">
                          <MenuItem value="PETROL">Petrol</MenuItem>
                          <MenuItem value="DIESEL">Diesel</MenuItem>
                          <MenuItem value="ELECTRIC">Electric</MenuItem>
                          <MenuItem value="HYBRID">Hybrid</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Transmission</InputLabel>
                        <Select name="transmission" value={formData.transmission} onChange={handleSelectChange} label="Transmission">
                          <MenuItem value="MANUAL">Manual</MenuItem>
                          <MenuItem value="AUTOMATIC">Automatic</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Seats"
                        name="seats"
                        type="number"
                        value={formData.seats}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Doors"
                        name="doors"
                        type="number"
                        value={formData.doors}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Pricing Information */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1E293B' }}>
                    Pricing
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Price per Hour"
                        name="pricePerHour"
                        type="number"
                        inputProps={{ step: '0.01' }}
                        value={formData.pricePerHour}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        prefix="€"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Price per Km"
                        name="pricePerKm"
                        type="number"
                        inputProps={{ step: '0.01' }}
                        value={formData.pricePerKm}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Price per Day"
                        name="pricePerDay"
                        type="number"
                        inputProps={{ step: '0.01' }}
                        value={formData.pricePerDay}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Additional Information */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1E293B' }}>
                    Additional Information
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Crit'Air Rating</InputLabel>
                        <Select name="critAirRating" value={formData.critAirRating} onChange={handleSelectChange} label="Crit'Air Rating">
                          <MenuItem value={0}>0 - Very Low Emissions</MenuItem>
                          <MenuItem value={1}>1 - Electric/Hydrogen</MenuItem>
                          <MenuItem value={2}>2 - Euro 5/6</MenuItem>
                          <MenuItem value={3}>3 - Euro 4</MenuItem>
                          <MenuItem value={4}>4 - Euro 3</MenuItem>
                          <MenuItem value={5}>5 - Euro 2</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={<Switch name="availability" checked={formData.availability} onChange={handleSwitchChange} />}
                        label="Available for Booking"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description (English)"
                        name="descriptionEn"
                        value={formData.descriptionEn}
                        onChange={handleInputChange}
                        multiline
                        rows={3}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description (French)"
                        name="descriptionFr"
                        value={formData.descriptionFr}
                        onChange={handleInputChange}
                        multiline
                        rows={3}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Image Upload Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1E293B' }}>
                    Car Images
                  </Typography>

                  {/* Upload Button */}
                  <Box sx={{ mb: 3 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      sx={{ textTransform: 'none' }}
                    >
                      Select Images
                      <input
                        hidden
                        accept="image/*"
                        multiple
                        type="file"
                        onChange={handleImageSelect}
                      />
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Select one or more images. First selected image will be set as primary.
                    </Typography>
                  </Box>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Selected Images ({imagePreviews.length})
                      </Typography>
                      <ImageList sx={{ width: '100%' }} cols={4} rowHeight={200} gap={12}>
                        {imagePreviews.map((preview, index) => (
                          <ImageListItem key={index} sx={{ position: 'relative' }}>
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '8px',
                              }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bottom: 0,
                                left: 0,
                                backgroundColor: 'rgba(0,0,0,0)',
                                transition: 'background-color 0.3s',
                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                                '& button': {
                                  opacity: 0,
                                  transition: 'opacity 0.3s',
                                },
                                '&:hover button': {
                                  opacity: 1,
                                },
                              }}
                            >
                              <IconButton
                                onClick={() => handleRemoveImage(index)}
                                sx={{
                                  backgroundColor: 'rgba(255,255,255,0.1)',
                                  color: 'white',
                                  '&:hover': { backgroundColor: 'rgba(255,0,0,0.7)' },
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                            {index === 0 && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: 8,
                                  left: 8,
                                  backgroundColor: '#293D91',
                                  color: 'white',
                                  px: 2,
                                  py: 0.5,
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                }}
                              >
                                PRIMARY
                              </Box>
                            )}
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </Box>
                  )}

                  {imagePreviews.length === 0 && (
                    <Box
                      sx={{
                        border: '2px dashed #cbd5e1',
                        borderRadius: '8px',
                        p: 4,
                        textAlign: 'center',
                        color: 'text.secondary',
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                      <Typography>No images selected yet. Click "Select Images" to add car photos.</Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Submit Buttons */}
              <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/admin/cars')}
                  disabled={loading}
                  sx={{ textTransform: 'none', px: 3 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    backgroundColor: '#293D91',
                    textTransform: 'none',
                    px: 3,
                    '&:hover': { backgroundColor: '#1E293B' },
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Add Car'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
