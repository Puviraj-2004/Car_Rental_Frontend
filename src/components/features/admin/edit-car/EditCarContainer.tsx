'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEditCar } from '@/hooks/graphql/useEditCar';
import { EditCarView } from './EditCarView';
import { Snackbar, Alert, Box } from '@mui/material';

export const EditCarContainer = ({ id }: { id: string }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [alert, setAlert] = useState({ open: false, msg: '', severity: 'info' as any });
  
  const [formData, setFormData] = useState<any>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(-1);

  const { 
    carData, carLoading, carError, brandData, enumData, modelData,
    updateCar, uploadCarImages, deleteCarImage, setPrimaryCarImage 
  } = useEditCar(id, formData?.brandId || '');

  useEffect(() => {
    if (carData) {
      const { __typename, images, brand, model, createdAt, updatedAt, ...rest } = carData;
      setFormData({ ...rest, brandId: brand?.id || '', modelId: model?.id || '' });
      setExistingImages(images || []);
    }
  }, [carData]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    const numericFields = ['year', 'pricePerDay', 'depositAmount', 'dailyKmLimit', 'extraKmCharge', 'currentOdometer', 'seats'];
    setFormData((p: any) => ({
      ...p,
      [name]: numericFields.includes(name) ? (value === '' ? null : Number(value)) : value
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(p => [...p, ...files]);
    files.forEach(f => {
      const r = new FileReader();
      r.onloadend = () => setImagePreviews(p => [...p, r.result as string]);
      r.readAsDataURL(f);
    });
  };

  const handleSetPrimaryExisting = async (imageId: string) => {
    try {
      await setPrimaryCarImage({ variables: { carId: id, imageId } });
      setExistingImages(p => p.map(i => ({ ...i, isPrimary: i.id === imageId })));
      setAlert({ open: true, msg: 'Primary image updated', severity: 'success' });
    } catch (e) { setAlert({ open: true, msg: 'Failed to update primary', severity: 'error' }); }
  };

  const handleSubmit = async () => {
    if (!formData.modelId || !formData.plateNumber) {
      setAlert({ open: true, msg: 'Please fill required fields', severity: 'warning' });
      return;
    }

    setIsUpdating(true);
    try {
      const { brandId, ...cleanInput } = formData;
      await updateCar({ variables: { id, input: cleanInput } });

      if (selectedImages.length > 0) {
        for (let i = 0; i < selectedImages.length; i++) {
          await uploadCarImages({ 
            variables: { carId: id, file: selectedImages[i], isPrimary: i === primaryImageIndex } 
          });
        }
      }
      router.push('/admin/cars');
    } catch (err: any) {
      setAlert({ open: true, msg: err.message, severity: 'error' });
      setIsUpdating(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <EditCarView 
        activeTab={activeTab} setActiveTab={setActiveTab}
        formData={formData} setFormData={setFormData}
        brandData={brandData} modelData={modelData} enumData={enumData}
        onInputChange={handleInputChange} onImageSelect={handleImageSelect}
        existingImages={existingImages} imagePreviews={imagePreviews}
        primaryImageIndex={primaryImageIndex} setPrimaryImageIndex={setPrimaryImageIndex}
        onRemoveExistingImage={(imgId: string) => deleteCarImage({ variables: { imageId: imgId } }).then(() => setExistingImages(p => p.filter(x => x.id !== imgId)))}
        onRemoveNewImage={(idx: number) => { setSelectedImages(p => p.filter((_, i) => i !== idx)); setImagePreviews(p => p.filter((_, i) => i !== idx)); }}
        onSetPrimaryExisting={handleSetPrimaryExisting}
        onSubmit={handleSubmit} onCancel={() => router.back()}
        isUpdating={isUpdating} isLoading={carLoading}
      />
      <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })}>
        <Alert severity={alert.severity}>{alert.msg}</Alert>
      </Snackbar>
    </Box>
  );
};