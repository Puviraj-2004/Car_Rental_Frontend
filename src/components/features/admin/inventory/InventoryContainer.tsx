'use client';

import React, { useState } from 'react';
import { useInventory } from '@/hooks/graphql/useInventory';
import { InventoryView } from './InventoryView';
import { Snackbar, Alert } from '@mui/material';

export const InventoryContainer = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [newName, setNewName] = useState('');
  const [alert, setAlert] = useState({ open: false, msg: '', severity: 'success' as any });

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { brands, models, refetchBrands, refetchModels, mutations } = useInventory(selectedBrandId, activeTab);

  const handleAdd = async () => {
    try {
      if (activeTab === 0) {
        await mutations.createBrand({ variables: { name: newName } });
        refetchBrands();
      } else {
        await mutations.createModel({ variables: { name: newName, brandId: selectedBrandId } });
        refetchModels();
      }
      setNewName('');
      setAlert({ open: true, msg: 'Entry Added Successfully!', severity: 'success' });
    } catch (e: any) { setAlert({ open: true, msg: e.message, severity: 'error' }); }
  };

  const handleUpdate = async () => {
    try {
      if (selectedItem.type === 'BRAND') {
        await mutations.updateBrand({ variables: { id: selectedItem.id, name: selectedItem.name } });
        refetchBrands();
      } else {
        await mutations.updateModel({ variables: { id: selectedItem.id, name: selectedItem.name } });
        refetchModels();
      }
      setEditOpen(false);
      setAlert({ open: true, msg: 'Updated successfully!', severity: 'success' });
    } catch (e: any) { setAlert({ open: true, msg: e.message, severity: 'error' }); }
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedItem.type === 'BRAND') {
        await mutations.deleteBrand({ variables: { id: selectedItem.id } });
        refetchBrands();
      } else {
        await mutations.deleteModel({ variables: { id: selectedItem.id } });
        refetchModels();
      }
      setDeleteOpen(false);
      setAlert({ open: true, msg: 'Deleted successfully!', severity: 'warning' });
    } catch (e: any) { setAlert({ open: true, msg: e.message, severity: 'error' }); }
  };

  return (
    <>
      <InventoryView
        activeTab={activeTab} setActiveTab={setActiveTab}
        selectedBrandId={selectedBrandId} setSelectedBrandId={setSelectedBrandId}
        brands={brands} models={models}
        newName={newName} setNewName={setNewName} handleAdd={handleAdd}
        onOpenEdit={(id: string, name: string) => { setSelectedItem({ id, name, type: activeTab === 0 ? 'BRAND' : 'MODEL' }); setEditOpen(true); }}
        onOpenDelete={(id: string, name: string) => { setSelectedItem({ id, name, type: activeTab === 0 ? 'BRAND' : 'MODEL' }); setDeleteOpen(true); }}
        editOpen={editOpen} setEditOpen={setEditOpen}
        deleteOpen={deleteOpen} setDeleteOpen={setDeleteOpen}
        selectedItem={selectedItem} setSelectedItem={setSelectedItem}
        handleUpdate={handleUpdate} handleConfirmDelete={handleConfirmDelete}
      />
      <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })}>
        <Alert severity={alert.severity} variant="filled">{alert.msg}</Alert>
      </Snackbar>
    </>
  );
};