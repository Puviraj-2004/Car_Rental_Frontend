'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Box, Container, Grid, Typography, Card, CardContent, Button, Chip, Stack, 
  Divider, Paper, Skeleton, Checkbox, FormControlLabel, FormGroup, Drawer, 
  IconButton, Snackbar, Alert, Dialog, DialogContent, Slide
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { useQuery } from '@apollo/client';
import { GET_CARS_QUERY, GET_CAR_ENUMS, GET_BRANDS_QUERY } from '@/lib/graphql/queries';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Icons
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
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
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  
  const today = new Date().toISOString().split('T')[0];

  // 1. Main Filter State
  const [mainFilter, setMainFilter] = useState({ 
    startDate: '', startTime: '10:00', endDate: '', endTime: '10:00' 
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
  const carFilter = {
    fuelType: secondaryFilter.fuelTypes.length > 0 ? secondaryFilter.fuelTypes[0] : undefined,
    transmission: secondaryFilter.transmissions.length > 0 ? secondaryFilter.transmissions[0] : undefined,
    brandId: secondaryFilter.brands.length > 0 ? secondaryFilter.brands[0] : undefined,
    // Status filtering handled by backend based on date availability
    startDate: mainFilter.startDate && mainFilter.endDate ? `${mainFilter.startDate}T${mainFilter.startTime}` : undefined,
    endDate: mainFilter.startDate && mainFilter.endDate ? `${mainFilter.endDate}T${mainFilter.endTime}` : undefined,
  };

  const { data, loading } = useQuery(GET_CARS_QUERY, {
    variables: { filter: carFilter },
    fetchPolicy: 'cache-and-network'
  });

  const handlePickupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPickupDate = e.target.value;
    const pickupDateTime = new Date(`${newPickupDate}T${mainFilter.startTime}`);

    // 24-Hour Buffer Rule: New Pickup >= (Existing Return + 24h)
    // This prevents booking conflicts by ensuring 24-hour gap between bookings
    // Note: Frontend validation is a placeholder - backend should enforce this rule
    // by checking existing bookings and rejecting overlapping reservations

    setMainFilter({ ...mainFilter, startDate: newPickupDate, endDate: '' });
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

  const handleBookNow = (carId: string) => {
    if (!mainFilter.startDate || !mainFilter.endDate) {
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

      // User is authenticated, proceed to booking
      const queryParams = new URLSearchParams({
        carId,
        start: `${mainFilter.startDate}T${mainFilter.startTime}`,
        end: `${mainFilter.endDate}T${mainFilter.endTime}`
      }).toString();
      router.push(`/booking?${queryParams}`);
    }
  };

  const FilterPanel = () => (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography fontWeight={900} variant="h6">FILTERS</Typography>
        <IconButton sx={{ display: { md: 'none' } }} onClick={() => setMobileFilterOpen(false)}><CloseIcon /></IconButton>
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
                    <input type="date" value={mainFilter.startDate} min={today} style={{ width: '100%', border: 'none', outline: 'none', padding: '4px 8px', fontSize: '14px' }} onChange={handlePickupChange} />
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" fontWeight={800} color="primary">TIME</Typography>
                    <input type="time" value={mainFilter.startTime} style={{ width: '100%', border: 'none', outline: 'none', padding: '4px 0', fontSize: '14px' }} onChange={(e) => setMainFilter({...mainFilter, startTime: e.target.value})} />
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={1} sx={{ bgcolor: !mainFilter.startDate ? '#F1F5F9' : 'white', p: 1, borderRadius: 2, border: '1px solid #CBD5E1', opacity: !mainFilter.startDate ? 0.6 : 1 }}>
                  <Box sx={{ flex: 1.5 }}>
                    <Typography variant="caption" fontWeight={800} color="primary" ml={1}>RETURN DATE</Typography>
                    <input
                      type="date"
                      value={mainFilter.endDate}
                      min={mainFilter.startDate || today}
                      disabled={!mainFilter.startDate}
                      style={{ width: '100%', border: 'none', outline: 'none', padding: '4px 8px', fontSize: '14px' }}
                      onChange={(e) => {
                        const newReturnDate = e.target.value;
                        const returnDateTime = new Date(`${newReturnDate}T${mainFilter.endTime}`);
                        const pickupDateTime = new Date(`${mainFilter.startDate}T${mainFilter.startTime}`);

                        // 24-Hour Buffer Rule: New Return must allow 24h gap before next pickup
                        // This prevents back-to-back bookings without maintenance/cleaning time
                        // Note: Frontend validation is a placeholder - backend should enforce this rule
                        // by validating against existing bookings and rejecting conflicts

                        setMainFilter({...mainFilter, endDate: newReturnDate});
                      }}
                    />
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" fontWeight={800} color="primary">TIME</Typography>
                    <input type="time" value={mainFilter.endTime} disabled={!mainFilter.startDate} style={{ width: '100%', border: 'none', outline: 'none', padding: '4px 0', fontSize: '14px' }} onChange={(e) => setMainFilter({...mainFilter, endTime: e.target.value})} />
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 16 }}>
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

      <Drawer anchor="bottom" open={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} PaperProps={{ sx: { borderRadius: '20px 20px 0 0', p: 3 } }}><FilterPanel /></Drawer>
      <Snackbar open={alertOpen} autoHideDuration={4000} onClose={() => setAlertOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="warning" variant="filled">⚠️ Please enter Pickup and Return date/time before booking!</Alert>
      </Snackbar>
    </Box>
  );
}