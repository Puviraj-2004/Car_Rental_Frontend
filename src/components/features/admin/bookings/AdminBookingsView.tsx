'use client';

import React from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Stack, TextField, InputAdornment
} from '@mui/material';
import { Visibility as ViewIcon, Search as SearchIcon, CalendarMonth as DateIcon } from '@mui/icons-material';
import { formatDateForDisplay, formatTimeForDisplay } from '@/lib/dateUtils';

const statusStyles: any = {
  PENDING: { bg: '#FFF7ED', color: '#C2410C', label: 'Verification' },
  VERIFIED: { bg: '#F0F9FF', color: '#0369A1', label: 'Unpaid' },
  CONFIRMED: { bg: '#F0FDF4', color: '#15803D', label: 'Ready' },
  ONGOING: { bg: '#F5F3FF', color: '#6D28D9', label: 'In Trip' },
  COMPLETED: { bg: '#F8FAFC', color: '#475569', label: 'Returned' },
  CANCELLED: { bg: '#FEF2F2', color: '#991B1B', label: 'Cancelled' },
};

export const AdminBookingsView = ({ bookings, onRowClick }: any) => {
  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={900} color="#0F172A">Booking Records</Typography>
          <Typography variant="body2" color="text.secondary">Total {bookings.length} reservations tracked</Typography>
        </Box>
        <TextField size="small" placeholder="Search..." InputProps={{ startAdornment: <SearchIcon /> }} sx={{ width: 300, bgcolor: 'white' }} />
      </Stack>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #E2E8F0' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>REFERENCE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>CUSTOMER</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>VEHICLE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>PERIOD</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>TOTAL</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>STATUS</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, color: '#64748B' }}>CONTROL</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((b: any) => {
              const style = statusStyles[b.status] || { bg: '#f5f5f5', color: '#333' };
              return (
                <TableRow key={b.id} hover onClick={() => onRowClick(b)} sx={{ cursor: 'pointer' }}>
                  <TableCell><Typography variant="body2" fontWeight={700} fontFamily="monospace">#{b.id.slice(-6).toUpperCase()}</Typography></TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>{b.user?.fullName || 'Guest'}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{b.user?.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{b.car?.model?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{b.car?.plateNumber}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <DateIcon sx={{ fontSize: 14, color: '#64748B' }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{formatDateForDisplay(b.startDate)}</Typography>
                        <Typography variant="caption" color="text.secondary">{b.pickupTime || '10:00'}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell><Typography variant="body2" fontWeight={800}>€{b.totalPrice?.toFixed(2)}</Typography></TableCell>
                  <TableCell><Chip label={style.label || b.status} size="small" sx={{ fontWeight: 800, bgcolor: style.bg, color: style.color }} /></TableCell>
                  <TableCell align="right"><IconButton size="small"><ViewIcon fontSize="small" /></IconButton></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};