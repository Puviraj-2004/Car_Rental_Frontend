'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Stack,
  Typography,
  Alert,
  Box,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Speed as SpeedIcon,
  Article as DocumentIcon
} from '@mui/icons-material';

interface PreTripModalProps {
  open: boolean;
  onClose: () => void;
  booking: any;
  onConfirm: (data: { startOdometer: number; pickupNotes?: string }) => Promise<void>;
}

export const PreTripModal = ({ open, onClose, booking, onConfirm }: PreTripModalProps) => {
  const [startOdometer, setStartOdometer] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');
  const [documentsChecked, setDocumentsChecked] = useState(false);
  const [exteriorChecked, setExteriorChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    // Validation
    if (!startOdometer || isNaN(Number(startOdometer))) {
      setError('Please enter a valid odometer reading');
      return;
    }

    if (Number(startOdometer) < 0) {
      setError('Odometer reading cannot be negative');
      return;
    }

    if (!documentsChecked || !exteriorChecked) {
      setError('Please complete all pre-trip checks');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onConfirm({
        startOdometer: Number(startOdometer),
        pickupNotes: pickupNotes.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to start trip');
    } finally {
      setLoading(false);
    }
  };

  const isReady = startOdometer && documentsChecked && exteriorChecked;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>Pre-Trip Checklist</Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Booking #{booking?.id?.slice(-6).toUpperCase()} • {booking?.car?.brand?.name} {booking?.car?.model?.name}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

          {/* Pre-Checks Status */}
          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckIcon fontSize="small" color={booking?.payment?.status === 'SUCCEEDED' ? 'success' : 'disabled'} />
                <Typography variant="body2" fontWeight={600}>
                  Payment: {booking?.payment?.status === 'SUCCEEDED' ? 'Confirmed ✓' : 'Pending'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckIcon fontSize="small" color={booking?.user?.verification?.status === 'APPROVED' ? 'success' : 'disabled'} />
                <Typography variant="body2" fontWeight={600}>
                  Documents: {booking?.user?.verification?.status === 'APPROVED' ? 'Verified ✓' : booking?.isWalkIn ? 'Walk-in (skip)' : 'Pending'}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          {/* Odometer Input */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <SpeedIcon fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight={700}>Start Odometer Reading *</Typography>
            </Stack>
            <TextField
              fullWidth
              type="number"
              value={startOdometer}
              onChange={(e) => setStartOdometer(e.target.value)}
              placeholder="e.g., 125430"
              InputProps={{
                endAdornment: <Typography variant="body2" color="text.secondary">km</Typography>
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
              autoFocus
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Current car odometer: {booking?.car?.currentOdometer?.toLocaleString() || 'N/A'} km
            </Typography>
          </Box>

          <Divider />

          {/* Physical Checks */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <DocumentIcon fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight={700}>Physical Verification *</Typography>
            </Stack>
            <Stack spacing={1.5}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={documentsChecked} 
                    onChange={(e) => setDocumentsChecked(e.target.checked)}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                  />
                }
                label={
                  <Typography variant="body2">
                    Physical documents verified (license, ID match uploaded docs)
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={exteriorChecked} 
                    onChange={(e) => setExteriorChecked(e.target.checked)}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                  />
                }
                label={
                  <Typography variant="body2">
                    Exterior inspection completed (no new damage)
                  </Typography>
                }
              />
            </Stack>
          </Box>

          <Divider />

          {/* Optional Notes */}
          <Box>
            <Typography variant="body2" fontWeight={700} mb={1}>Pickup Notes (Optional)</Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              placeholder="e.g., Minor scratch on rear bumper noted..."
              sx={{ 
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!isReady || loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckIcon />}
          sx={{ 
            borderRadius: 2, 
            bgcolor: '#10B981',
            minWidth: 180,
            '&:hover': { bgcolor: '#059669' }
          }}
        >
          {loading ? 'Starting Trip...' : 'Start Trip & Handover'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
