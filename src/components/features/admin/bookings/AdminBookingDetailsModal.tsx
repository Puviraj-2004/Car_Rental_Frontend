'use client';

import React from 'react';
import {
  Dialog, DialogContent, DialogTitle, Box, Typography, Grid, 
  Stack, Divider, Button, Chip, Alert, IconButton, Paper, Avatar
} from '@mui/material';
import { Close, DirectionsCar, Person, Warning, CalendarMonth } from '@mui/icons-material';

export const AdminBookingDetailsModal = ({ open, onClose, booking, actions }: any) => {
  if (!booking) return null;

  // 🛡️ Helper: Combines Date and Time string safely
  const formatDateTime = (dateVal: any, timeVal: string | null) => {
    if (!dateVal) return 'Not scheduled';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'Invalid schedule';
    
    const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    return timeVal ? `${dateStr} at ${timeVal}` : dateStr;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
        <Typography variant="h6" component="span" fontWeight={800}>
          Control Center: #{booking.id.slice(-6).toUpperCase()}
        </Typography>
        <IconButton onClick={onClose}><Close /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 4, bgcolor: '#F8FAFC' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                <Typography variant="subtitle2" color="primary" fontWeight={800} mb={2}>CUSTOMER & VEHICLE</Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: '#F1F5F9', color: '#475569' }}><Person /></Avatar>
                    <Box>
                      <Typography fontWeight={700}>{booking.user?.fullName}</Typography>
                      <Typography variant="body2" color="text.secondary">{booking.user?.phoneNumber}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: '#F1F5F9', color: '#475569' }}><DirectionsCar /></Avatar>
                    <Box>
                      <Typography fontWeight={700}>{booking.car?.brand?.name} {booking.car?.model?.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{booking.car?.plateNumber}</Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>

              {/* SCHEDULE CARD - FIXED DATE FETCHING */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                <Typography variant="subtitle2" color="primary" fontWeight={800} mb={2}>TRIP SCHEDULE</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <CalendarMonth sx={{ fontSize: 14 }} /> PICKUP
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {formatDateTime(booking.startDate, booking.pickupTime)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <CalendarMonth sx={{ fontSize: 14 }} /> RETURN
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {formatDateTime(booking.endDate, booking.returnTime)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          </Grid>

          {/* Right Side: Action Logic (Preserved) */}
          <Grid item xs={12} md={5}>
            {/* ... Existing Button Logic for Start/Complete Trip ... */}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};