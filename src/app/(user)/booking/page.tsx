'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import {
  Box, Container, Typography, Paper, Grid, Button, TextField,
  Card, CardContent, CardMedia, Stack, Divider, Alert,
  CircularProgress, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem,
  IconButton
} from '@mui/material';
import {
  DirectionsCar, AccessTime, CheckCircle, Warning, Info,
  Event, Schedule, Euro, VerifiedUser, Security, Settings, LocalGasStation,
  ArrowBack, Edit
} from '@mui/icons-material';
import dynamic from 'next/dynamic';

const QRCode = dynamic(() => import('react-qr-code'), {
  ssr: false,
  loading: () => <div>Loading QR Code...</div>
});

// GraphQL Queries & Mutations
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
  CONFIRM_BOOKING_MUTATION,
  UPDATE_BOOKING_STATUS_MUTATION,
  SEND_VERIFICATION_LINK_MUTATION
} from '@/lib/graphql/mutations';

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const client = useApolloClient();

  // URL Parameters
  const carId = searchParams.get('carId');
  const bookingId = searchParams.get('bookingId') || null;
  const [startDateTime, setStartDateTime] = useState(searchParams.get('start') || '');
  const [endDateTime, setEndDateTime] = useState(searchParams.get('end') || '');
  // UI States
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(false);
  const [changeCarDialog, setChangeCarDialog] = useState(false);
  const [emailVerificationPopup, setEmailVerificationPopup] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState<any>(null);
  const [verificationTimer, setVerificationTimer] = useState<string>('60:00');

  // Verification timer effect
  useEffect(() => {
    if (!emailVerificationPopup || !confirmedBookingData?.verification?.expiresAt) return;

    const interval = setInterval(() => {
      const expiresAt = new Date(confirmedBookingData.verification.expiresAt);
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setVerificationTimer('EXPIRED');
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setVerificationTimer(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [emailVerificationPopup, confirmedBookingData]);

  // GraphQL Queries
  const { data: userData } = useQuery(GET_ME_QUERY, { skip: !session });
  const { data: platformData } = useQuery(GET_PLATFORM_SETTINGS_QUERY);

  // Query for existing booking (if bookingId is provided)
  const { data: bookingData, loading: bookingLoading, refetch: refetchBooking } = useQuery(GET_BOOKING_QUERY, {
    variables: bookingId ? { id: bookingId } : undefined,
    skip: !bookingId,
    fetchPolicy: 'cache-and-network'
  });

  // Car query - uses bookingData as fallback
  const { data: carData, loading: carLoading } = useQuery(GET_CAR_QUERY, {
    variables: { id: carId || bookingData?.booking?.car?.id },
    skip: !carId && !bookingData?.booking?.car?.id,
    fetchPolicy: 'cache-and-network'
  });

  // Available rental types based on car pricing
  const availableRentalTypes = useMemo(() => {
    if (!carData?.car) return [];

    const car = carData.car;
    const types: { value: 'HOUR' | 'DAY' | 'KM'; label: string }[] = [];

    if (car.pricePerHour && car.pricePerHour > 0) {
      types.push({ value: 'HOUR', label: 'Hourly' });
    }
    if (car.pricePerDay && car.pricePerDay > 0) {
      types.push({ value: 'DAY', label: 'Daily' });
    }
    if (car.pricePerKm && car.pricePerKm > 0) {
      types.push({ value: 'KM', label: 'Per KM' });
    }

    return types;
  }, [carData?.car]);

  const [rentalType, setRentalType] = useState<'HOUR' | 'DAY' | 'KM'>('DAY');
  const [bookingType, setBookingType] = useState<'RENTAL' | 'REPLACEMENT'>('RENTAL');

  // Initialize rental type to first available when car data loads
  useEffect(() => {
    if (availableRentalTypes.length > 0 && !availableRentalTypes.find(type => type.value === rentalType)) {
      setRentalType(availableRentalTypes[0].value);
    }
  }, [availableRentalTypes]);

  // Authentication & Redirect Logic
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [status, router]);

  // Validate date strings before using them
  const isValidDate = (dateString: string) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date.getTime());
    } catch (error) {
      console.error('Invalid date string:', dateString, error);
      return false;
    }
  };

  // Query for available cars (for change car functionality)
  const { data: availableCarsData, loading: availableCarsLoading } = useQuery(GET_AVAILABLE_CARS_QUERY, {
    variables: {
      startDate: isValidDate(startDateTime) ? new Date(startDateTime).toISOString() : null,
      endDate: isValidDate(endDateTime) ? new Date(endDateTime).toISOString() : null,
      excludeCarId: carId
    },
    skip: !isValidDate(startDateTime) || !isValidDate(endDateTime) || !changeCarDialog,
    fetchPolicy: 'cache-and-network'
  });

  // Check car availability when dates change
  const { data: availabilityData, loading: availabilityLoading } = useQuery(CHECK_CAR_AVAILABILITY_QUERY, {
    variables: {
      carId: carId || bookingData?.booking?.car?.id,
      startDate: isValidDate(startDateTime) ? new Date(startDateTime).toISOString() : '',
      endDate: isValidDate(endDateTime) ? new Date(endDateTime).toISOString() : ''
    },
    skip: !carId && !bookingData?.booking?.car?.id || !startDateTime || !endDateTime,
    fetchPolicy: 'cache-and-network'
  });

  // GraphQL Mutations
  const [createBooking, { loading: createBookingLoading }] = useMutation(CREATE_BOOKING_MUTATION);
  const [confirmBooking, { loading: confirmBookingLoading }] = useMutation(CONFIRM_BOOKING_MUTATION);
  const [updateBookingStatus] = useMutation(UPDATE_BOOKING_STATUS_MUTATION);
  const [sendVerification] = useMutation(SEND_VERIFICATION_LINK_MUTATION);

  // Populate form data from existing booking
  useEffect(() => {
    if (bookingData?.booking) {
      const booking = bookingData.booking;
      setStartDateTime(booking.startDate);
      setEndDateTime(booking.endDate);
      setRentalType(booking.rentalType);
      setBookingType(booking.bookingType);
    }
  }, [bookingData]);

  // Check availability when dates change
  useEffect(() => {
    if (availabilityData?.checkCarAvailability && !availabilityLoading) {
      const { available } = availabilityData.checkCarAvailability;
      setAvailabilityError(!available);
    }
  }, [availabilityData, availabilityLoading]);

  // Price Calculation Logic
  const priceDetails = useMemo(() => {
    if (!carData?.car || !startDateTime || !endDateTime || !platformData?.platformSettings) return null;

    const car = carData.car;
    const settings = platformData.platformSettings;
    const profile = userData?.me?.driverProfile;

    // Safely parse dates with validation
    const start = isValidDate(startDateTime) ? new Date(startDateTime) : new Date();
    const end = isValidDate(endDateTime) ? new Date(endDateTime) : new Date();

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60)) || 1;

    // Young Driver / Novice Check
    let isYoung = false;
    let isNovice = false;

    if (profile?.dateOfBirth) {
      const age = Math.floor((new Date().getTime() - new Date(profile.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      if (age < (settings.youngDriverMinAge || 25)) isYoung = true;
    }

    if (profile?.licenseIssueDate) {
      const licenseYears = Math.floor((new Date().getTime() - new Date(profile.licenseIssueDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      if (licenseYears < (settings.noviceLicenseYears || 2)) isNovice = true;
    }

    // Calculate base price based on rental type
    let basePrice = 0;
    let durationLabel = '';

    switch (rentalType) {
      case 'HOUR':
        basePrice = (car.pricePerHour || 0) * diffHours;
        durationLabel = `${diffHours} hours`;
        break;
      case 'DAY':
        basePrice = (car.pricePerDay || 0) * diffDays;
        durationLabel = `${diffDays} days`;
        break;
      case 'KM':
        const estimatedKm = diffDays * 100;
        basePrice = (car.pricePerKm || 0) * estimatedKm;
        durationLabel = `${estimatedKm} km`;
        break;
      default:
        basePrice = (car.pricePerDay || 0) * diffDays;
        durationLabel = `${diffDays} days`;
    }

    const surchargePerDay = (isYoung || isNovice) ? (settings.youngDriverFee || 30) : 0;
    const totalSurcharge = surchargePerDay * diffDays;

    const taxAmount = ((basePrice + totalSurcharge) * (settings.taxPercentage || 20)) / 100;
    const totalPrice = basePrice + totalSurcharge + taxAmount;

    return {
      durationLabel,
      rentalType,
      basePrice,
      totalSurcharge,
      taxAmount,
      totalPrice,
      isYoung,
      isNovice,
      deposit: car.depositAmount
    };
  }, [carData, startDateTime, endDateTime, rentalType, platformData, userData]);

  // Auto-create draft booking when coming from car listing (no bookingId)
  useEffect(() => {
    if (!carId || bookingId || createBookingLoading || confirmBookingLoading) return;

    // Only create draft if we have all required data and valid dates
    if (isValidDate(startDateTime) && isValidDate(endDateTime) && priceDetails && carData?.car) {
      handleCreateDraftBooking();
    }
  }, [carId, bookingId, startDateTime, endDateTime, priceDetails, carData, createBookingLoading, confirmBookingLoading, isValidDate]);

  const handleCreateDraftBooking = async () => {
    if (!priceDetails || !carId) return;

    try {
        const { data: bData } = await createBooking({
          variables: {
            input: {
              carId: carId,
              startDate: isValidDate(startDateTime) ? new Date(startDateTime).toISOString() : new Date().toISOString(),
              endDate: isValidDate(endDateTime) ? new Date(endDateTime).toISOString() : new Date().toISOString(),
              basePrice: priceDetails.basePrice,
              taxAmount: priceDetails.taxAmount,
              surchargeAmount: priceDetails.totalSurcharge,
              totalPrice: priceDetails.totalPrice,
              depositAmount: priceDetails.deposit,
              rentalType: rentalType,
              bookingType: 'RENTAL',
              pickupLocation: '',
              dropoffLocation: ''
            }
          }
        });

      if (bData?.createBooking?.id) {
        // Update URL with bookingId to prevent re-creation
        const newUrl = `/booking?carId=${carId}&bookingId=${bData.createBooking.id}&start=${encodeURIComponent(startDateTime)}&end=${encodeURIComponent(endDateTime)}`;
        window.history.replaceState({}, '', newUrl);
      }
    } catch (error) {
      console.error('Failed to create draft booking');
    }
  };

  // Handle Final Booking
  const handleConfirmBooking = async () => {
    if (!priceDetails) return;

    try {
      let bookingIdToConfirm = bookingId;

      // If we don't have a booking ID, create a draft booking first
      if (!bookingIdToConfirm) {
        const { data: bData } = await createBooking({
          variables: {
            input: {
              carId: carId || bookingData?.booking?.car?.id,
              startDate: isValidDate(startDateTime) ? new Date(startDateTime).toISOString() : new Date().toISOString(),
              endDate: isValidDate(endDateTime) ? new Date(endDateTime).toISOString() : new Date().toISOString(),
              basePrice: priceDetails.basePrice,
              taxAmount: priceDetails.taxAmount,
              surchargeAmount: priceDetails.totalSurcharge,
              totalPrice: priceDetails.totalPrice,
              depositAmount: priceDetails.deposit,
              rentalType: rentalType,
              bookingType: bookingType,
              pickupLocation: '',
              dropoffLocation: ''
            }
          }
        });

        if (bData?.createBooking?.id) {
          bookingIdToConfirm = bData.createBooking.id;
        } else {
          throw new Error('Failed to create draft booking');
        }
      }

      // Confirm the booking (changes DRAFT to AWAITING_VERIFICATION)
      const { data: confirmData } = await confirmBooking({
        variables: { bookingId: bookingIdToConfirm }
      });

      if (confirmData?.confirmBooking?.success) {
        // Store booking data for QR/link display
        const bookingData = confirmData.confirmBooking.booking;

        // If no verification token in response, wait a bit and try again
        if (!bookingData?.verification?.token) {
          console.log('🔄 Token not in response, waiting and refetching...');
          setTimeout(async () => {
            try {
              // Refetch the booking data
              const { data: refetchData } = await refetchBooking();
              const refetchedBooking = refetchData?.booking;

              if (refetchedBooking?.verification?.token) {
                setConfirmedBookingData(refetchedBooking);
              } else {
                setConfirmedBookingData(bookingData);
              }
            } catch (error) {
              setConfirmedBookingData(bookingData);
            }
          }, 1000);
        } else {
          setConfirmedBookingData(bookingData);
        }

        // Start timer at 60:00
        setVerificationTimer('60:00');
        // Show QR code and verification link immediately
        setEmailVerificationPopup(true);
      } else {
        console.error('❌ Confirm booking failed:', confirmData);
        throw new Error('Failed to confirm booking');
      }

    } catch (err: any) {
      alert("Booking Error: " + err.message);
    }
  };

  if (carLoading || bookingLoading || status === 'loading') {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={50} />
          <Typography mt={2} fontWeight={600} color="text.secondary">Fetching Secure Booking Details...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header: Booking Reference & Back to Search */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/cars')}
          sx={{ textTransform: 'none', color: 'text.secondary' }}
        >
          Back to Search
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Booking Reference: #{carId?.slice(-6).toUpperCase() || 'TEMP'}
          </Typography>
          <Chip
            label="DRAFT"
            color="warning"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
      </Box>

      <Typography variant="h4" fontWeight={900} mb={4} sx={{ letterSpacing: -1 }}>
        Finalize Your Reservation
      </Typography>

      <Grid container spacing={4}>
        {/* Left Side: Car Info & Configuration */}
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

          {/* Car Details Section */}
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={800}>Car Details</Typography>
              <Button
                startIcon={<Edit />}
                variant="outlined"
                size="small"
                onClick={() => setChangeCarDialog(true)}
                sx={{ textTransform: 'none' }}
              >
                Change Car
              </Button>
            </Box>
            <Typography variant="body1" color="text.secondary">
              {carData?.car?.brand.name} {carData?.car?.model.name} - {carData?.car?.plateNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {carData?.car?.transmission} • {carData?.car?.fuelType} • {carData?.car?.seats} seats
            </Typography>
          </Paper>

          {/* Document Verification Notice */}
          <Alert severity="info" sx={{ borderRadius: 3, mb: 3 }}>
            <Typography variant="body2">
              <strong>Document Verification Required:</strong> Your ID and driving license will be verified after booking confirmation.
            </Typography>
          </Alert>

          {/* Rental Configuration Section */}
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', mb: 3 }}>
            <Typography variant="h6" fontWeight={800} mb={3} display="flex" alignItems="center">
              <Schedule sx={{ mr: 1, color: '#2563EB' }} /> Rental Configuration
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Pickup Date & Time" type="datetime-local" value={startDateTime} onChange={(e) => setStartDateTime(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Return Date & Time" type="datetime-local" value={endDateTime} onChange={(e) => setEndDateTime(e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                {availableRentalTypes.length === 1 ? (
                  // Single rental type - display as static text
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
                      Rental Type
                    </Typography>
                    <Typography variant="body1" sx={{ py: 1.5, px: 2, border: '1px solid #E2E8F0', borderRadius: 1, bgcolor: '#F8FAFC' }}>
                      {availableRentalTypes[0].label}
                    </Typography>
                  </Box>
                ) : (
                  // Multiple rental types - show dropdown
                  <FormControl fullWidth>
                    <InputLabel>Rental Type</InputLabel>
                    <Select
                      value={rentalType}
                      label="Rental Type"
                      onChange={(e) => setRentalType(e.target.value as 'HOUR' | 'DAY' | 'KM')}
                    >
                      {availableRentalTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
            </Grid>

            {availabilityError && (
              <Alert severity="error" sx={{ mt: 3, borderRadius: 3, border: '1px solid #fca5a5' }}>
                <Typography variant="subtitle2" fontWeight={800}>Car Not Available</Typography>
                <Typography variant="body2">
                  This car is not available for the selected dates. Please choose different dates or select another car.
                  {availabilityData?.checkCarAvailability?.conflictingBookings?.length > 0 && (
                    <Box component="span" sx={{ display: 'block', mt: 1 }}>
                      {(() => {
                        try {
                          const conflictingBooking = availabilityData.checkCarAvailability.conflictingBookings[0];
                          const startDate = new Date(conflictingBooking.startDate);
                          const endDate = new Date(conflictingBooking.endDate);

                          // Check if dates are valid
                          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                            return "Conflicting booking found (dates unavailable)";
                          }

                          return `Conflicting booking: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
                        } catch (error) {
                          return "Conflicting booking found";
                        }
                      })()}
                    </Box>
                  )}
                </Typography>
              </Alert>
            )}

            {priceDetails?.isYoung && (
              <Alert severity="warning" sx={{ mt: 3, borderRadius: 3, border: '1px solid #fed7aa' }}>
                <Typography variant="subtitle2" fontWeight={800}>Young Driver Surcharge Applied</Typography>
                <Typography variant="body2">Based on your profile, a France-mandated novice driver fee is included in the total.</Typography>
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Right Side: Pricing */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '2px solid #0F172A', position: 'sticky', top: 100 }}>
            <Typography variant="h6" fontWeight={900} mb={3}>Price Breakdown</Typography>

            <Stack spacing={2.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary" fontWeight={500}>
                  Rental Fee ({priceDetails?.durationLabel} - {priceDetails?.rentalType})
                </Typography>
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

              <Box sx={{ mt: 2, p: 2, bgcolor: '#F0F9FF', borderRadius: 2, border: '1px solid #0EA5E9' }}>
                <Typography variant="body2" color="primary.dark" fontWeight={600}>
                  💰 Refundable Amount: €{priceDetails?.deposit?.toFixed(2)} - You will pay when you pick up the vehicle
                </Typography>
              </Box>
            </Stack>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleConfirmBooking}
              disabled={createBookingLoading || confirmBookingLoading || availabilityError}
              sx={{ mt: 4, py: 2, borderRadius: 3, fontWeight: 900, fontSize: 16, textTransform: 'none' }}
            >
              {(createBookingLoading || confirmBookingLoading) ? <CircularProgress size={24} color="inherit" /> : 'Confirm Reservation'}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Change Car Dialog */}
      <Dialog
        open={changeCarDialog}
        onClose={() => setChangeCarDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 900, fontSize: '1.25rem' }}>
          Change Your Car
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select an available car for your dates: {isValidDate(startDateTime) && new Date(startDateTime).toLocaleDateString()} - {isValidDate(endDateTime) && new Date(endDateTime).toLocaleDateString()}
          </Typography>
          {availableCarsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : availableCarsData?.availableCars?.length > 0 ? (
            <Grid container spacing={2}>
              {availableCarsData.availableCars.slice(0, 6).map((car: any) => (
                <Grid item xs={12} sm={6} key={car.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: '1px solid #E2E8F0',
                      '&:hover': { borderColor: '#2563EB', boxShadow: 2 }
                    }}
                    onClick={() => {
                      const newUrl = `/booking?carId=${car.id}&start=${startDateTime}&end=${endDateTime}`;
                      router.push(newUrl);
                      setChangeCarDialog(false);
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={car.images?.find((img: any) => img.isPrimary)?.imagePath || car.images?.[0]?.imagePath}
                      alt={`${car.brand.name} ${car.model.name}`}
                    />
                    <CardContent sx={{ pb: 2 }}>
                      <Typography variant="h6" fontWeight={800}>
                        {car.brand.name} {car.model.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {car.plateNumber}
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight={900}>
                        €{car.pricePerDay}/day
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No other cars available for these dates
              </Typography>
              <Button
                variant="outlined"
                onClick={() => router.push('/cars')}
                sx={{ mt: 2 }}
              >
                Browse All Cars
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setChangeCarDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Verification QR Code & Link Popup */}
      <Dialog open={emailVerificationPopup} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogContent sx={{ textAlign: 'center', p: 4 }}>
          <Box sx={{ width: 80, height: 80, bgcolor: '#DBEAFE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
            <CheckCircle color="primary" sx={{ fontSize: 50 }} />
          </Box>
          <Typography variant="h5" fontWeight={1000} gutterBottom sx={{ mb: 2, color: '#1E40AF' }}>
            Booking Confirmed! Complete Verification Now
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Your booking has been confirmed but needs verification. Scan the QR code below or use the magic link to complete your booking.
            <br /><strong>This link expires in 1 hour - other users can book this car if you don't verify quickly!</strong>
          </Typography>

          {/* Timer Display */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={800} color="primary" gutterBottom>
              ⏰ Verification Time Remaining
            </Typography>
            <Box sx={{
              display: 'inline-block',
              px: 3,
              py: 2,
              bgcolor: verificationTimer === 'EXPIRED' ? '#FEE2E2' : '#F0F9FF',
              border: `2px solid ${verificationTimer === 'EXPIRED' ? '#EF4444' : '#0EA5E9'}`,
              borderRadius: 3,
              minWidth: 120
            }}>
              <Typography
                variant="h4"
                fontWeight={900}
                color={verificationTimer === 'EXPIRED' ? 'error.main' : 'primary.main'}
                fontFamily="monospace"
              >
                {verificationTimer}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {verificationTimer === 'EXPIRED'
                ? 'Link has expired - booking cancelled'
                : 'Complete verification before timer expires'
              }
            </Typography>
          </Box>

          {/* QR Code and Link Section */}
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={4} alignItems="center" justifyContent="center">
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight={700} color="#1E40AF" mb={2}>
                    Scan QR Code
                  </Typography>
                  <Box sx={{
                    p: 3,
                    bgcolor: 'white',
                    borderRadius: 4,
                    border: '3px solid #E2E8F0',
                    display: 'inline-block',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    {confirmedBookingData?.verification?.token ? (
                      <QRCode
                        value={`${window.location.origin}/verification/${confirmedBookingData.verification.token}`}
                        size={200}
                        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                      />
                    ) : (
                      <Box sx={{
                        width: 200,
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#f5f5f5',
                        borderRadius: 2,
                        border: '2px dashed #ccc'
                      }}>
                        <Typography color="text.secondary">Loading QR Code...</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight={700} color="#1E40AF" mb={2}>
                    Or Use Magic Link
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={confirmedBookingData?.verification?.token
                      ? `${window.location.origin}/verification/${confirmedBookingData.verification.token}`
                      : 'Generating verification link...'
                    }
                    InputProps={{
                      readOnly: true,
                      endAdornment: confirmedBookingData?.verification?.token ? (
                        <IconButton
                          size="small"
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/verification/${confirmedBookingData.verification.token}`)}
                          sx={{ color: 'primary.main' }}
                        >
                          <Edit/>
                        </IconButton>
                      ) : null
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        borderRadius: 2,
                        mb: 2
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={!confirmedBookingData?.verification?.token}
                    onClick={() => {
                      window.open(`${window.location.origin}/verification/${confirmedBookingData.verification.token}`, '_blank', 'noopener,noreferrer');
                    }}
                    sx={{
                      borderRadius: 3,
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      py: 1.5,
                      bgcolor: '#1E40AF',
                      '&:hover': {
                        bgcolor: '#1D4ED8'
                      },
                      '&:disabled': {
                        bgcolor: '#9CA3AF'
                      }
                    }}
                  >
                    {confirmedBookingData?.verification?.token ? 'Open Verification Page' : 'Generating Link...'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>⚡ Time Sensitive:</strong> Complete verification within 1 hour or this booking may be lost to another customer!
            </Typography>
          </Alert>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setEmailVerificationPopup(false);
              setConfirmedBookingData(null); // Clear the data
              setVerificationTimer('60:00'); // Reset timer
              // Force refresh booking records when navigating
              router.push('/bookingRecords?refresh=' + Date.now());

              // Also invalidate the bookings cache
              client.cache.evict({ fieldName: 'myBookings' });
              client.cache.gc();
            }}
            sx={{ borderRadius: 3, py: 1.5, fontWeight: 700, borderColor: '#1E40AF', color: '#1E40AF' }}
          >
            Go to Booking Records
          </Button>
        </DialogContent>
      </Dialog>

      {/* Success Dialog (legacy) */}
      <Dialog open={verificationDialog} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 6, p: 2 } }}>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Box sx={{ width: 80, height: 80, bgcolor: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
            <CheckCircle color="success" sx={{ fontSize: 50 }} />
          </Box>
          <Typography variant="h5" fontWeight={1000} gutterBottom>Booking Reserved!</Typography>
          <Typography color="text.secondary" mb={4}>
            A magic verification link has been sent to your email.
          </Typography>
          <Button fullWidth variant="contained" onClick={() => router.push('/bookings')} sx={{ borderRadius: 3, py: 1.5, fontWeight: 900 }}>
            Go to My Bookings
          </Button>
        </DialogContent>
      </Dialog>

    </Container>
  );
}
