'use client';

import React from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableHead, 
  TableRow, Paper, IconButton, TextField, Button, 
  Tabs, Tab, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack, Divider,
  TableContainer
} from '@mui/material';
import { Delete, Edit, Add as AddIcon, Warning as WarningIcon, Close } from '@mui/icons-material';

export const InventoryView = ({
  activeTab, setActiveTab, selectedBrandId, setSelectedBrandId,
  brands, models, newName, setNewName, handleAdd,
  onOpenEdit, onOpenDelete, editOpen, setEditOpen, deleteOpen, setDeleteOpen,
  selectedItem, setSelectedItem, handleUpdate, handleConfirmDelete
}: any) => {

  return (
    <Box>
      <Typography variant="h4" fontWeight={900} color="#0F172A" mb={4}>Inventory Hub</Typography>

      <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2, bgcolor: '#F8FAFC' }}>
          <Tab label="Car Brands" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Vehicle Models" sx={{ fontWeight: 700, textTransform: 'none' }} />
        </Tabs>

        <Box sx={{ p: 4 }}>
          {/* Action Bar */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={5} alignItems="center">
            {activeTab === 1 && (
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Parent Brand</InputLabel>
                <Select value={selectedBrandId} label="Parent Brand" onChange={(e) => setSelectedBrandId(e.target.value)}>
                  {brands.map((b: any) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                </Select>
              </FormControl>
            )}
            <TextField 
              fullWidth={activeTab === 0}
              label={activeTab === 0 ? "New Brand Name" : "New Model Name"} 
              size="small" value={newName} 
              onChange={(e) => setNewName(e.target.value)}
              disabled={activeTab === 1 && !selectedBrandId}
              sx={{ maxWidth: 400 }}
            />
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleAdd} 
              disabled={!newName || (activeTab === 1 && !selectedBrandId)}
              sx={{ bgcolor: '#0F172A', borderRadius: 2, px: 4, fontWeight: 700, height: 40 }}
            >
              Add
            </Button>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>ENTRY NAME</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#64748B' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(activeTab === 0 ? brands : models).map((item: any) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>{item.name}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => onOpenEdit(item.id, item.name)} size="small" color="primary" sx={{ mr: 1 }}><Edit fontSize="small" /></IconButton>
                      <IconButton onClick={() => onOpenDelete(item.id, item.name)} size="small" color="error"><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit Entry <IconButton onClick={() => setEditOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Updated Name" fullWidth value={selectedItem?.name || ''} onChange={(e) => setSelectedItem((p: any) => ({ ...p, name: e.target.value }))} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ fontWeight: 700, color: '#64748B' }}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" sx={{ bgcolor: '#0F172A', fontWeight: 700 }}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 4 } }}>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <WarningIcon sx={{ color: '#F59E0B', fontSize: 64, mb: 2 }} />
          <Typography variant="h6" fontWeight={800}>Confirm Deletion</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 4 }}>
            Are you sure you want to delete <b>{selectedItem?.name}</b>? All associated data will be removed permanently.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button fullWidth variant="outlined" onClick={() => setDeleteOpen(false)} sx={{ borderRadius: 2, fontWeight: 700, color: '#64748B' }}>Keep it</Button>
            <Button fullWidth variant="contained" color="error" onClick={handleConfirmDelete} sx={{ borderRadius: 2, fontWeight: 700 }}>Yes, Delete</Button>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
};