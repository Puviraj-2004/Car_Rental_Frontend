'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAddCar } from '@/hooks/graphql/useAddCar';
import { AddCarView } from './AddCarView';
import { Box, Snackbar, Alert } from '@mui/material';

export const AddCarContainer = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ open: false, msg: '', severity: 'info' as any });

  const [formData, setFormData] = useState({
    brandId: '', modelId: '', year: new Date().getFullYear(),
    plateNumber: '', fuelType: '', transmission: '',
    seats: 5, requiredLicense: '', pricePerDay: 0, depositAmount: 0,
    dailyKmLimit: null as number | null, extraKmCharge: 0,
    currentOdometer: 0, critAirRating: '', status: ''
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  const { enumData, brandData, modelData, createCar, uploadImage, deleteCar } = useAddCar(formData.brandId);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['year', 'pricePerDay', 'depositAmount', 'dailyKmLimit', 'extraKmCharge', 'currentOdometer', 'seats'].includes(name) 
        ? (value === '' ? null : Number(value)) : value
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
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!formData.modelId || !formData.plateNumber || !formData.pricePerDay || formData.currentOdometer === 0) {
      setAlert({ open: true, msg: 'Please fill all required fields!', severity: 'warning' });
      setIsSubmitting(false);
      return;
    }

    try {
      const { brandId, ...carInput } = formData;
      const { data } = await createCar({ variables: { input: carInput } });
      const carId = data?.createCar?.id;

      if (carId && selectedImages.length > 0) {
        try {
          for (let i = 0; i < selectedImages.length; i++) {
            await uploadImage({ 
                variables: { carId, file: selectedImages[i], isPrimary: i === primaryImageIndex } 
            });
          }
        } catch (err: any) {
          await deleteCar({ variables: { id: carId } });
          throw new Error('Image upload failed; car creation rolled back.');
        }
      }
      setAlert({ open: true, msg: 'Car added successfully!', severity: 'success' });
      setTimeout(() => router.push('/admin/cars'), 1500);
    } catch (e: any) {
      setAlert({ open: true, msg: e.message, severity: 'error' });
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <AddCarView 
        activeTab={activeTab} setActiveTab={setActiveTab}
        formData={formData} setFormData={setFormData}
        brandData={brandData} modelData={modelData} enumData={enumData}
        onInputChange={handleInputChange} onImageSelect={handleImageSelect}
        imagePreviews={imagePreviews} primaryImageIndex={primaryImageIndex}
        setPrimaryImageIndex={setPrimaryImageIndex}
        onRemoveNewImage={(idx: number) => {
            setSelectedImages(p => p.filter((_, i) => i !== idx));
            setImagePreviews(p => p.filter((_, i) => i !== idx));
        }}
        onSubmit={handleSubmit} onCancel={() => router.back()}
        isSubmitting={isSubmitting}
      />
      <Snackbar open={alert.open} autoHideDuration={4000} onClose={() => setAlert({ ...alert, open: false })}>
        <Alert severity={alert.severity}>{alert.msg}</Alert>
      </Snackbar>
    </Box>
  );
};