'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Box, Container, Typography, Card, Stack, Chip, Button,
  Divider, Skeleton, IconButton, Dialog, DialogContent,
  DialogTitle, Grid, Paper, Fade, Alert, TextField, Link
} from '@mui/material';
import {
  AccessTime as TimerIcon,
  CheckCircle as SuccessIcon,
  Cancel as CancelIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ArrowForwardIos as ArrowIcon,
  Close as CloseIcon,
  DirectionsCar as CarIcon,
  CalendarMonth as DateIcon,
  QrCode2 as QrIcon,
  Link as LinkIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import QRCode from 'react-qr-code';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { GET_MY_BOOKINGS_QUERY } from '@/lib/graphql/queries';
import { RESEND_VERIFICATION_LINK_MUTATION, CANCEL_BOOKING_MUTATION } from '@/lib/graphql/mutations';
import { format } from 'date-fns';
import { formatUtcToLocalTime, getExpirationMessage, getRemainingMinutes, formatRemainingTime } from '@/lib/timeUtils';
import { formatDateForDisplay, formatTimeForDisplay, formatDateTimeForDisplay } from '@/lib/dateUtils';

export default function BookingRecordsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const client = useApolloClient();

  const { data, loading, error, refetch } = useQuery(GET_MY_BOOKINGS_QUERY, {
    fetchPolicy: 'cache-and-network',
    skip: status !== 'authenticated'
  });

  // Auto-refetch if refresh parameter is present
  useEffect(() => {
    if (searchParams.get('refresh')) {
      // Invalidate cache first
      client.cache.evict({ fieldName: 'myBookings' });
      client.cache.gc();

      refetch();
      // Clean up URL
      router.replace('/bookingRecords');
    }
  }, [searchParams, refetch, router, client]);

  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/bookingRecords');
    }
  }, [status, router]);

  // Invalidate cache when component mounts (for fresh data)
  useEffect(() => {
    if (status === 'authenticated') {
      client.cache.evict({ fieldName: 'myBookings' });
      client.cache.gc();
    }
  }, [status, client]);

  const handleOpenDetails = (booking: any) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  if (status === 'loading') {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Typography>Checking authentication...</Typography>
      </Box>
    );
  }

  if (error) return <Alert severity="error">Failed to load bookings</Alert>;

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 5, pt: { xs: 10, md: 12 } }}>
      <Container maxWidth="md">
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} px={1}>
          <Typography variant="h5" fontWeight={900}>My Bookings</Typography>
          <Button size="small" variant="text" onClick={() => refetch()} sx={{ fontWeight: 700 }}>Refresh</Button>
        </Stack>

        {loading ? (
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 4 }} />)}
          </Stack>
        ) : data?.myBookings.length === 0 ? (
          <Box textAlign="center" py={10}>
            <CarIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" fontWeight={700}>No bookings yet</Typography>
            <Button variant="contained" sx={{ mt: 2, borderRadius: 2 }} onClick={() => window.location.href = '/cars'}>Explore Cars</Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {data?.myBookings.map((booking: any) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onViewDetails={() => handleOpenDetails(booking)} 
              />
            ))}
          </Stack>
        )}
      </Container>

      {/* 🚀 DETAILS MODAL */}
      <BookingDetailsModal 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        booking={selectedBooking} 
      />
    </Box>
  );
}

// --- 🏷️ SUB-COMPONENT: BOOKING CARD ---
const BookingCard = ({ booking, onViewDetails }: any) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Timer Logic for DRAFT bookings and verification expiry
  useEffect(() => {
    if (booking.status !== 'DRAFT' && booking.status !== 'AWAITING_VERIFICATION') return;

    const interval = setInterval(() => {
      if (booking.status === 'DRAFT') {
        // Draft bookings expire 1 hour from creation
        const createdTime = new Date(booking.createdAt).getTime();
        const expiryTime = createdTime + (60 * 60 * 1000); // 1 hour expiry
        const now = new Date().getTime();
        const diff = expiryTime - now;

        if (diff <= 0) {
          setTimeLeft('Expired');
          clearInterval(interval);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          setTimeLeft(`${hours}h left`);
        }
      } else if (booking.status === 'AWAITING_VERIFICATION' && booking.verification?.expiresAt) {
        // Verification bookings use UTC expiresAt from backend
        const remainingMinutes = getRemainingMinutes(booking.verification.expiresAt);
        setTimeLeft(formatRemainingTime(remainingMinutes));

        if (remainingMinutes <= 0) {
          clearInterval(interval);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return { bg: '#DCFCE7', text: '#166534', icon: <SuccessIcon fontSize="small" /> };
      case 'DRAFT': return { bg: '#FEF9C3', text: '#854D0E', icon: <EditIcon fontSize="small" /> };
      case 'AWAITING_VERIFICATION': return { bg: '#DBEAFE', text: '#1E40AF', icon: <QrIcon fontSize="small" /> };
      case 'CANCELLED': return { bg: '#FEE2E2', text: '#991B1B', icon: <CancelIcon fontSize="small" /> };
      default: return { bg: '#F1F5F9', text: '#475569', icon: <InfoIcon fontSize="small" /> };
    }
  };

  const style = getStatusColor(booking.status);

  return (
    <Fade in timeout={500}>
      <Card 
        onClick={onViewDetails}
        sx={{ 
          borderRadius: 4, 
          border: '1px solid #E2E8F0', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          cursor: 'pointer',
          '&:active': { transform: 'scale(0.98)', transition: '0.1s' }
        }}
      >
        <Box p={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 60, height: 60, borderRadius: 2, bgcolor: '#F1F5F9', overflow: 'hidden' }}>
              <img src={booking.car.images[0]?.imagePath} alt="car" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
            <Box flex={1}>
              <Typography fontWeight={800} fontSize={16}>{booking.car.brand.name} {booking.car.model.name}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DateIcon sx={{ fontSize: 12 }} />
                {(() => {
                  try {
                    const startDateStr = formatDateForDisplay(booking.startDate);
                    const endDateStr = formatDateForDisplay(booking.endDate);

                    if (startDateStr === 'Invalid Date' || endDateStr === 'Invalid Date') {
                      return 'Invalid dates';
                    }

                    // Extract just the month and day part for compact display
                    const startParts = startDateStr.split(' ');
                    const endParts = endDateStr.split(' ');

                    if (startParts.length >= 2 && endParts.length >= 2) {
                      return `${startParts[1]} ${startParts[0]} - ${endParts[1]} ${endParts[0]}`;
                    }

                    return `${startDateStr} - ${endDateStr}`;
                  } catch (error) {
                    return 'Invalid dates';
                  }
                })()}
              </Typography>
            </Box>
            <Stack alignItems="flex-end">
              <Chip 
                label={booking.status} 
                size="small" 
                sx={{ bgcolor: style.bg, color: style.text, fontWeight: 800, fontSize: 10 }} 
              />
              {(booking.status === 'DRAFT' || booking.status === 'AWAITING_VERIFICATION') && (
                <Typography fontSize={10} color={booking.status === 'DRAFT' ? 'error.main' : 'primary.main'} fontWeight={700} mt={0.5}>
                  {booking.status === 'DRAFT' ? timeLeft : (booking.verification ? 'Verification active' : '')}
                </Typography>
              )}
            </Stack>
            <ArrowIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
          </Stack>
        </Box>
      </Card>
    </Fade>
  );
};

// --- 🚀 SUB-COMPONENT: DETAILS MODAL ---
const BookingDetailsModal = ({ open, onClose, booking }: any) => {
  const router = useRouter();
  const [verificationTimer, setVerificationTimer] = useState<string>('');
  const [magicLink, setMagicLink] = useState<string>('');

  const [resendVerification, { loading: resendLoading }] = useMutation(RESEND_VERIFICATION_LINK_MUTATION);
  const [cancelBooking, { loading: cancelLoading }] = useMutation(CANCEL_BOOKING_MUTATION);

  useEffect(() => {
    console.log('🔍 Booking Records - Checking verification data:', {
      bookingStatus: booking?.status,
      hasVerification: !!booking?.verification,
      verificationToken: booking?.verification?.token,
      verificationId: booking?.verification?.id
    });

    if (booking?.status === 'AWAITING_VERIFICATION' && booking.verification && booking.verification.token) {
      // Generate magic link for verification
      const link = `${window.location.origin}/verification/${booking.verification.token}`;
      console.log('🔗 Generated magic link:', link);
      console.log('🔗 Raw token:', booking.verification.token);
      setMagicLink(link);

      // Set up 1-hour expiry timer
      const interval = setInterval(() => {
        const createdTime = new Date(booking.verification.createdAt).getTime();
        const expiryTime = createdTime + (60 * 60 * 1000); // 1 hour expiry
        const now = new Date().getTime();
        const diff = expiryTime - now;

        if (diff <= 0) {
          setVerificationTimer('Expired');
          clearInterval(interval);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setVerificationTimer(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [booking]);

  const handleContinueBooking = () => {
    router.push(`/booking?bookingId=${booking.id}`);
    onClose();
  };

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this draft booking? This action cannot be undone.')) {
      return;
    }

    try {
      await cancelBooking({
        variables: { id: booking.id }
      });

      alert('Booking cancelled successfully!');
      onClose();
      // Refresh the bookings list
      window.location.reload();
    } catch (error: any) {
      alert('Failed to cancel booking: ' + error.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth sx={{ m: { xs: 1, md: 5 }, borderRadius: { md: 4 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0' }}>
        <Typography fontWeight={900}>Booking Details</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F8FAFC' }}>
        {/* Status Chip */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Chip
            label={booking.status}
            size="small"
            sx={{
              bgcolor: booking.status === 'DRAFT' ? '#FEF9C3' :
                     booking.status === 'AWAITING_VERIFICATION' ? '#DBEAFE' :
                     booking.status === 'CANCELLED' ? '#FEE2E2' : '#DCFCE7',
              color: booking.status === 'DRAFT' ? '#854D0E' :
                    booking.status === 'AWAITING_VERIFICATION' ? '#1E40AF' :
                    booking.status === 'CANCELLED' ? '#991B1B' : '#166534',
              fontWeight: 800,
              fontSize: 12,
              px: 2
            }}
          />
        </Box>

        {/* DRAFT Status - Continue Booking Button */}
        {booking.status === 'DRAFT' && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 3, bgcolor: '#FEF9C3', border: '1px solid #FBBF24' }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <EditIcon sx={{ color: '#854D0E' }} />
              <Typography fontWeight={800} color="#854D0E">Draft Booking</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Your booking is saved as a draft. Complete your reservation to secure this vehicle.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleContinueBooking}
                sx={{
                  bgcolor: '#854D0E',
                  '&:hover': { bgcolor: '#713F12' },
                  borderRadius: 2,
                  fontWeight: 700,
                  flex: 1
                }}
              >
                Continue Booking
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleCancelBooking}
                disabled={cancelLoading}
                sx={{
                  borderColor: '#DC2626',
                  color: '#DC2626',
                  '&:hover': {
                    borderColor: '#B91C1C',
                    bgcolor: '#FEF2F2'
                  },
                  borderRadius: 2,
                  fontWeight: 700,
                  flex: 1
                }}
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel Booking'}
              </Button>
            </Stack>
          </Paper>
        )}

        {/* CANCELLED Status - Read-Only View */}
        {booking.status === 'CANCELLED' && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 3, bgcolor: '#FEE2E2', border: '1px solid #DC2626' }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <ErrorIcon sx={{ color: '#991B1B' }} />
              <Typography fontWeight={800} color="#991B1B">Booking Cancelled</Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary" mb={3}>
              This booking has been cancelled and is no longer available. You can view the details below but cannot modify or verify this booking.
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Cancelled bookings are read-only. If you need to make a new booking, please create a new reservation.
              </Typography>
            </Alert>
          </Paper>
        )}

        {/* AWAITING_VERIFICATION Status - QR Code & Magic Link (Only show if NOT cancelled) */}
        {booking.status === 'AWAITING_VERIFICATION' && booking.verification && booking.status !== 'CANCELLED' && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 3, bgcolor: '#DBEAFE', border: '1px solid #3B82F6' }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <QrIcon sx={{ color: '#1E40AF' }} />
              <Typography fontWeight={800} color="#1E40AF">Verification Required</Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary" mb={3}>
              Scan the QR code or use the magic link to verify your booking.
              {booking.verification?.expiresAt && (
                <><br />{getExpirationMessage(booking.verification.expiresAt)} (your local time)</>
              )}
            </Typography>

            {/* Timer Display */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" fontWeight={900} color="#1E40AF" sx={{ fontFamily: 'monospace' }}>
                {verificationTimer}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {verificationTimer === 'Expired' ? 'Link has expired' : 'remaining'}
              </Typography>
            </Box>

            {/* QR Code and Link Section */}
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 3,
                    border: '2px solid #E2E8F0',
                    display: 'inline-block'
                  }}>
                    <QRCode
                      value={magicLink}
                      size={160}
                      style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Typography variant="caption" color="primary" fontWeight={800} sx={{ textTransform: 'uppercase' }}>
                    Magic Link
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={magicLink}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(magicLink)}
                          sx={{ color: 'primary.main' }}
                        >
                          <LinkIcon />
                        </IconButton>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        borderRadius: 2
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      // Open in new window/tab explicitly
                      window.open(magicLink, '_blank', 'noopener,noreferrer');
                    }}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 700,
                      borderColor: '#1E40AF',
                      color: '#1E40AF',
                      '&:hover': {
                        borderColor: '#1E40AF',
                        bgcolor: '#EFF6FF'
                      }
                    }}
                  >
                    Open Verification Page (New Tab)
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* AWAITING_VERIFICATION Status - No Valid Verification Token */}
        {booking.status === 'AWAITING_VERIFICATION' && !booking.verification && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 3, bgcolor: '#FEF3C7', border: '1px solid #F59E0B' }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <QrIcon sx={{ color: '#92400E' }} />
              <Typography fontWeight={800} color="#92400E">Verification Link Expired</Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary" mb={3}>
              Your verification link has expired. Request a new verification link to complete your booking.
            </Typography>

            <Button
              variant="contained"
              fullWidth
              disabled={resendLoading}
              onClick={async () => {
                try {
                  const { data } = await resendVerification({
                    variables: { bookingId: booking.id }
                  });

                  if (data?.resendVerificationLink?.success) {
                    alert('New verification link sent successfully!');
                    // Optionally refresh the page or update the booking data
                    window.location.reload();
                  } else {
                    throw new Error('Failed to resend verification link');
                  }
                } catch (error: any) {
                  alert('Failed to resend verification link: ' + error.message);
                }
              }}
              sx={{
                bgcolor: '#92400E',
                '&:hover': { bgcolor: '#78350F' },
                borderRadius: 2,
                fontWeight: 700
              }}
            >
              Request New Verification Link
            </Button>
          </Paper>
        )}

        {/* CANCELLED Status - Read-Only Information */}
        {booking.status === 'CANCELLED' && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 3, bgcolor: '#FEE2E2', border: '1px solid #F87171' }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <CancelIcon sx={{ color: '#991B1B' }} />
              <Typography fontWeight={800} color="#991B1B">Booking Cancelled</Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary" mb={3}>
              This booking session has expired and been automatically cancelled. You can only view the booking details.
              If you need to create a new booking, please start the process again.
            </Typography>

            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Reason:</strong> Booking was not verified within the 1-hour time limit.
              </Typography>
            </Alert>
          </Paper>
        )}

        {/* Car Details */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 4, mb: 3 }}>
          <Typography variant="caption" color="primary" fontWeight={800}>CAR DETAILS</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={1} alignItems={{ xs: 'center', sm: 'flex-start' }}>
            <Box sx={{ width: { xs: 120, sm: 100 }, height: { xs: 80, sm: 60 }, borderRadius: 2, overflow: 'hidden' }}>
              <img src={booking.car.images[0]?.imagePath} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography fontWeight={800}>{booking.car.brand.name} {booking.car.model.name}</Typography>
              <Typography variant="body2" color="text.secondary">{booking.car.plateNumber}</Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Booking Details */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 4, mb: 3 }}>
          <Typography variant="caption" color="primary" fontWeight={800}>BOOKING DETAILS</Typography>
          <Stack spacing={2} mt={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Pickup Date</Typography>
              <Typography fontWeight={700}>
                {formatDateForDisplay(booking.startDate)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Return Date</Typography>
              <Typography fontWeight={700}>
                {formatDateForDisplay(booking.endDate)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Rental Type</Typography>
              <Typography fontWeight={700}>{booking.rentalType}</Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Financial Summary */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 4, mb: 3 }}>
          <Typography variant="caption" color="primary" fontWeight={800}>FINANCIAL SUMMARY</Typography>
          <Stack spacing={1} mt={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Base Price</Typography>
              <Typography fontWeight={700}>€{booking.basePrice}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Taxes</Typography>
              <Typography fontWeight={700}>€{booking.taxAmount}</Typography>
            </Box>
            <Divider />
            <Box display="flex" justifyContent="space-between">
              <Typography fontWeight={900}>Total Paid</Typography>
              <Typography fontWeight={900} color="primary">€{booking.totalPrice}</Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Status Info */}
        {booking.status !== 'DRAFT' && booking.status !== 'AWAITING_VERIFICATION' && (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            <Typography variant="caption" fontWeight={700}>Status: {booking.status}</Typography>
            <Typography variant="body2">
              Your booking is {booking.status.toLowerCase()}.
            </Typography>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
};