'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useEditCar } from '@/hooks/graphql/useEditCar';
import { EditCarView } from './EditCarView';
import { Snackbar, Alert, Box, LinearProgress } from '@mui/material';
import { GET_CARS_QUERY } from '@/lib/graphql/queries';

export const EditCarContainer = ({ id }: { id: string }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [alert, setAlert] = useState({ open: false, msg: '', severity: 'info' as any });

  const [formData, setFormData] = useState<any>({
    modelId: "",
    brandId: "", 
    year: new Date().getFullYear(),
    plateNumber: "",
    transmission: "AUTOMATIC",
    fuelType: "PETROL",
    seats: 5,
    pricePerDay: 0,
    depositAmount: 0,
    dailyKmLimit: 100,
    extraKmCharge: 0,
    currentOdometer: 0,
    critAirRating: "CRIT_AIR_1",
    status: "AVAILABLE",
    requiredLicense: "B",
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(-1);

  const { 
    carData, carLoading, brandData, enumData, modelData,
    updateCar, uploadCarImages, deleteCarImage, setPrimaryCarImage 
  } = useEditCar(id, formData.brandId);

  // Data load aagum pothu Brand matrum Model-ai set seikirom
  useEffect(() => {
    if (carData) {
      const { __typename, images, createdAt, updatedAt, model, id: carId, ...rest } = carData;
      setFormData((prev: any) => ({
        ...prev,
        ...rest,
        modelId: model?.id || "",
        brandId: carData?.brand?.id || "" 
      }));
      setExistingImages(images || []);

      const primaryExistingImage = images?.find((img: any) => img.isPrimary);
      setPrimaryImageIndex(primaryExistingImage ? -1 : 0);
    }
  }, [carData]);

  const handleInputChange = useCallback((e: any) => {
    const { name, value } = e.target;
    const numericFields = ['year', 'pricePerDay', 'depositAmount', 'dailyKmLimit', 'extraKmCharge', 'currentOdometer', 'seats'];
    setFormData((p: any) => ({
      ...p,
      [name]: numericFields.includes(name) ? (value === '' ? 0 : Number(value)) : value
    }));
  }, []);

  const handleBrandChange = useCallback((brandId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      brandId,
      modelId: '' 
    }));
  }, []);

  const handleSetPrimaryNew = useCallback((index: number) => {
    setPrimaryImageIndex(index);
  }, []);

  const handleSubmit = async () => {
    if (!formData.modelId || !formData.plateNumber) {
      setAlert({ open: true, msg: 'Required fields are missing', severity: 'warning' });
      return;
    }

    setIsUpdating(true);
    try {
      const { id: _, brand, ...cleanInput } = formData;
      await updateCar({ 
        variables: { 
          id: id, 
          input: cleanInput 
        } ,
        refetchQueries: [
          { query: GET_CARS_QUERY }
        ]
      });

      if (selectedImages.length > 0) {
        for (let i = 0; i < selectedImages.length; i++) {
          const isPrimary = i === primaryImageIndex && primaryImageIndex >= 0;
          
          await uploadCarImages({ 
            variables: { 
              carId: id, 
                file: selectedImages[i], 
                isPrimary: isPrimary
            } 
          });
        }
      }
      
      setAlert({ open: true, msg: 'Update Success', severity: 'success' });
      setTimeout(() => router.push('/admin/cars'), 1000);
    } catch (err: any) {
      setAlert({ open: true, msg: err.message, severity: 'error' });
      setIsUpdating(false);
    }
  };

  if (carLoading) return <Box sx={{ width: '100%', mt: 4 }}><LinearProgress /></Box>;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, width: '100%' }}>
      <EditCarView 
        activeTab={activeTab} setActiveTab={setActiveTab}
        formData={formData} setFormData={setFormData}
        brandData={brandData} modelData={modelData} enumData={enumData}
        onInputChange={handleInputChange}
        onBrandChange={handleBrandChange}
        onImageSelect={(e: any) => {
          const files = Array.from(e.target.files || []) as File[];
          setSelectedImages(p => [...p, ...files]);
          files.forEach(f => {
            const r = new FileReader();
            r.onloadend = () => setImagePreviews(p => [...p, r.result as string]);
            r.readAsDataURL(f);
          });
        }}
        existingImages={existingImages} imagePreviews={imagePreviews}
        primaryImageIndex={primaryImageIndex} setPrimaryImageIndex={setPrimaryImageIndex}
        onRemoveExistingImage={(imgId: string) => deleteCarImage({ variables: { imageId: imgId } }).then(() => setExistingImages(p => p.filter(x => x.id !== imgId)))}
        onRemoveNewImage={(idx: number) => { setSelectedImages(p => p.filter((_, i) => i !== idx)); setImagePreviews(p => p.filter((_, i) => i !== idx)); }}
        onSetPrimaryExisting={async (imageId: string) => {
          await setPrimaryCarImage({ 
            variables: { carId: id, imageId },
            refetchQueries: [{ query: GET_CARS_QUERY }]
          });
        }}
        onSetPrimaryNew={handleSetPrimaryNew}
        onSubmit={handleSubmit} onCancel={() => router.back()}
        isUpdating={isUpdating}
      />
      <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert(p => ({ ...p, open: false }))}>
        <Alert severity={alert.severity} variant="filled">{alert.msg}</Alert>
      </Snackbar>
    </Box>
  );
};