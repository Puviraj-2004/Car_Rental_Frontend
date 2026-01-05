'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Box, Container, Typography, Stack, Chip, Button,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, 
  CircularProgress, Snackbar, Alert, Dialog, DialogContent, 
  DialogTitle, Divider, Grid, TextField, IconButton
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Close as CloseIcon,
  OpenInNew as OpenIcon,
  Edit as EditIcon,
  DeleteForever as CancelIcon,
  CalendarMonth as DateIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import QRCode from 'react-qr-code';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { GET_MY_BOOKINGS_QUERY } from '@/lib/graphql/queries';
import { CANCEL_BOOKING_MUTATION } from '@/lib/graphql/mutations';

// --- 🛠️ HELPER: Safe Date Formatter ---
const formatSecureDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(d);
};

export default function BookingRecordsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const client = useApolloClient();

  const { data, loading, error, refetch } = useQuery(GET_MY_BOOKINGS_QUERY, {
    fetchPolicy: 'cache-and-network',
    skip: status !== 'authenticated'
  });

  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copySnack, setCopySnack] = useState(false);

  const [cancelBooking, { loading: cancelLoading }] = useMutation(CANCEL_BOOKING_MUTATION);

  const bookings = data?.myBookings?.filter((b: any) => b.status !== 'DRAFT') || [];

  useEffect(() => {
    if (searchParams.get('refresh')) {
      client.cache.evict({ fieldName: 'myBookings' });
      client.cache.gc();
      refetch();
      router.replace('/bookingRecords');
    }
  }, [searchParams, refetch, router, client]);

  const handleRowClick = (booking: any) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const handleCancelBooking = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await cancelBooking({ variables: { id } });
        setDetailsOpen(false);
        refetch();
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/verification/${token}`;
    navigator.clipboard.writeText(link);
    setCopySnack(true);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' };
      case 'CANCELLED': return { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' };
      case 'PENDING': return { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' };
      case 'VERIFIED': return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
      default: return { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' };
    }
  };

  if (loading) return <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress color="inherit" /></Box>;
  if (error) return <Alert severity="error">Error loading bookings</Alert>;

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh',  pb: 10 }}>
      <Container maxWidth="xl">
        
        <Box sx={{ mb: 4, px: { xs: 1, md: 0 } }}>
          <Typography variant="h4" fontWeight={900} color="#0F172A" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>Booking History</Typography>
          <Typography variant="body2" color="text.secondary">Manage your upcoming and past trips</Typography>
        </Box>

        {/* 💻 DESKTOP VIEW (Table) */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>VEHICLE</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>BOOKING ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>PRICE</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>PICKUP DATE</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>STATUS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking: any) => {
                    const style = getStatusStyles(booking.status);
                    return (
                      <TableRow key={booking.id} hover onClick={() => handleRowClick(booking)} sx={{ cursor: 'pointer' }}>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ width: 64, height: 40, bgcolor: '#F1F5F9', borderRadius: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               <img src={booking.car?.images?.[0]?.url} alt="car" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </Box>
                            <Box>
                              <Typography variant="body2" fontWeight={800}>{booking.car?.brand?.name} {booking.car?.model?.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{booking.car?.plateNumber}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell><Typography variant="body2" fontWeight={600}>#{booking.id.slice(-6).toUpperCase()}</Typography></TableCell>
                        <TableCell><Typography variant="body2" fontWeight={800}>€{booking.totalPrice?.toFixed(2)}</Typography></TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{formatSecureDate(booking.startDate)}</Typography>
                          <Typography variant="caption" color="text.secondary">{booking.pickupTime}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={booking.status} size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: style.bg, color: style.color, border: `1px solid ${style.border}` }} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* 📱 MOBILE VIEW (Cards) */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Stack spacing={2}>
            {bookings.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No records found</Typography>
            ) : (
              bookings.map((booking: any) => {
                const style = getStatusStyles(booking.status);
                return (
                  <Paper 
                    key={booking.id} 
                    onClick={() => handleRowClick(booking)}
                    sx={{ p: 2, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ width: 80, height: 50, bgcolor: '#F1F5F9', borderRadius: 2, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <img src={booking.car?.images?.[0]?.url} alt="car" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" fontWeight={800}>{booking.car?.brand?.name} {booking.car?.model?.name}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">ID: #{booking.id.slice(-6).toUpperCase()}</Typography>
                        <Typography variant="caption" fontWeight={700} color="primary" display="block">€{booking.totalPrice?.toFixed(2)}</Typography>
                      </Box>
                      <ChevronRightIcon sx={{ color: '#CBD5E1' }} />
                    </Stack>
                    <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                         <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                           <DateIcon sx={{ fontSize: 14 }} /> {formatSecureDate(booking.startDate)}
                         </Typography>
                      </Box>
                      <Chip label={booking.status} size="small" sx={{ fontWeight: 800, fontSize: '0.6rem', bgcolor: style.bg, color: style.color, height: 20 }} />
                    </Stack>
                  </Paper>
                );
              })
            )}
          </Stack>
        </Box>

      </Container>

      {/* 🚀 DYNAMIC DETAILS MODAL */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: { xs: 0, sm: 5 }, m: { xs: 0, sm: 2 } } }}>
        {selectedBooking && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" fontWeight={900} component="span">Booking Details</Typography>
              <IconButton onClick={() => setDetailsOpen(false)}><CloseIcon /></IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC' }}>
              
              {selectedBooking.status === 'PENDING' && (
                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, mb: 4, border: '2px solid #7C3AED', bgcolor: '#FFFFFF' }}>
                  <Typography variant="subtitle2" fontWeight={900} color="#7C3AED" gutterBottom>Verification Required</Typography>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={4} textAlign="center">
                       <Box p={1} bgcolor="white" border="1px solid #E2E8F0" borderRadius={2} display="inline-block">
                          <QRCode value={`${window.location.origin}/verification/${selectedBooking.verification?.token}`} size={120} />
                       </Box>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Stack spacing={2}>
                        <TextField fullWidth size="small" value={`${window.location.origin}/verification/${selectedBooking.verification?.token}`} InputProps={{ readOnly: true, endAdornment: <IconButton onClick={() => copyLink(selectedBooking.verification?.token)}><CopyIcon fontSize="small"/></IconButton> }} />
                        <Button fullWidth variant="contained" startIcon={<OpenIcon />} onClick={() => window.open(`${window.location.origin}/verification/${selectedBooking.verification?.token}`, '_blank')} sx={{ bgcolor: '#7C3AED', fontWeight: 700 }}>Open Link</Button>
                        <Stack direction="row" spacing={1}>
                          <Button fullWidth variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => router.push(`/booking?bookingId=${selectedBooking.id}`)}>Edit</Button>
                          <Button fullWidth variant="outlined" size="small" color="error" startIcon={<CancelIcon />} onClick={() => handleCancelBooking(selectedBooking.id)}>Cancel</Button>
                        </Stack>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" fontWeight={800} color="text.secondary">VEHICLE</Typography>
                  <Stack direction="row" spacing={2} mt={1}>
                    <Box sx={{ width: 100, height: 70, bgcolor: '#F1F5F9', borderRadius: 2, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <img src={selectedBooking.car?.images?.[0]?.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={800}>{selectedBooking.car?.brand?.name} {selectedBooking.car?.model?.name}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">{selectedBooking.car?.plateNumber}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" fontWeight={800} color="text.secondary">SCHEDULE</Typography>
                  <Stack spacing={0.5} mt={1}>
                    <Typography variant="body2" fontWeight={600}>{formatSecureDate(selectedBooking.startDate)} to {formatSecureDate(selectedBooking.endDate)}</Typography>
                    <Typography variant="caption" color="text.secondary">{selectedBooking.pickupTime} - {selectedBooking.returnTime}</Typography>
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                   <Typography variant="caption" fontWeight={800} color="text.secondary">TOTAL AMOUNT</Typography>
                   <Typography variant="h5" fontWeight={900} color="primary">€{selectedBooking.totalPrice?.toFixed(2)}</Typography>
                </Box>
                <Chip label={selectedBooking.status} size="small" sx={{ fontWeight: 900 }} />
              </Box>

              {selectedBooking.status === 'VERIFIED' && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mt={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/payment/${selectedBooking.id}`);
                    }}
                    sx={{ fontWeight: 900, bgcolor: '#0F172A' }}
                  >
                    Pay Now
                  </Button>
                </Stack>
              )}

              {selectedBooking.status === 'CANCELLED' && (
                <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>This booking has been cancelled.</Alert>
              )}

            </DialogContent>
          </>
        )}
      </Dialog>

      <Snackbar open={copySnack} autoHideDuration={2000} onClose={() => setCopySnack(false)}>
        <Alert severity="success">Link copied!</Alert>
      </Snackbar>
    </Box>
  );
}