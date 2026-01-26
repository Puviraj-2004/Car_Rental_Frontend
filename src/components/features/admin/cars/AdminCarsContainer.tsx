'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminCars } from '@/hooks/useAdminCars';
import { AdminCarsView } from './AdminCarsView';

export const AdminCarsContainer = ({ onCarSelect }: { onCarSelect?: (carId: string) => void }) => {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<any>(null);

  const { 
    cars, brands, models, enums, filters, setFilters, 
    resetFilters, deleteCar, loading, error 
  } = useAdminCars();

  const handleEdit = (id: string) => router.push(`/admin/cars/${id}`);
  const handleAdd = () => router.push('/admin/cars/add');

  const handleDeleteClick = (car: any) => {
    setCarToDelete(car);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!carToDelete) return;
    try {
      await deleteCar({ variables: { id: carToDelete.id } });
      setDeleteDialogOpen(false);
    } catch (e) {
      alert("Error deleting car. Check for active bookings.");
    }
  };

  if (error) return <div>Critical error loading fleet data.</div>;

  return (
    <AdminCarsView
      cars={cars}
      brands={brands}
      models={models}
      enums={enums}
      filters={filters}
      setFilters={setFilters}
      resetFilters={resetFilters}
      view={view}
      setView={setView}
      deleteDialogOpen={deleteDialogOpen}
      setDeleteDialogOpen={setDeleteDialogOpen}
      onDeleteClick={handleDeleteClick}
      onEditClick={handleEdit}
      onAddClick={handleAdd}
      confirmDelete={handleConfirmDelete}
      loading={loading}
      onCarSelect={onCarSelect}
    />
  );
};