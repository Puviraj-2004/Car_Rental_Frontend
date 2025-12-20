'use client';

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter, useParams } from 'next/navigation';
import { UPDATE_CAR_MUTATION, UPLOAD_CAR_IMAGES_MUTATION, DELETE_CAR_IMAGE_MUTATION } from '@/lib/graphql/mutations';
import { GET_CAR_QUERY } from '@/lib/graphql/queries';

export default function EditCarPage() {
  const router = useRouter();
  const params = useParams();
  const carId = params.id as string;

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
  const [existingImages, setExistingImages] = useState<any[]>([]);

  const { loading: carLoading, data: carData } = useQuery(GET_CAR_QUERY, {
    variables: { id: carId },
    onCompleted: (data) => {
      if (data.car) {
        setFormData({
          brand: data.car.brand,
          model: data.car.model,
          year: data.car.year,
          plateNumber: data.car.plateNumber,
          fuelType: data.car.fuelType,
          transmission: data.car.transmission,
          seats: data.car.seats,
          doors: data.car.doors,
          pricePerHour: data.car.pricePerHour,
          pricePerKm: data.car.pricePerKm,
          pricePerDay: data.car.pricePerDay,
          critAirRating: data.car.critAirRating,
          availability: data.car.availability,
          descriptionEn: data.car.descriptionEn || '',
          descriptionFr: data.car.descriptionFr || '',
        });
        setExistingImages(data.car.images || []);
      }
    },
  });

  const [updateCar] = useMutation(UPDATE_CAR_MUTATION, {
    onCompleted: () => {
      setSuccess(true);
      setError('');
      setTimeout(() => {
        router.push('/admin/cars');
      }, 2000);
    },
    onError: (err) => {
      setError(err.message || 'Failed to update car');
      setSuccess(false);
    },
  });

  const [uploadCarImages] = useMutation(UPLOAD_CAR_IMAGES_MUTATION, {
    onError: (err) => {
      console.error('Error uploading images:', err);
    },
  });

  const [deleteCarImage] = useMutation(DELETE_CAR_IMAGE_MUTATION, {
    onCompleted: () => {
      setExistingImages((prev) => prev.filter((img) => img.id !== deleteCarImage));
    },
    onError: (err) => {
      console.error('Error deleting image:', err);
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

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveNewImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    try {
      await deleteCarImage({
        variables: { imageId },
      });
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Update car details
      await updateCar({
        variables: {
          id: carId,
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

      // Upload new images if any
      if (selectedImages.length > 0) {
        await uploadCarImages({
          variables: {
            input: {
              carId,
              images: selectedImages,
              altTexts: selectedImages.map((_, i) => `Car Image ${i + 1}`),
              primaryIndex: existingImages.length === 0 ? 0 : -1,
            },
          },
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update car');
    } finally {
      setLoading(false);
    }
  };

  if (carLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
          Edit Car
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update car details and manage images
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
          Car updated successfully! Redirecting...
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
                      <TextField fullWidth label="Brand" name="brand" value={formData.brand} onChange={handleInputChange} required variant="outlined" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Model" name="model" value={formData.model} onChange={handleInputChange} required variant="outlined" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Year" name="year" type="number" value={formData.year} onChange={handleInputChange} required variant="outlined" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Plate Number" name="plateNumber" value={formData.plateNumber} onChange={handleInputChange} required variant="outlined" />
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
                      <TextField fullWidth label="Seats" name="seats" type="number" value={formData.seats} onChange={handleInputChange} required variant="outlined" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Doors" name="doors" type="number" value={formData.doors} onChange={handleInputChange} required variant="outlined" />
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
                      <TextField fullWidth label="Price per Hour" name="pricePerHour" type="number" inputProps={{ step: '0.01' }} value={formData.pricePerHour} onChange={handleInputChange} required variant="outlined" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField fullWidth label="Price per Km" name="pricePerKm" type="number" inputProps={{ step: '0.01' }} value={formData.pricePerKm} onChange={handleInputChange} required variant="outlined" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField fullWidth label="Price per Day" name="pricePerDay" type="number" inputProps={{ step: '0.01' }} value={formData.pricePerDay} onChange={handleInputChange} required variant="outlined" />
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
                      <FormControlLabel control={<Switch name="availability" checked={formData.availability} onChange={handleSwitchChange} />} label="Available for Booking" />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Description (English)" name="descriptionEn" value={formData.descriptionEn} onChange={handleInputChange} multiline rows={3} variant="outlined" />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Description (French)" name="descriptionFr" value={formData.descriptionFr} onChange={handleInputChange} multiline rows={3} variant="outlined" />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1E293B' }}>
                      Current Images
                    </Typography>

                    <ImageList sx={{ width: '100%' }} cols={4} rowHeight={200} gap={12}>
                      {existingImages.map((image) => (
                        <ImageListItem key={image.id} sx={{ position: 'relative' }}>
                          <img
                            src={image.imagePath}
                            alt={image.altText || 'Car image'}
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
                            }}
                          >
                            <IconButton
                              onClick={() => handleRemoveExistingImage(image.id)}
                              sx={{
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                opacity: 0,
                                transition: 'opacity 0.3s',
                                '&:hover': { opacity: 1, backgroundColor: 'rgba(255,0,0,0.7)' },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                          {image.isPrimary && (
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
                  </Paper>
                </Grid>
              )}

              {/* Add More Images */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1E293B' }}>
                    Add More Images
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      sx={{ textTransform: 'none' }}
                    >
                      Select Images
                      <input hidden accept="image/*" multiple type="file" onChange={handleImageSelect} />
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Select one or more images to add to this car.
                    </Typography>
                  </Box>

                  {/* New Image Previews */}
                  {imagePreviews.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        New Images ({imagePreviews.length})
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
                              }}
                            >
                              <IconButton
                                onClick={() => handleRemoveNewImage(index)}
                                sx={{
                                  backgroundColor: 'rgba(255,255,255,0.1)',
                                  color: 'white',
                                  opacity: 0,
                                  transition: 'opacity 0.3s',
                                  '&:hover': { opacity: 1, backgroundColor: 'rgba(255,0,0,0.7)' },
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
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
                      <Typography>No new images selected. Click "Select Images" to add more photos.</Typography>
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
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Update Car'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
