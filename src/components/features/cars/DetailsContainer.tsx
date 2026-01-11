'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCarDetails } from '@/hooks/graphql/useCarDetails';
import { DetailsView } from './DetailsView';

interface DetailsContainerProps {
  id: string;
}

export const DetailsContainer = ({ id }: DetailsContainerProps) => {
  const router = useRouter();
  const { car, loading, error } = useCarDetails(id);

  const handleBook = (carId: string) => {
    // Navigates to the booking page with this car selected
    router.push(`/booking?carId=${carId}`);
  };

  const handleClose = () => {
    router.back();
  };

  if (error) return <div>Error loading car details.</div>;

  return (
    <DetailsView 
      car={car} 
      loading={loading} 
      onClose={handleClose} 
      onBook={handleBook} 
    />
  );
};