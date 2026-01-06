'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import {
  formatDateForDisplay,
  formatTimeForDisplay,
  generateTimeOptions,
  getMinPickupDate,
  generateDefaultBookingDates
} from '@/lib/dateUtils';
import {
  Box, Container, Typography, Paper, Grid, Button, TextField,
  Card, Stack, Divider, Alert,
  CircularProgress, Chip, Dialog, DialogTitle, DialogContent,
  MenuItem, DialogActions, IconButton, useTheme, CardMedia, CardActionArea, Snackbar
} from '@mui/material';
import {
  AccessTime, CheckCircle, Settings, LocalGasStation,
  ArrowBack, Edit, EventSeat, ContentCopy, CalendarMonth,
  LocationOn, Shield, WarningAmber, Close, AccessAlarm
} from '@mui/icons-material';
import dynamic from 'next/dynamic';

// Dynamic QR Code Import
const QRCode = dynamic(() => import('react-qr-code'), {
  ssr: false,
  loading: () => <Box sx={{ height: 180, width: 180, bgcolor: '#f0f0f0', borderRadius: 2 }} />
});

import {
  GET_CAR_QUERY,
  GET_ME_QUERY,
  GET_PLATFORM_SETTINGS_QUERY,
  GET_AVAILABLE_CARS_QUERY,
  GET_BOOKING_QUERY,
  CHECK_CAR_AVAILABILITY_QUERY
} from '@/lib/graphql/queries';
import {
  CREATE_BOOKING_MUTATION,
  CONFIRM_RESERVATION_MUTATION,
} from '@/lib/graphql/mutations';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  // --- 1. INITIALIZATION ---
  const carId = searchParams.get('carId');
  const bookingId = searchParams.get('bookingId') || null;

  // Generate Default Dates as Fallback
  const defaultDates = generateDefaultBookingDates();

  // State: Initialize with Defaults to avoid "null" errors
  const [startDate, setStartDate] = useState(defaultDates.start.date);
  const [startTime, setStartTime] = useState('10:00');
  const [endDate, setEndDate] = useState(defaultDates.end.date);
  const [endTime, setEndTime] = useState('10:00');

  // --- 🔥 CORE FIX: FORCE SYNC DATES FROM URL ON MOUNT ---
  useEffect(() => {
    const urlStart = searchParams.get('start'); // Format: YYYY-MM-DDTHH:mm
    const urlEnd = searchParams.get('end');

    if (urlStart && urlStart.includes('T')) {
      const [d, t] = urlStart.split('T');
      setStartDate(d);
      setStartTime(t ? t.substring(0, 5) : '10:00');
    }
    
    if (urlEnd && urlEnd.includes('T')) {
      const [d, t] = urlEnd.split('T');
      setEndDate(d);
      setEndTime(t ? t.substring(0, 5) : '10:00');
    }
  }, [searchParams]);

  // Derived Full ISO Strings for Backend
  const startDateTime = startDate && startTime ? `${startDate}T${startTime}:00` : '';
  const endDateTime = endDate && endTime ? `${endDate}T${endTime}:00` : '';

  const hasDates = !!(startDate && startTime && endDate && endTime);

  // States
  const [isCarAvailable, setIsCarAvailable] = useState(true);
  const [changeCarDialog, setChangeCarDialog] = useState(false);
  const [emailVerificationPopup, setEmailVerificationPopup] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState<any>(null);
  const [verificationTimer, setVerificationTimer] = useState<string>('60:00');
  const [bookingType, setBookingType] = useState<'RENTAL' | 'REPLACEMENT'>('RENTAL');
  const [copySuccess, setCopySuccess] = useState(false);

  // --- 2. QUERIES ---
  const { data: userData } = useQuery(GET_ME_QUERY, { skip: !session });
  const { data: platformData } = useQuery(GET_PLATFORM_SETTINGS_QUERY);

  // Get Booking Data (If editing existing booking)
  const { data: bookingData, loading: bookingLoading } = useQuery(GET_BOOKING_QUERY, {
    variables: bookingId ? { id: bookingId } : undefined,
    skip: !bookingId,
    fetchPolicy: 'network-only'
  });

  const carQueryId = carId || bookingData?.booking?.car?.id;

  // Get Car Details
  const { data: carData, loading: carLoading } = useQuery(GET_CAR_QUERY, {
    variables: carQueryId ? { id: carQueryId } : undefined,
    skip: !carQueryId,
    fetchPolicy: 'cache-and-network'
  });

  // Real-time Availability Check
  const { data: availabilityData, loading: checkingAvailability } = useQuery(CHECK_CAR_AVAILABILITY_QUERY, {
    variables: {
      carId: carQueryId,
      startDate: startDateTime ? new Date(startDateTime).toISOString() : new Date().toISOString(),
      endDate: endDateTime ? new Date(endDateTime).toISOString() : new Date().toISOString()
    },
    skip: !carQueryId || !hasDates,
    fetchPolicy: 'network-only'
  });

  const { data: availableCarsData, loading: availableCarsLoading } = useQuery(GET_AVAILABLE_CARS_QUERY, {
    variables: {
      startDate: startDateTime ? new Date(startDateTime).toISOString() : new Date().toISOString(),
      endDate: endDateTime ? new Date(endDateTime).toISOString() : new Date().toISOString(),
    },
    skip: !changeCarDialog || !hasDates,
    fetchPolicy: 'network-only'
  });

  const [createBooking, { loading: createBookingLoading }] = useMutation(CREATE_BOOKING_MUTATION);
  const [confirmReservation, { loading: confirmReservationLoading }] = useMutation(CONFIRM_RESERVATION_MUTATION);

  // --- 3. LOGIC ---

  useEffect(() => {
    if (availabilityData?.checkCarAvailability) {
      setIsCarAvailable(availabilityData.checkCarAvailability.available);
    }
  }, [availabilityData]);

  // Sync from DB Booking (Only if NO URL params exist)
  useEffect(() => {
    if (bookingData?.booking) {
      const booking = bookingData.booking;
      if (booking.status === 'PENDING' && booking.verification?.token) {
        setConfirmedBookingData(booking);
        setEmailVerificationPopup(true);
      }
      
      const urlStart = searchParams.get('start');
      // If URL params are missing, revert to what's in the DB
      if (!urlStart && booking.startDate && booking.endDate) {
         try {
            const sDate = new Date(booking.startDate);
            const eDate = new Date(booking.endDate);
            if (!isNaN(sDate.getTime()) && !isNaN(eDate.getTime())) {
                setStartDate(sDate.toISOString().split('T')[0]);
                setStartTime(booking.pickupTime || '10:00');
                setEndDate(eDate.toISOString().split('T')[0]);
                setEndTime(booking.returnTime || '10:00');
            }
         } catch(e) {}
      }
      setBookingType(booking.bookingType);
    }
  }, [bookingData, searchParams]);

  // Timer Logic
  useEffect(() => {
    if (!emailVerificationPopup || !confirmedBookingData?.verification?.expiresAt) {
      setVerificationTimer('60:00');
      return;
    }
    
    const expiryString = confirmedBookingData.verification.expiresAt;
    const testDate = new Date(expiryString);
    if (isNaN(testDate.getTime())) return;

    const interval = setInterval(() => {
      try {
        const expiresAt = new Date(expiryString);
        const now = new Date();
        const diff = expiresAt.getTime() - now.getTime();
        
        if (diff <= 0) { 
          setVerificationTimer('EXPIRED'); 
          clearInterval(interval); 
          return; 
        }

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setVerificationTimer(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } catch (e) { 
        setVerificationTimer('ERROR'); 
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [emailVerificationPopup, confirmedBookingData]);

  // Price Calculation
  const priceDetails = useMemo(() => {
    if (!carData?.car || !hasDates || !platformData?.platformSettings) return null;
    
    const car = carData.car;
    const settings = platformData.platformSettings;
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    
    const diffMs = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) || 1; 
    
    let isYoung = false;
    if (userData?.me?.dateOfBirth) {
      const age = Math.floor((new Date().getTime() - new Date(userData.me.dateOfBirth).getTime()) / (31557600000));
      if (age < (settings.youngDriverMinAge || 25)) isYoung = true;
    }

    const basePrice = (car.pricePerDay || 0) * diffDays;
    const surchargePerDay = isYoung ? (settings.youngDriverFee || 30) : 0;
    const totalSurcharge = surchargePerDay * diffDays;
    const taxAmount = ((basePrice + totalSurcharge) * (settings.taxPercentage || 20)) / 100;
    const totalPrice = basePrice + totalSurcharge + taxAmount;

    return {
      durationLabel: `${diffDays} days`,
      basePrice, totalSurcharge, taxAmount, totalPrice, isYoung, deposit: car.depositAmount
    };
  }, [carData, startDateTime, endDateTime, platformData, userData, hasDates]);

  // Handlers
  const handleConfirmAction = async () => {
    try {
      let bookingIdToUse = bookingId;
      if (!bookingIdToUse) {
        const { data: bData } = await createBooking({
          variables: {
            input: {
              carId: carQueryId,
              startDate: new Date(startDateTime).toISOString(),
              endDate: new Date(endDateTime).toISOString(),
              pickupTime: startTime,
              returnTime: endTime,
              basePrice: priceDetails?.basePrice,
              taxAmount: priceDetails?.taxAmount,
              totalPrice: priceDetails?.totalPrice,
              depositAmount: priceDetails?.deposit,
              bookingType
            }
          }
        });
        if (bData?.createBooking?.id) bookingIdToUse = bData.createBooking.id;
      }

      if (bookingIdToUse) {
        const { data: confirmData } = await confirmReservation({ variables: { id: bookingIdToUse } });
        if (confirmData?.confirmReservation?.id) {
          setConfirmedBookingData(confirmData.confirmReservation);
          setEmailVerificationPopup(true);
          setVerificationTimer('59:59'); 
        }
      }
    } catch (error: any) {
      alert(error.message || 'Booking failed');
    }
  };

  const handleCopyLink = () => {
    if (confirmedBookingData?.verification?.token) {
      const link = `${window.location.origin}/verification/${confirmedBookingData.verification.token}`;
      navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const isLoading = status === 'loading' || bookingLoading || carLoading || !carData?.car;

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
        <CircularProgress size={40} sx={{ color: '#7C3AED' }} />
      </Box>
    );
  }

  const car = carData.car;

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
      <Container maxWidth="xl">
        
        {/* HEADER */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1} onClick={() => router.push('/cars')} sx={{ cursor: 'pointer', color: '#64748B', transition:'0.2s', '&:hover':{color:'#7C3AED', transform:'translateX(-4px)'} }}>
            <ArrowBack fontSize="small" /> <Typography fontWeight={600}>Back to Fleet</Typography>
          </Stack>
          <Typography variant="h5" fontWeight={800} color="#0F172A">Secure Checkout</Typography>
          <Box width={50} />
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={7} lg={8}>
            <Stack spacing={4}>
              
              {/* 1. DATE SELECTOR */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                <Box display="flex" justifyContent="space-between" mb={3}>
                   <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <CalendarMonth sx={{ color: '#7C3AED' }} /> Trip Dates
                   </Typography>
                   {checkingAvailability && <Chip size="small" label="Checking availability..." sx={{ bgcolor: '#F1F5F9' }} />}
                </Box>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" fontWeight={700} color="#64748B" mb={1} display="block">PICK-UP</Typography>
                    <Stack direction="row" spacing={1}>
                      <TextField type="date" fullWidth value={startDate} onChange={(e) => setStartDate(e.target.value)} size="small" />
                      <TextField select value={startTime} onChange={(e) => setStartTime(e.target.value)} size="small" sx={{ minWidth: 100 }}>
                        {generateTimeOptions().map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                      </TextField>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" fontWeight={700} color="#64748B" mb={1} display="block">DROP-OFF</Typography>
                    <Stack direction="row" spacing={1}>
                      <TextField type="date" fullWidth value={endDate} onChange={(e) => setEndDate(e.target.value)} size="small" />
                      <TextField select value={endTime} onChange={(e) => setEndTime(e.target.value)} size="small" sx={{ minWidth: 100 }}>
                         {generateTimeOptions().map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                      </TextField>
                    </Stack>
                  </Grid>
                </Grid>
                {!isCarAvailable && hasDates && (
                  <Alert severity="error" sx={{ mt: 3 }} action={<Button color="error" size="small" onClick={() => setChangeCarDialog(true)}>Change Car</Button>}>
                    Car Unavailable for selected dates.
                  </Alert>
                )}
              </Paper>

              {/* 2. VEHICLE INFO */}
              <Paper elevation={0} sx={{ borderRadius: 4, bgcolor: 'white', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <LocationOn sx={{ color: '#7C3AED' }} /> Selected Vehicle
                   </Typography>
                   <Button startIcon={<Edit />} size="small" onClick={() => setChangeCarDialog(true)} sx={{ color: '#7C3AED', fontWeight: 700 }}>Change</Button>
                </Box>
                <Grid container alignItems="center">
                   <Grid item xs={12} md={5} sx={{ bgcolor: '#F8FAFC', p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
                      <Box 
                        component="img" 
                        src={car.images?.[0]?.url} 
                        sx={{ width: '100%', maxHeight: 180, objectFit: 'contain', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.15))' }} 
                        alt={car.model.name}
                      />
                   </Grid>
                   <Grid item xs={12} md={7} sx={{ p: 4 }}>
                      <Typography variant="overline" color="primary" fontWeight={800}>{car.brand.name}</Typography>
                      <Typography variant="h4" fontWeight={900} color="#0F172A" sx={{ lineHeight: 1, mb: 2 }}>{car.model.name}</Typography>
                      
                      <Stack direction="row" spacing={1} mb={3} flexWrap="wrap" gap={1}>
                         <Chip label={car.transmission} size="small" icon={<Settings sx={{fontSize:14}}/>} sx={{fontWeight:600}} />
                         <Chip label={car.fuelType} size="small" icon={<LocalGasStation sx={{fontSize:14}}/>} sx={{fontWeight:600}} />
                         <Chip label={`${car.seats} Seats`} size="small" icon={<EventSeat sx={{fontSize:14}}/>} sx={{fontWeight:600}} />
                      </Stack>
                      
                      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                      
                      <Box display="flex" gap={4}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Daily Limit</Typography>
                          <Typography fontWeight={700}>{car.dailyKmLimit || 'Unlimited'} KM</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Deposit</Typography>
                          <Typography fontWeight={700}>€{car.depositAmount}</Typography>
                        </Box>
                      </Box>
                   </Grid>
                </Grid>
              </Paper>
            </Stack>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid item xs={12} md={5} lg={4}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'white', border: '1px solid #E2E8F0', position: 'sticky', top: 100 }}>
               <Typography variant="h6" fontWeight={800} mb={3}>Payment Summary</Typography>
               {priceDetails ? (
                 <Stack spacing={2.5}>
                    <Box display="flex" justifyContent="space-between">
                       <Typography color="text.secondary">Rental ({priceDetails.durationLabel})</Typography>
                       <Typography fontWeight={700}>€{priceDetails.basePrice.toFixed(2)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                       <Typography color="text.secondary">VAT ({platformData?.platformSettings?.taxPercentage || 20}%)</Typography>
                       <Typography fontWeight={700}>€{priceDetails.taxAmount.toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ borderStyle: 'dashed' }} />
                    <Box display="flex" justifyContent="space-between" alignItems="flex-end">
                       <Typography variant="h6" fontWeight={800}>Total</Typography>
                       <Typography variant="h4" fontWeight={800} color="#7C3AED">€{priceDetails.totalPrice.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: 2, border: '1px solid #BBF7D0', display: 'flex', gap: 1 }}>
                       <Shield sx={{ color: '#16A34A', fontSize: 20 }} />
                       <Typography variant="caption" color="#15803D" fontWeight={500} lineHeight={1.4}>
                         No charge now. Payment collected after verification.
                       </Typography>
                    </Box>
                    <Button 
                      fullWidth variant="contained" size="large" 
                      onClick={handleConfirmAction}
                      disabled={!isCarAvailable || createBookingLoading || confirmReservationLoading}
                      sx={{ mt: 1, bgcolor: '#0F172A', py: 1.5, fontWeight: 800, '&:hover': { bgcolor: '#334155' } }}
                    >
                      Confirm Reservation
                    </Button>
                 </Stack>
               ) : (
                 <Box textAlign="center" py={4} color="text.secondary">Select dates to view price breakdown.</Box>
               )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* --- MODALS --- */}

      <Dialog 
        open={changeCarDialog} 
        onClose={() => setChangeCarDialog(false)} 
        maxWidth="lg" 
        fullWidth 
        PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' } }}
      >
        <Box sx={{ p: 3, px: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
           <Typography variant="h6" fontWeight={800} color="#0F172A">Available Cars for These Dates</Typography>
           <IconButton onClick={() => setChangeCarDialog(false)}><Close /></IconButton>
        </Box>
        <DialogContent sx={{ bgcolor: '#FFFFFF', p: 4 }}>
           {availableCarsLoading ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={40} sx={{ color: '#7C3AED' }} /></Box>
           ) : availableCarsData?.availableCars?.length > 0 ? (
             <Grid container spacing={3}>
                {availableCarsData.availableCars.map((c: any) => (
                  <Grid item xs={12} sm={6} md={4} key={c.id}>
                     <Card 
                       elevation={0}
                       sx={{ borderRadius: 4, border: '1px solid #E2E8F0', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: '#7C3AED', transform: 'translateY(-4px)', boxShadow: '0 12px 24px -10px rgba(124, 58, 237, 0.15)' } }}
                       onClick={() => {
                          const newUrl = `/booking?carId=${c.id}&start=${startDateTime}&end=${endDateTime}`;
                          router.push(newUrl);
                          setChangeCarDialog(false);
                       }}
                     >
                        <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                          <Box sx={{ height: 180, bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                             <Box component="img" src={c.images?.[0]?.url} sx={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))' }} />
                          </Box>
                          <Box sx={{ p: 3, flexGrow: 1 }}>
                             <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 0.5 }}>{c.brand.name}</Typography>
                             <Typography variant="h5" fontWeight={900} color="#0F172A" sx={{ mb: 2 }}>{c.model.name}</Typography>
                             <Stack direction="row" spacing={1} mb={3}>
                                <Chip label={c.transmission} size="small" sx={{ borderRadius: 1, fontWeight: 600, bgcolor: '#F1F5F9', color: '#475569' }} />
                                <Chip label={c.fuelType} size="small" sx={{ borderRadius: 1, fontWeight: 600, bgcolor: '#F1F5F9', color: '#475569' }} />
                             </Stack>
                             <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />
                             <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6" fontWeight={800} color="#0F172A">€{c.pricePerDay}<Typography component="span" variant="body2" color="text.secondary" fontWeight={500}>/day</Typography></Typography>
                             </Box>
                          </Box>
                        </CardActionArea>
                     </Card>
                  </Grid>
                ))}
             </Grid>
           ) : (
             <Box textAlign="center" py={8}>
               <Typography variant="h6" fontWeight={700} color="#0F172A">No other cars available</Typography>
               <Typography color="text.secondary">Try changing your dates to see more options.</Typography>
             </Box>
           )}
        </DialogContent>
      </Dialog>

      {/* 2. VERIFICATION MODAL (FIXED TIMER & NO CLOSE BUTTON) */}
      <Dialog 
        open={emailVerificationPopup} 
        maxWidth="md" 
        fullWidth 
        PaperProps={{ 
          sx: { 
            borderRadius: 6, 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          } 
        }}
        // Prevent closing by clicking outside or pressing Escape
        onClose={(event, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            setEmailVerificationPopup(false);
          }
        }}
      >
        <Grid container>
          {/* Left Side: Information & Timer */}
          <Grid item xs={12} md={5} sx={{ 
            bgcolor: '#7C3AED', 
            p: 5, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            color: 'white',
            position: 'relative'
          }}>
             <Box sx={{ 
               width: 64, 
               height: 64, 
               borderRadius: '50%', 
               bgcolor: 'rgba(255,255,255,0.2)', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center', 
               mb: 3 
             }}>
               <CheckCircle sx={{ fontSize: 40, color: 'white' }} />
             </Box>
             
             <Typography variant="h4" fontWeight={900} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
               Booking Saved!
             </Typography>
             <Typography sx={{ opacity: 0.9, lineHeight: 1.6, fontSize: '1.05rem', mb: 5 }}>
               Your reservation is held. Complete the verification process now to fully secure your vehicle.
             </Typography>
          </Grid>

          {/* Right Side: QR & Actions */}
          <Grid item xs={12} md={7} sx={{ p: 6, textAlign: 'center', bgcolor: 'white' }}>
             
             {/* QR Code Section */}
             <Box sx={{ mb: 4 }}>
               {confirmedBookingData?.verification?.token ? (
                 <Box sx={{ 
                   p: 2, 
                   bgcolor: 'white',
                   borderRadius: 4,
                   display: 'inline-block',
                   border: '2px solid #F1F5F9',
                   boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                 }}>
                   <QRCode 
                     value={`${window.location.origin}/verification/${confirmedBookingData.verification.token}`} 
                     size={180} 
                     level="H"
                   />
                 </Box>
               ) : (
                 <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <CircularProgress size={40} sx={{ color: '#7C3AED' }} />
                 </Box>
               )}
               <Typography variant="body1" fontWeight={700} color="#0F172A" sx={{ mt: 3 }}>
                 Scan QR to verify Identity
               </Typography>
             </Box>
             
             {/* Action Buttons */}
             <Stack spacing={2} sx={{ width: '100%', maxWidth: 320, mx: 'auto' }}>
                <Button 
                    fullWidth 
                    variant="contained" 
                    size="large"
                    startIcon={<ContentCopy />} 
                    onClick={handleCopyLink}
                    sx={{ 
                      py: 1.8, 
                      borderRadius: 10, 
                      bgcolor: '#0F172A', 
                      color: 'white',
                      fontWeight: 800,
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': { bgcolor: '#1E293B' }
                    }}
                >
                    {copySuccess ? 'Link Copied!' : 'Copy Verification Link'}
                </Button>

                <Button 
                    fullWidth 
                    variant="outlined" 
                    onClick={() => router.push('/bookingRecords')}
                    sx={{ 
                      py: 1.8, 
                      borderRadius: 10, 
                      borderColor: '#E2E8F0', 
                      color: '#64748B', 
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' }
                    }}
                >
                    Go to Booking Records
                </Button>
             </Stack>
             
             {/* Warning Footer */}
             <Alert 
               severity="warning" 
               icon={<WarningAmber sx={{ color: '#B45309' }} />}
               sx={{ 
                 mt: 5, 
                 borderRadius: 4, 
                 textAlign: 'left', 
                 bgcolor: '#FFFBEB', 
                 border: '1px solid #FEF3C7',
                 '& .MuiAlert-message': { color: '#92400E', fontWeight: 500, fontSize: '0.85rem' }
               }}
             >
                Important: If verification is not started within 1 hour, your booking will be automatically cancelled to release the vehicle.
             </Alert>
          </Grid>
        </Grid>
      </Dialog>

      <Snackbar open={copySuccess} autoHideDuration={2000} onClose={() => setCopySuccess(false)} message="Link copied to clipboard" />

    </Box>
  );
}

export default function BookingPageWrapper() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>}>
      <BookingContent />
    </Suspense>
  );
}