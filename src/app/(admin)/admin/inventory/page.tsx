'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BRANDS_QUERY, GET_MODELS_QUERY } from '@/lib/graphql/queries';
import { 
  DELETE_BRAND_MUTATION, 
  UPDATE_BRAND_MUTATION, 
  DELETE_MODEL_MUTATION,
  UPDATE_MODEL_MUTATION,
  CREATE_BRAND_MUTATION,
  CREATE_MODEL_MUTATION
} from '@/lib/graphql/mutations';
import { 
  Box, Typography, Table, TableBody, TableCell, TableHead, 
  TableRow, Paper, IconButton, TextField, Button, Grid, 
  Divider, Tabs, Tab, Select, MenuItem, FormControl, InputLabel,
  Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Stack
} from '@mui/material';
import { Delete, Edit, Add as AddIcon, Warning as WarningIcon } from '@mui/icons-material';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [alert, setAlert] = useState({ open: false, msg: '', severity: 'success' as any });

  // Edit & Delete State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: string, name: string, type: 'BRAND' | 'MODEL' } | null>(null);

  // Queries
  const { data: brands, refetch: refetchBrands } = useQuery(GET_BRANDS_QUERY);
  const { data: models, refetch: refetchModels } = useQuery(GET_MODELS_QUERY, {
    variables: { brandId: selectedBrandId },
    skip: !selectedBrandId && activeTab === 1
  });

  // Mutations
  const [deleteBrand] = useMutation(DELETE_BRAND_MUTATION);
  const [updateBrand] = useMutation(UPDATE_BRAND_MUTATION);
  const [deleteModel] = useMutation(DELETE_MODEL_MUTATION);
  const [updateModel] = useMutation(UPDATE_MODEL_MUTATION);
  const [createBrand] = useMutation(CREATE_BRAND_MUTATION);
  const [createModel] = useMutation(CREATE_MODEL_MUTATION);

  const [newName, setNewName] = useState('');

  // --- Handlers ---
 const handleAdd = async () => {
    if (!newName) return;
    try {
      if (activeTab === 0) {
        await createBrand({ variables: { name: newName } });
        refetchBrands();
      } else {
        await createModel({ variables: { name: newName, brandId: selectedBrandId } });
        refetchModels();
      }
      setNewName('');
      setAlert({ open: true, msg: 'Added Successfully!', severity: 'success' });
    } catch (e: any) {
      console.error(e); // Keep logging for your own debugging
      
      // Check for duplicate/unique constraint errors
      let errorMessage = e.message;
      if (errorMessage.toLowerCase().includes('unique') || errorMessage.toLowerCase().includes('already exists')) {
        errorMessage = `This ${activeTab === 0 ? 'Brand' : 'Model'} name already exists!`;
      }

      setAlert({ open: true, msg: errorMessage, severity: 'error' });
    }
  };

  const handleOpenEdit = (id: string, name: string, type: 'BRAND' | 'MODEL') => {
    setSelectedItem({ id, name, type });
    setEditDialogOpen(true);
  };

  const handleOpenDelete = (id: string, name: string, type: 'BRAND' | 'MODEL') => {
    setSelectedItem({ id, name, type });
    setDeleteDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      if (selectedItem.type === 'BRAND') {
        await updateBrand({ variables: { id: selectedItem.id, name: selectedItem.name } });
        refetchBrands();
      } else {
        await updateModel({ variables: { id: selectedItem.id, name: selectedItem.name } });
        refetchModels();
      }
      setEditDialogOpen(false);
      setAlert({ open: true, msg: 'Updated Successfully!', severity: 'success' });
    } catch (e: any) {
      let errorMessage = e.message;
      
      // Friendly duplicate error message
      if (errorMessage.toLowerCase().includes('unique') || errorMessage.toLowerCase().includes('already exists')) {
        errorMessage = `A ${selectedItem.type.toLowerCase()} with this name already exists.`;
      }

      setAlert({ open: true, msg: errorMessage, severity: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    try {
      if (selectedItem.type === 'BRAND') {
        await deleteBrand({ variables: { id: selectedItem.id } });
        refetchBrands();
      } else {
        await deleteModel({ variables: { id: selectedItem.id } });
        refetchModels();
      }
      setDeleteDialogOpen(false);
      setAlert({ open: true, msg: `${selectedItem.type} and its related data deleted!`, severity: 'warning' });
    } catch (e: any) { setAlert({ open: true, msg: e.message, severity: 'error' }); }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="800" mb={4} color="#1E293B">Inventory Management</Typography>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
          <Tab label="Brands" sx={{ fontWeight: 700 }} />
          <Tab label="Models" sx={{ fontWeight: 700 }} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} mb={4}>
            {activeTab === 1 && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Select Brand</InputLabel>
                <Select value={selectedBrandId} label="Select Brand" onChange={(e) => setSelectedBrandId(e.target.value)}>
                  {brands?.brands.map((b: any) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                </Select>
              </FormControl>
            )}
           <TextField 
              label={activeTab === 0 ? "New Brand Name" : "New Model Name"} 
              size="small" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)}
              disabled={activeTab === 1 && !selectedBrandId}
              // Add this helper text:
              helperText={activeTab === 1 && !selectedBrandId ? "Select a brand first" : ""}
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} disabled={activeTab === 1 && !selectedBrandId}>Add</Button>
          </Stack>

          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeTab === 0 ? (
                brands?.brands.map((b: any) => (
                  <TableRow key={b.id} hover>
                    <TableCell>{b.name}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenEdit(b.id, b.name, 'BRAND')} color="primary"><Edit /></IconButton>
                      <IconButton onClick={() => handleOpenDelete(b.id, b.name, 'BRAND')} color="error"><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                models?.models.map((m: any) => (
                  <TableRow key={m.id} hover>
                    <TableCell>{m.name}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenEdit(m.id, m.name, 'MODEL')} color="primary"><Edit /></IconButton>
                      <IconButton onClick={() => handleOpenDelete(m.id, m.name, 'MODEL')} color="error"><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* ✏️ Edit Dialog Box */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Edit {selectedItem?.type}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus margin="dense" label="Name" fullWidth variant="outlined"
            value={selectedItem?.name || ''}
            onChange={(e) => setSelectedItem(prev => prev ? { ...prev, name: e.target.value } : null)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* ⚠️ Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} fullWidth maxWidth="xs">
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <WarningIcon sx={{ color: '#f59e0b', fontSize: 60, mb: 2 }} />
          <Typography variant="h6" fontWeight="700" gutterBottom>
            Delete {selectedItem?.type}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, px: 2 }}>
            Are you sure you want to delete <b>{selectedItem?.name}</b>? 
            This action <b>cannot be undone</b> and will automatically delete all <b>associated cars and data</b>.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="outlined" color="inherit" onClick={() => setDeleteDialogOpen(false)} sx={{ flex: 1 }}>
              Keep it
            </Button>
            <Button variant="contained" color="error" onClick={handleConfirmDelete} sx={{ flex: 1 }}>
              Yes, Delete
            </Button>
          </Stack>
        </Box>
      </Dialog>

      <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })}>
        <Alert severity={alert.severity} variant="filled">{alert.msg}</Alert>
      </Snackbar>
    </Box>
  );
}