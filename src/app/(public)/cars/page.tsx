'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, Card, CardContent, Button, Chip, Stack,
  Divider, Paper, Skeleton, Checkbox, FormControlLabel, FormGroup, Drawer,
  IconButton, Snackbar, Alert, Dialog, DialogContent, Slide, TextField, MenuItem
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CARS_QUERY, GET_CAR_ENUMS, GET_BRANDS_QUERY } from '@/lib/graphql/queries';
import { CREATE_BOOKING_MUTATION } from '@/lib/graphql/mutations';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { addHours, addDays, isBefore, isAfter, format, parseISO, startOfHour, startOfDay } from 'date-fns';
import dayjs from 'dayjs';

// Icons
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import SpeedIcon from '@mui/icons-material/Speed';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// Dialog Transition
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CarsListingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [createBooking] = useMutation(CREATE_BOOKING_MUTATION);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'warning' | 'error' | 'info'>('warning');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any>(null);

  // Initialize with proper defaults using date-fns
  const now = new Date();
  const defaultPickupTime = addHours(startOfHour(addHours(now, 1)), Math.ceil(now.getMinutes() / 30) * 0.5);
  const defaultReturnTime = addHours(defaultPickupTime, 2);

  // 1. Main Filter State with proper defaults
  const [mainFilter, setMainFilter] = useState({
    startDate: format(now, 'yyyy-MM-dd'),
    startTime: format(defaultPickupTime, 'HH:mm'),
    endDate: format(now, 'yyyy-MM-dd'),
    endTime: format(defaultReturnTime, 'HH:mm')
  });

  // 2. Secondary Filter State
  const [secondaryFilter, setSecondaryFilter] = useState({
    fuelTypes: [] as string[],
    transmissions: [] as string[],
    brands: [] as string[],
    critAir: [] as string[],
  });

  // 📡 Queries
  // Note: Backend handles conditional status filtering based on date selection
  // - No dates: Shows all cars except OUT_OF_SERVICE
  // - With dates: Shows only AVAILABLE cars with no conflicts & 24h buffer
  const { data: enumData } = useQuery(GET_CAR_ENUMS);
  const { data: brandData } = useQuery(GET_BRANDS_QUERY);

  // Create reactive filter object that updates when dates change
  const carFilter = useMemo(() => {
    const filter: any = {
      fuelType: secondaryFilter.fuelTypes.length > 0 ? secondaryFilter.fuelTypes[0] : undefined,
      transmission: secondaryFilter.transmissions.length > 0 ? secondaryFilter.transmissions[0] : undefined,
      brandId: secondaryFilter.brands.length > 0 ? secondaryFilter.brands[0] : undefined,
    };

    // Convert dates to ISO UTC format for backend
    if (mainFilter.startDate && mainFilter.endDate && mainFilter.startTime && mainFilter.endTime) {
      const startDateTime = new Date(`${mainFilter.startDate}T${mainFilter.startTime}`);
      const endDateTime = new Date(`${mainFilter.endDate}T${mainFilter.endTime}`);

      filter.startDate = startDateTime.toISOString();
      filter.endDate = endDateTime.toISOString();
    }

    return filter;
  }, [mainFilter, secondaryFilter]);

  const { data, loading } = useQuery(GET_CARS_QUERY, {
    variables: { filter: carFilter },
    fetchPolicy: 'cache-and-network'
  });

  // Enhanced time validation functions using date-fns
  const validatePickupTime = (date: string, time: string) => {
    const pickupDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const minPickupTime = addHours(now, 1);

    if (isBefore(pickupDateTime, minPickupTime)) {
      setAlertMessage('Pick-up time must be at least 1 hour from now');
      setAlertSeverity('error');
      setAlertOpen(true);
      return false;
    }
    return true;
  };

  const validateReturnTime = (pickupDate: string, pickupTime: string, returnDate: string, returnTime: string) => {
    const pickupDateTime = new Date(`${pickupDate}T${pickupTime}`);
    const returnDateTime = new Date(`${returnDate}T${returnTime}`);
    const minReturnTime = addHours(pickupDateTime, 2);

    if (isBefore(returnDateTime, minReturnTime)) {
      setAlertMessage('Return time must be at least 2 hours after pick-up time');
      setAlertSeverity('error');
      setAlertOpen(true);
      return false;
    }
    return true;
  };

  // Generate time options in 30-minute intervals
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const handlePickupDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPickupDate = e.target.value;
    const pickupDate = new Date(newPickupDate);
    const yesterday = addDays(new Date(), -1);

    // Allow yesterday and future dates
    if (isBefore(startOfDay(pickupDate), startOfDay(yesterday))) {
      setAlertMessage('Pick-up date cannot be more than 1 day in the past');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }

    // Calculate new return date (same day or next day if pickup is today)
    let newReturnDate = newPickupDate;
    const pickupDateTime = new Date(`${newPickupDate}T${mainFilter.startTime}`);
    const returnDateTime = new Date(`${mainFilter.endDate}T${mainFilter.endTime}`);

    // If return date/time is before new pickup date/time, adjust return date
    if (isBefore(returnDateTime, addHours(pickupDateTime, 2))) {
      const today = new Date();
      if (pickupDate.toDateString() === today.toDateString()) {
        // If pickup is today, keep return on same day but adjust time
        newReturnDate = newPickupDate;
      } else {
        // If pickup is future date, set return to same day
        newReturnDate = newPickupDate;
      }
    }

    setMainFilter(prev => ({
      ...prev,
      startDate: newPickupDate,
      endDate: newReturnDate
    }));
  };

  const handlePickupTimeChange = (time: string) => {
    if (!validatePickupTime(mainFilter.startDate, time)) {
      return; // Don't update if validation fails
    }

    // Auto-adjust return time to be at least 2 hours after pickup
    const pickupDateTime = new Date(`${mainFilter.startDate}T${time}`);
    let newReturnTime = mainFilter.endTime;
    let newReturnDate = mainFilter.endDate;

    const currentReturnDateTime = new Date(`${mainFilter.endDate}T${mainFilter.endTime}`);
    const minReturnDateTime = addHours(pickupDateTime, 2);

    if (isBefore(currentReturnDateTime, minReturnDateTime)) {
      newReturnTime = format(minReturnDateTime, 'HH:mm');
      newReturnDate = format(minReturnDateTime, 'yyyy-MM-dd');
    }

    setMainFilter(prev => ({
      ...prev,
      startTime: time,
      endTime: newReturnTime,
      endDate: newReturnDate
    }));
  };

  const handleReturnDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newReturnDate = e.target.value;
    const pickupDate = new Date(mainFilter.startDate);
    const returnDate = new Date(newReturnDate);

    // Return date must be same as or after pickup date
    if (isBefore(startOfDay(returnDate), startOfDay(pickupDate))) {
      setAlertMessage('Return date cannot be before pick-up date');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }

    setMainFilter(prev => ({
      ...prev,
      endDate: newReturnDate
    }));
  };

  const handleReturnTimeChange = (time: string) => {
    if (!validateReturnTime(mainFilter.startDate, mainFilter.startTime, mainFilter.endDate, time)) {
      return; // Don't update if validation fails
    }

    setMainFilter(prev => ({
      ...prev,
      endTime: time
    }));
  };

  const handleCheckboxChange = (category: string, value: string) => {
    setSecondaryFilter((prev: any) => {
      const current = prev[category];
      const updated = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  // 🛠️ View Details Logic
  const handleOpenDetails = (car: any) => {
    setSelectedCar(car);
    setDetailsOpen(true);
  };

  const handleBookNow = async (carId: string) => {
    if (!mainFilter.startDate || !mainFilter.endDate) {
      setAlertMessage('⚠️ Please enter Pickup and Return date/time before booking!');
      setAlertSeverity('warning');
      setAlertOpen(true);
      setDetailsOpen(false);
    } else {
      // Check if user is authenticated
      if (status !== 'authenticated') {
        // Redirect to login with booking URL as callback
        const bookingUrl = `/booking?carId=${carId}&start=${mainFilter.startDate}T${mainFilter.startTime}&end=${mainFilter.endDate}T${mainFilter.endTime}`;
        router.push(`/login?redirect=${encodeURIComponent(bookingUrl)}`);
        return;
      }

      // User is authenticated, create draft booking immediately
      try {
        // Find the car data for pricing
        const selectedCar = data?.cars.find((car: any) => car.id === carId);
        if (!selectedCar) {
          alert('Car not found');
          return;
        }

        // Calculate basic pricing (same logic as booking page)
        const startDateTime = new Date(`${mainFilter.startDate}T${mainFilter.startTime}`);
        const endDateTime = new Date(`${mainFilter.endDate}T${mainFilter.endTime}`);
        const diffHours = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60));
        const diffDays = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24));

        let basePrice = 0;
        let durationLabel = '';

        if (selectedCar.pricePerHour && selectedCar.pricePerDay) {
          // Calculate based on duration
          const diffHours = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60));

          if (diffHours <= 24) {
            basePrice = (selectedCar.pricePerHour || 0) * diffHours;
            durationLabel = `${diffHours} hours`;
          } else {
            basePrice = (selectedCar.pricePerDay || 0) * diffDays;
            durationLabel = `${diffDays} days`;
          }
        } else {
          basePrice = (selectedCar.pricePerDay || 0) * diffDays;
          durationLabel = `${diffDays} days`;
        }

        // Create draft booking
        const { data: bookingResult } = await createBooking({
          variables: {
            input: {
              carId: carId,
              startDate: startDateTime.toISOString(),
              endDate: endDateTime.toISOString(),
              basePrice: basePrice,
              taxAmount: basePrice * 0.20, // 20% tax
              surchargeAmount: 0, // No surcharge for basic booking
              totalPrice: basePrice * 1.20,
              depositAmount: selectedCar.depositAmount || 0,
              rentalType: diffDays >= 1 ? 'DAY' : 'HOUR',
              bookingType: 'RENTAL',
              pickupLocation: '',
              dropoffLocation: ''
            }
          }
        });

        if (bookingResult?.createBooking?.id) {
          // Redirect to booking page with the created draft booking
          router.push(`/booking?bookingId=${bookingResult.createBooking.id}`);
        } else {
          alert('Failed to create booking. Please try again.');
        }

      } catch (error: any) {
        console.error('Error creating booking:', error);
        alert('Error creating booking: ' + error.message);
      }
    }
  };

  const FilterPanel = () => (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography fontWeight={900} variant="h6">FILTERS</Typography>
        <Stack direction="row" spacing={1}>
          {(secondaryFilter.fuelTypes.length > 0 ||
            secondaryFilter.transmissions.length > 0 ||
            secondaryFilter.brands.length > 0 ||
            secondaryFilter.critAir.length > 0) && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => setSecondaryFilter({
                fuelTypes: [],
                transmissions: [],
                brands: [],
                critAir: []
              })}
              sx={{ fontSize: '12px', textTransform: 'none' }}
            >
              Clear All
            </Button>
          )}
          <IconButton sx={{ display: { md: 'none' } }} onClick={() => setMobileFilterOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Stack>
      {[
        { label: 'BRANDS', key: 'brands', data: brandData?.brands },
        { label: 'TRANSMISSION', key: 'transmissions', data: enumData?.transmissionEnum?.enumValues },
        { label: 'FUEL TYPE', key: 'fuelTypes', data: enumData?.fuelTypeEnum?.enumValues },
        { label: 'CRITAIR', key: 'critAir', data: enumData?.critAirEnum?.enumValues },
      ].map((section) => (
        <Box key={section.key} sx={{ mb: 2.5 }}>
          <Typography fontSize={11} fontWeight={800} color="primary" mb={1} sx={{ letterSpacing: 1 }}>{section.label}</Typography>
          <FormGroup>
            {section.data?.map((item: any) => (
              <FormControlLabel 
                key={item.id || item.name} 
                control={<Checkbox size="small" checked={secondaryFilter[section.key as keyof typeof secondaryFilter].includes(item.id || item.name)} onChange={() => handleCheckboxChange(section.key, item.id || item.name)} />} 
                label={<Typography fontSize={13} fontWeight={500}>{item.name.replace('_', ' ')}</Typography>} 
              />
            ))}
          </FormGroup>
          <Divider sx={{ mt: 2 }} />
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 4 }}>
      
      {/* 🔝 TOP BAR */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E2E8F0', py: 1, position: 'fixed', top: 84, left: 0, right: 0, zIndex: 110 }}>
        <Container maxWidth="xl">
          <Paper elevation={0} sx={{ p: 1, borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={1} sx={{ bgcolor: 'white', p: 1, borderRadius: 2, border: '1px solid #CBD5E1' }}>
                  <Box sx={{ flex: 1.5 }}>
                    <Typography variant="caption" fontWeight={800} color="primary" ml={1}>PICKUP DATE</Typography>
                    <TextField
                      type="date"
                      value={mainFilter.startDate}
                      onChange={handlePickupDateChange}
                      size="small"
                      fullWidth
                      inputProps={{
                        min: dayjs().subtract(1, 'day').format('YYYY-MM-DD') // Allow yesterday
                      }}
                      sx={{
                        '& .MuiInputBase-root': { border: 'none', '&:before': { border: 'none' }, '&:after': { border: 'none' } },
                        '& .MuiInputBase-input': { padding: '4px 8px', fontSize: '14px' }
                      }}
                    />
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" fontWeight={800} color="primary">TIME</Typography>
                    <TextField
                      select
                      value={mainFilter.startTime}
                      onChange={(e) => handlePickupTimeChange(e.target.value)}
                      size="small"
                      fullWidth
                      sx={{
                        '& .MuiInputBase-root': { border: 'none', '&:before': { border: 'none' }, '&:after': { border: 'none' } },
                        '& .MuiInputBase-input': { padding: '4px 0', fontSize: '14px' }
                      }}
                    >
                      {timeOptions.map((time) => (
                        <MenuItem key={time} value={time}>
                          {time}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={1} sx={{ bgcolor: !mainFilter.startDate ? '#F1F5F9' : 'white', p: 1, borderRadius: 2, border: '1px solid #CBD5E1', opacity: !mainFilter.startDate ? 0.6 : 1 }}>
                  <Box sx={{ flex: 1.5 }}>
                    <Typography variant="caption" fontWeight={800} color="primary" ml={1}>RETURN DATE</Typography>
                    <TextField
                      type="date"
                      value={mainFilter.endDate}
                      onChange={handleReturnDateChange}
                      disabled={!mainFilter.startDate}
                      size="small"
                      fullWidth
                      inputProps={{
                        min: mainFilter.startDate // Cannot be before pickup date
                      }}
                      sx={{
                        '& .MuiInputBase-root': { border: 'none', '&:before': { border: 'none' }, '&:after': { border: 'none' } },
                        '& .MuiInputBase-input': { padding: '4px 8px', fontSize: '14px' }
                      }}
                    />
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" fontWeight={800} color="primary">TIME</Typography>
                    <TextField
                      select
                      value={mainFilter.endTime}
                      onChange={(e) => handleReturnTimeChange(e.target.value)}
                      disabled={!mainFilter.startDate}
                      size="small"
                      fullWidth
                      sx={{
                        '& .MuiInputBase-root': { border: 'none', '&:before': { border: 'none' }, '&:after': { border: 'none' } },
                        '& .MuiInputBase-input': { padding: '4px 0', fontSize: '14px' }
                      }}
                    >
                      {timeOptions.map((time) => (
                        <MenuItem key={time} value={time}>
                          {time}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Mobile Filter Button */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 2, textAlign: 'center' }}>
            <Button
              variant="contained"
              startIcon={<FilterListIcon />}
              onClick={() => setMobileFilterOpen(true)}
              sx={{
                borderRadius: 3,
                fontWeight: 800,
                textTransform: 'none',
                px: 3,
                py: 1.5,
                boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
                position: 'relative'
              }}
            >
              Filters
              {(secondaryFilter.fuelTypes.length > 0 ||
                secondaryFilter.transmissions.length > 0 ||
                secondaryFilter.brands.length > 0 ||
                secondaryFilter.critAir.length > 0) && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    bgcolor: 'error.main',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="caption" fontWeight="bold" color="white">
                    {(secondaryFilter.fuelTypes.length +
                      secondaryFilter.transmissions.length +
                      secondaryFilter.brands.length +
                      secondaryFilter.critAir.length)}
                  </Typography>
                </Box>
              )}
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: { xs: 20, md: 16 } }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ position: 'sticky', top: 240 }}><FilterPanel /></Box>
          </Grid>

          <Grid item xs={12} md={9}>
            <Grid container spacing={1.5}>
              {loading ? [1, 2, 3, 4].map(i => <Grid item xs={12} sm={6} key={i}><Skeleton variant="rectangular" height={250} sx={{ borderRadius: 4 }} /></Grid>) :
                data?.cars.map((car: any) => (
                  <Grid item xs={12} sm={6} key={car.id}>
                    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', '&:hover': { transform: 'translateY(-2px)', transition: '0.3s', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' } }}>
                      {/* Primary Image */}
                      {car.images?.length > 0 && (
                        <Box sx={{ position: 'relative', height: 140, overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                          <img
                            src={(car.images.find((img: any) => img.isPrimary)?.imagePath || car.images[0].imagePath)}
                            alt={`${car.brand.name} ${car.model.name}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </Box>
                      )}
                      <CardContent sx={{ p: 1.5 }}>
                        <Box sx={{ mb: 1.5 }}>
                          <Typography fontSize={10} fontWeight={800} color="primary">{car.brand.name.toUpperCase()}</Typography>
                          <Typography variant="h6" fontWeight={900}>{car.model.name}</Typography>
                        </Box>
                        <Stack direction="row" spacing={1} mb={1.5}>
                          <Chip icon={<SettingsIcon sx={{ fontSize: 12 }} />} label={car.transmission} size="small" variant="outlined" />
                          <Chip icon={<LocalGasStationIcon sx={{ fontSize: 12 }} />} label={car.fuelType} size="small" variant="outlined" />
                        </Stack>
                        <Divider sx={{ mb: 1.5, borderStyle: 'dashed' }} />
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography fontWeight={900} fontSize={22}>€{car.pricePerDay}<Typography component="span" fontSize={12}>/day</Typography></Typography>
                          <Stack direction="row" spacing={1}>
                            <Button size="small" variant="outlined" onClick={() => handleOpenDetails(car)} sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none' }}>Details</Button>
                            <Button size="small" variant="contained" onClick={() => handleBookNow(car.id)} sx={{ fontWeight: 800, borderRadius: 2, bgcolor: mainFilter.endDate ? '#2563EB' : '#94A3B8' }}>Book Now</Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              }
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* 🚀 VIEW DETAILS POP-UP */}
      <Dialog fullWidth maxWidth="md" open={detailsOpen} TransitionComponent={Transition} onClose={() => setDetailsOpen(false)} PaperProps={{ sx: { borderRadius: 4, p: 2 } }}>
        <IconButton onClick={() => setDetailsOpen(false)} sx={{ position: 'absolute', right: 16, top: 16, zIndex: 1, bgcolor: '#F1F5F9' }}><CloseIcon /></IconButton>
        {selectedCar && (
          <DialogContent>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ borderRadius: 3, overflow: 'hidden', height: { xs: 200, md: 350 }, bgcolor: '#F1F5F9' }}>
                  <img src={selectedCar.images?.[0]?.imagePath || ''} alt="car" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="overline" color="primary" fontWeight={900}>{selectedCar.brand.name}</Typography>
                <Typography variant="h4" fontWeight={900} mb={2}>{selectedCar.model.name}</Typography>
                <Stack direction="row" spacing={1} mb={3}>
                  <Chip label={selectedCar.transmission} icon={<SettingsIcon />} />
                  <Chip label={selectedCar.fuelType} icon={<LocalGasStationIcon />} />
                  <Chip label={`${selectedCar.seats} Seats`} icon={<EventSeatIcon />} />
                </Stack>
                
                <Typography variant="h6" fontWeight={800} mb={1}>Pricing Options</Typography>
                <Stack spacing={1} mb={3}>
                  {selectedCar.pricePerHour > 0 && <Paper variant="outlined" sx={{ p: 1, px: 2, display: 'flex', justifyContent: 'space-between', borderRadius: 2 }}><Typography fontSize={13} fontWeight={700}>Per Hour</Typography><Typography fontWeight={900} color="primary">€{selectedCar.pricePerHour}</Typography></Paper>}
                  {selectedCar.pricePerDay > 0 && <Paper variant="outlined" sx={{ p: 1, px: 2, display: 'flex', justifyContent: 'space-between', borderRadius: 2 }}><Typography fontSize={13} fontWeight={700}>Per Day</Typography><Typography fontWeight={900} color="primary">€{selectedCar.pricePerDay}</Typography></Paper>}
                  {selectedCar.pricePerKm > 0 && <Paper variant="outlined" sx={{ p: 1, px: 2, display: 'flex', justifyContent: 'space-between', borderRadius: 2 }}><Typography fontSize={13} fontWeight={700}>Per KM</Typography><Typography fontWeight={900} color="primary">€{selectedCar.pricePerKm}</Typography></Paper>}
                </Stack>

                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>Deposit: <b>€{selectedCar.depositAmount}</b></Alert>
                <Button fullWidth variant="contained" size="large" onClick={() => handleBookNow(selectedCar.id)} sx={{ borderRadius: 3, fontWeight: 900, py: 1.5 }}>Book Now</Button>
              </Grid>
            </Grid>
          </DialogContent>
        )}
      </Dialog>

      <Drawer
        anchor="left"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '85vw', sm: '70vw', md: '400px' },
            p: 3,
            borderRadius: '0 20px 20px 0'
          }
        }}
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
      >
        <FilterPanel />
      </Drawer>
      <Snackbar open={alertOpen} autoHideDuration={5000} onClose={() => setAlertOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={alertSeverity} variant="filled">{alertMessage}</Alert>
      </Snackbar>
    </Box>
  );
}