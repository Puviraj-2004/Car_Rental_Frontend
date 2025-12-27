'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Box, Container, Typography, Paper, Grid, Button, TextField,
  Card, CardContent, CardMedia, Stack, Divider, Alert,
  CircularProgress, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemText, ListItemIcon, Snackbar
} from '@mui/material';
import {
  DirectionsCar, AccessTime, CheckCircle, Warning, Info,
  Event, Schedule, Euro, VerifiedUser, Security, Settings, LocalGasStation
} from '@mui/icons-material';

// GraphQL Queries & Mutations
import { 
  GET_CAR_QUERY, 
  GET_ME_QUERY, 
  GET_PLATFORM_SETTINGS_QUERY 
} from '@/lib/graphql/queries';
import { 
  CREATE_BOOKING_MUTATION, 
  SEND_VERIFICATION_LINK_MUTATION 
} from '@/lib/graphql/mutations';

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // --- 1. URL Parameters ---
  const carId = searchParams.get('carId');
  const [startDateTime, setStartDateTime] = useState(searchParams.get('start') || '');
  const [endDateTime, setEndDateTime] = useState(searchParams.get('end') || '');

  // --- 2. Local UI States ---
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(false);
  const [showPriceWarning, setShowPriceWarning] = useState(false);

  // --- 3. Authentication & Redirect Logic ---
  useEffect(() => {
    // Wait for authentication status to be determined
    if (status === 'loading') return;

    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [status, router]);

  // --- 4. GraphQL Queries ---
  const { data: carData, loading: carLoading } = useQuery(GET_CAR_QUERY, { 
    variables: { id: carId }, 
    skip: !carId,
    fetchPolicy: 'cache-and-network'
  });

  const { data: userData } = useQuery(GET_ME_QUERY, { skip: !session });
  const { data: platformData } = useQuery(GET_PLATFORM_SETTINGS_QUERY);

  // --- 5. GraphQL Mutations ---
  const [createBooking, { loading: bookingLoading }] = useMutation(CREATE_BOOKING_MUTATION);
  const [sendVerification] = useMutation(SEND_VERIFICATION_LINK_MUTATION);

  // --- 6. Availability Check (24h Buffer Logic) ---
  useEffect(() => {
    if (carData?.car?.bookings && startDateTime && endDateTime) {
      const userStart = new Date(startDateTime).getTime();
      const userEnd = new Date(endDateTime).getTime();
      const BUFFER = 24 * 60 * 60 * 1000; // 24 மணிநேர பஃபர்

      const hasConflict = carData.car.bookings.some((booking: any) => {
        const bStart = new Date(booking.startDate).getTime() - BUFFER;
        const bEnd = new Date(booking.endDate).getTime() + BUFFER;
        return (userStart < bEnd && userEnd > bStart);
      });

      if (hasConflict) setAvailabilityError(true);
    }
  }, [startDateTime, endDateTime, carData]);

  // --- 7. Young Driver & Price Calculation Logic ---
  const priceDetails = useMemo(() => {
    if (!carData?.car || !startDateTime || !endDateTime || !platformData?.platformSettings) return null;

    const car = carData.car;
    const settings = platformData.platformSettings;
    const profile = userData?.me?.driverProfile;
    
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    // Young Driver / Novice Check
    let isYoung = false;
    let isNovice = false;

    if (profile?.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear();
      if (age < (settings.youngDriverMinAge || 25)) isYoung = true;
    }

    if (profile?.licenseIssueDate) {
      const expYears = new Date().getFullYear() - new Date(profile.licenseIssueDate).getFullYear();
      if (expYears < (settings.noviceLicenseYears || 2)) isNovice = true;
    }

    const basePrice = (car.pricePerDay || 0) * diffDays;
    const surchargePerDay = (isYoung || isNovice) ? (settings.youngDriverFee || 30) : 0;
    const totalSurcharge = surchargePerDay * diffDays;
    
    const taxAmount = ((basePrice + totalSurcharge) * (settings.taxPercentage || 20)) / 100;
    const totalPrice = basePrice + totalSurcharge + taxAmount;

    return {
      days: diffDays,
      basePrice,
      totalSurcharge,
      taxAmount,
      totalPrice,
      isYoung,
      isNovice,
      deposit: car.depositAmount
    };
  }, [carData, startDateTime, endDateTime, platformData, userData]);

  // --- 8. Handle Final Booking ---
  const handleConfirmBooking = async () => {
    if (!priceDetails || availabilityError) return;

    try {
      const { data: bData } = await createBooking({
        variables: {
          input: {
            carId,
            startDate: new Date(startDateTime).toISOString(),
            endDate: new Date(endDateTime).toISOString(),
            basePrice: priceDetails.basePrice,
            taxAmount: priceDetails.taxAmount,
            surchargeAmount: priceDetails.totalSurcharge,
            totalPrice: priceDetails.totalPrice,
            rentalType: 'DAY'
          }
        }
      });

      if (bData?.createBooking?.id) {
        await sendVerification({ variables: { bookingId: bData.createBooking.id } });
        setVerificationDialog(true);
      }
    } catch (err: any) {
      alert("Booking Error: " + err.message);
    }
  };

  if (carLoading || status === 'loading') {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={50} />
        <Typography mt={2} fontWeight={600} color="text.secondary">Fetching Secure Booking Details...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={900} mb={4} sx={{ letterSpacing: -1 }}>
        Finalize Your Reservation
      </Typography>

      <Grid container spacing={4}>
        {/* 🚗 Left Side: Car Info & Date Modification */}
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #E2E8F0', mb: 3 }}>
            <Grid container>
              <Grid item xs={12} sm={5}>
                <CardMedia 
                  component="img" 
                  image={carData?.car?.images?.find((img: any) => img.isPrimary)?.imagePath || carData?.car?.images?.[0]?.imagePath} 
                  sx={{ height: '100%', minHeight: 200, objectFit: 'cover' }}
                />
              </Grid>
              <Grid item xs={12} sm={7} sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight={900}>{carData?.car?.brand.name} {carData?.car?.model.name}</Typography>
                <Typography color="text.secondary" variant="body2" mb={2}>Registration: {carData?.car?.plateNumber}</Typography>
                
                <Stack direction="row" spacing={1}>
                  <Chip icon={<Settings sx={{ fontSize: 14 }} />} label={carData?.car?.transmission} size="small" variant="outlined" />
                  <Chip icon={<LocalGasStation sx={{ fontSize: 14 }} />} label={carData?.car?.fuelType} size="small" variant="outlined" />
                </Stack>
              </Grid>
            </Grid>
          </Card>

          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', mb: 3 }}>
            <Typography variant="h6" fontWeight={800} mb={3} display="flex" alignItems="center">
              <Schedule sx={{ mr: 1, color: '#2563EB' }} /> Change Dates & Time
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Pickup Date & Time" type="datetime-local" value={startDateTime} onChange={(e) => setStartDateTime(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Return Date & Time" type="datetime-local" value={endDateTime} onChange={(e) => setEndDateTime(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>

            {priceDetails?.isYoung && (
              <Alert severity="warning" sx={{ mt: 3, borderRadius: 3, border: '1px solid #fed7aa' }}>
                <Typography variant="subtitle2" fontWeight={800}>Young Driver Surcharge Applied</Typography>
                <Typography variant="body2">Based on your profile, a France-mandated novice driver fee is included in the total.</Typography>
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* 💰 Right Side: Pricing & Verification */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '2px solid #0F172A', position: 'sticky', top: 100 }}>
            <Typography variant="h6" fontWeight={900} mb={3}>Price Breakdown</Typography>
            
            <Stack spacing={2.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary" fontWeight={500}>Rental Fee ({priceDetails?.days} days)</Typography>
                <Typography fontWeight={700}>€{priceDetails?.basePrice.toFixed(2)}</Typography>
              </Box>

              {priceDetails?.totalSurcharge && priceDetails.totalSurcharge > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="error.main" fontWeight={600}>Young/Novice Driver Fee</Typography>
                  <Typography fontWeight={700} color="error.main">+ €{priceDetails.totalSurcharge.toFixed(2)}</Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary" fontWeight={500}>VAT ({platformData?.platformSettings?.taxPercentage}%)</Typography>
                <Typography fontWeight={700}>€{priceDetails?.taxAmount.toFixed(2)}</Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" fontWeight={1000}>Total</Typography>
                <Typography variant="h5" fontWeight={1000} color="primary">€{priceDetails?.totalPrice.toFixed(2)}</Typography>
              </Box>

              <Stack direction="row" spacing={1} sx={{ bgcolor: '#F0F9FF', p: 2, borderRadius: 2, mt: 2 }}>
                <Security color="primary" sx={{ fontSize: 20 }} />
                <Typography variant="caption" color="primary.dark" fontWeight={600}>
                  Refundable Security Deposit: €{priceDetails?.deposit.toFixed(2)} will be held at pickup.
                </Typography>
              </Stack>
            </Stack>

            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              onClick={handleConfirmBooking}
              disabled={availabilityError || bookingLoading}
              sx={{ mt: 4, py: 2, borderRadius: 3, fontWeight: 900, fontSize: 16, textTransform: 'none', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)' }}
            >
              {bookingLoading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Reservation'}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* 🛑 Availability Conflict Dialog */}
      <Dialog open={availabilityError} onClose={() => router.push('/cars')} PaperProps={{ sx: { borderRadius: 5, p: 2 } }}>
        <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
          <Warning color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" fontWeight={900}>Not Perfect for These Dates</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography color="text.secondary">
            This car is not available for the selected time period. It might be booked or under maintenance.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button fullWidth variant="contained" onClick={() => router.push('/cars')} sx={{ borderRadius: 3, py: 1.5, fontWeight: 800, bgcolor: '#0F172A' }}>
            Select Another Car
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🎉 Success & KYC Link Dialog */}
      <Dialog open={verificationDialog} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 6, p: 2 } }}>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Box sx={{ width: 80, height: 80, bgcolor: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
            <CheckCircle color="success" sx={{ fontSize: 50 }} />
          </Box>
          <Typography variant="h5" fontWeight={1000} gutterBottom>Booking Reserved!</Typography>
          <Typography color="text.secondary" mb={4}>
            A magic verification link has been sent to your email. Please upload your documents (NIC/License) via that link to finalize your rental.
          </Typography>
          <Button fullWidth variant="contained" onClick={() => router.push('/bookings')} sx={{ borderRadius: 3, py: 1.5, fontWeight: 900 }}>
            Go to My Bookings
          </Button>
        </DialogContent>
      </Dialog>

    </Container>
  );
}
