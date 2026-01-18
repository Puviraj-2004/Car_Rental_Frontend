'use client';

import React from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Stack, TextField, InputAdornment,
  MenuItem, Button, Select, FormControl, InputLabel
} from '@mui/material';
import { 
  Visibility as ViewIcon, 
  Search as SearchIcon, 
  CalendarMonth as DateIcon,
  Add as AddIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { formatDateForDisplay } from '@/lib/dateUtils';

const statusStyles: any = {
  PENDING: { bg: '#FFF7ED', color: '#C2410C', label: 'Action Required' },
  VERIFIED: { bg: '#F0F9FF', color: '#0369A1', label: 'Identity Verified / Pay Now' },
  CONFIRMED: { bg: '#F0FDF4', color: '#15803D', label: 'Ready to Pay' },
  ONGOING: { bg: '#F5F3FF', color: '#6D28D9', label: 'In Trip' },
  COMPLETED: { bg: '#F8FAFC', color: '#475569', label: 'Returned' },
  CANCELLED: { bg: '#FEF2F2', color: '#991B1B', label: 'Cancelled' },
};

export const AdminBookingsView = ({ 
  bookings, onRowClick, searchQuery, setSearchQuery, 
  statusFilter, setStatusFilter, onCreateClick, viewLabel 
}: any) => {
  return (
    <Box sx={{ p: 4 }}>
      {/* Header & Actions */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={4} spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={900} color="#0F172A">Booking Records</Typography>
          <Typography variant="body2" color="text.secondary">
            {viewLabel ? `${viewLabel} · ` : ''}Managing {bookings.length} visible reservations
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={onCreateClick}
            sx={{ bgcolor: '#0F172A', fontWeight: 700 }}
          >
            New Booking
          </Button>
        </Stack>
      </Stack>

      {/* Filters Toolbar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        <Stack direction="row" spacing={2}>
          <TextField 
            size="small" 
            placeholder="Search Reference, Name, Plate..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }} 
            sx={{ width: 350, bgcolor: 'white' }} 
          />
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              label="Status Filter"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="PENDING">Pending Verification</MenuItem>
              <MenuItem value="CONFIRMED">Confirmed (Ready)</MenuItem>
              <MenuItem value="ONGOING">Ongoing Trip</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #E2E8F0' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>REF & TYPE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>CUSTOMER</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>VEHICLE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>PERIOD</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>FINANCIALS</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>STATUS</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, color: '#64748B' }}>ACTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.length === 0 ? (
               <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}>No bookings found matching filters</TableCell></TableRow>
            ) : (
              bookings.map((b: any) => {
                const style = statusStyles[b.status] || { bg: '#f5f5f5', color: '#333' };
                const isCourtesy = b.bookingType === 'REPLACEMENT';
                const isWalkIn = b.isWalkIn;
                const displayName = b.guestName || b.user?.fullName || 'Guest';
                const displayContact = b.guestPhone || b.user?.email || b.guestEmail;
                
                return (
                  <TableRow key={b.id} hover onClick={() => onRowClick(b)} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} fontFamily="monospace">#{b.id.slice(-6).toUpperCase()}</Typography>
                      <Stack direction="row" spacing={0.5} mt={0.5}>
                        {isCourtesy && <Chip label="COURTESY" size="small" color="secondary" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />}
                        {isWalkIn && <Chip label="WALK-IN" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>{displayName}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">{displayContact}</Typography>
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
                    <TableCell>
                      {isCourtesy ? (
                        <Typography variant="body2" fontWeight={700} color="text.secondary">Free</Typography>
                      ) : (
                        <Typography variant="body2" fontWeight={800}>€{b.totalPrice?.toFixed(2)}</Typography>
                      )}
                    </TableCell>
                    <TableCell><Chip label={style.label || b.status} size="small" sx={{ fontWeight: 800, bgcolor: style.bg, color: style.color }} /></TableCell>
                    <TableCell align="right"><IconButton size="small"><ViewIcon fontSize="small" /></IconButton></TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};