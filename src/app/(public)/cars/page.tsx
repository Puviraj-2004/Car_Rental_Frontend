'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Box, Container, Grid, Typography, Card, Button, Chip, Stack,
  Divider, Checkbox, FormControlLabel, FormGroup, Drawer,
  IconButton, Snackbar, Alert, Dialog, DialogContent, Slide, TextField,
  InputAdornment, Paper, useTheme, useMediaQuery, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CARS_QUERY, GET_CAR_ENUMS, GET_BRANDS_QUERY } from '@/lib/graphql/queries';
import { CREATE_BOOKING_MUTATION } from '@/lib/graphql/mutations';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { addDays, isBefore, format, startOfDay } from 'date-fns';

// Icons
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// 🕒 Helper: Generate 30-min interval time slots
const generateTimeSlots = () => {
  const slots = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    slots.push(`${hour}:00`);
    slots.push(`${hour}:30`);
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export default function CarsListingPage() {
  const router = useRouter();
  const theme = useTheme();
  const { data: session, status } = useSession();
  const [createBooking] = useMutation(CREATE_BOOKING_MUTATION);
  
  // Ref for scrolling to top
  const topBarRef = useRef<HTMLDivElement>(null);

  // UI States
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'warning' | 'error' | 'info'>('warning');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any>(null);

  // 1. FILTER STATE (Empty by default)
  const [mainFilter, setMainFilter] = useState({
    startDate: '',
    startTime: '', 
    endDate: '',
    endTime: ''    
  });

  const [secondaryFilter, setSecondaryFilter] = useState({
    fuelTypes: [] as string[],
    transmissions: [] as string[],
    brands: [] as string[],
    critAir: [] as string[],
  });

  const { data: enumData } = useQuery(GET_CAR_ENUMS);
  const { data: brandData } = useQuery(GET_BRANDS_QUERY);

  // 🧠 2. VALIDATION & FILTER LOGIC
  const { filterPayload, isDateSelected, isValidSelection } = useMemo(() => {
    let payload: any = {
      fuelTypes: secondaryFilter.fuelTypes.length > 0 ? secondaryFilter.fuelTypes : undefined,
      transmissions: secondaryFilter.transmissions.length > 0 ? secondaryFilter.transmissions : undefined,
      brandIds: secondaryFilter.brands.length > 0 ? secondaryFilter.brands : undefined,
      critAirRatings: secondaryFilter.critAir.length > 0 ? secondaryFilter.critAir : undefined,
    };

    const hasAllDates = mainFilter.startDate && mainFilter.startTime && mainFilter.endDate && mainFilter.endTime;
    let valid = false;

    // Only add date filter if EVERYTHING is selected
    if (hasAllDates) {
      const startDateTime = new Date(`${mainFilter.startDate}T${mainFilter.startTime}:00`);
      const endDateTime = new Date(`${mainFilter.endDate}T${mainFilter.endTime}:00`);
      const currentDateTime = new Date();
      const oneHourAhead = new Date(currentDateTime.getTime() + 60 * 60 * 1000);

      // Validation Rules
      if (startDateTime >= oneHourAhead && endDateTime > startDateTime) {
        const diffHours = (endDateTime.getTime() - startDateTime.getTime()) / 36e5;
        if (diffHours >= 2) {
          valid = true;
          payload.startDate = startDateTime.toISOString();
          payload.endDate = endDateTime.toISOString();
        }
      }
    }

    return { 
      filterPayload: payload, 
      isDateSelected: hasAllDates, 
      isValidSelection: valid 
    };
  }, [mainFilter, secondaryFilter]);

  // 📡 QUERY
  const { data, loading } = useQuery(GET_CARS_QUERY, {
    variables: { filter: filterPayload },
    fetchPolicy: 'cache-and-network'
  });

  // --- HANDLERS ---

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setMainFilter(prev => {
      const newState = { ...prev, [field]: value };
      // Auto-fill return date logic if pickup is set but return isn't
      if (field === 'startDate' && !newState.endDate) {
         const nextDay = addDays(new Date(value), 2);
         newState.endDate = format(nextDay, 'yyyy-MM-dd');
      }
      return newState;
    });
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setMainFilter(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (category: string, value: string) => {
    setSecondaryFilter((prev: any) => {
      const current = prev[category];
      const updated = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const showAlert = (msg: string, severity: 'warning' | 'error' | 'info') => {
    setAlertMessage(msg);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleBookClick = (car: any) => {
    // 🛑 STOP: If dates are not selected or invalid
    if (!isDateSelected || !isValidSelection) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showAlert('Please select valid Pickup & Return date/time to check availability.', 'warning');
      
      // Highlight visuals
      const dateInputs = document.querySelectorAll('input[type="date"]');
      if(dateInputs[0]) (dateInputs[0] as HTMLElement).focus();
      return;
    }

    handleBookNow(car.id);
  };

  const handleBookNow = async (carId: string) => {
    const startStr = `${mainFilter.startDate}T${mainFilter.startTime}`;
    const endStr = `${mainFilter.endDate}T${mainFilter.endTime}`;

    if (status !== 'authenticated') {
      const bookingUrl = `/booking?carId=${carId}&start=${startStr}&end=${endStr}`;
      router.push(`/login?redirect=${encodeURIComponent(bookingUrl)}`);
      return;
    }

    try {
      const car = data?.cars.find((c: any) => c.id === carId);
      if (!car) throw new Error('Car not found');

      const startDateTime = new Date(`${mainFilter.startDate}T${mainFilter.startTime}:00`);
      const endDateTime = new Date(`${mainFilter.endDate}T${mainFilter.endTime}:00`);
      
      const diffDays = Math.max(1, Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24)));
      const basePrice = (car.pricePerDay || 0) * diffDays;

      const { data: bookingResult } = await createBooking({
        variables: {
          input: {
            carId,
            startDate: startDateTime.toISOString(),
            endDate: endDateTime.toISOString(),
            pickupTime: mainFilter.startTime,
            returnTime: mainFilter.endTime,
            basePrice,
            taxAmount: basePrice * 0.20,
            totalPrice: basePrice * 1.20,
            depositAmount: car.depositAmount || 0,
            bookingType: 'RENTAL'
          }
        }
      });

      if (bookingResult?.createBooking?.id) {
        // Send selected dates to booking page
        router.push(`/booking?bookingId=${bookingResult.createBooking.id}&start=${startStr}&end=${endStr}`);
      }
    } catch (error: any) {
      showAlert(error.message || 'Booking failed', 'error');
    }
  };

  const FilterPanel = () => (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight={700}>Filters</Typography>
        <Button 
          size="small" 
          onClick={() => setSecondaryFilter({ fuelTypes: [], transmissions: [], brands: [], critAir: [] })}
        >
          Clear
        </Button>
      </Stack>
      {[
        { label: 'Brands', key: 'brands', data: brandData?.brands },
        { label: 'Transmission', key: 'transmissions', data: enumData?.transmissionEnum?.enumValues },
        { label: 'Fuel Type', key: 'fuelTypes', data: enumData?.fuelTypeEnum?.enumValues },
      ].map((section) => (
        <Box key={section.key} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1}>
            {section.label}
          </Typography>
          <FormGroup>
            {section.data?.map((item: any) => (
              <FormControlLabel
                key={item.id || item.name}
                control={
                  <Checkbox
                    size="small"
                    checked={secondaryFilter[section.key as keyof typeof secondaryFilter].includes(item.id || item.name)}
                    onChange={() => handleCheckboxChange(section.key, item.id || item.name)}
                    sx={{ '&.Mui-checked': { color: '#7C3AED' } }}
                  />
                }
                label={<Typography variant="body2">{item.name.replace('_', ' ')}</Typography>}
              />
            ))}
          </FormGroup>
          <Divider sx={{ mt: 2 }} />
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 8 }}>
      
      {/* 🟢 1. TOP SEARCH BAR */}
      <Paper 
        ref={topBarRef}
        elevation={0}
        sx={{ 
          position: 'fixed', 
          top: { xs: 56, sm: 64, md: 80 }, 
          left: 0, 
          right: 0, 
          zIndex: 99, 
          py: 2, 
          borderBottom: '1px solid #E2E8F0', 
          borderRadius: 0,
          bgcolor: 'rgba(255,255,255,0.95)', 
          backdropFilter: 'blur(10px)'
        }}
      >
        <Container maxWidth="lg">
          <Grid container justifyContent="center">
            <Grid item xs={12} md={10} lg={9}>
               <Paper elevation={0} sx={{ 
                 display: 'flex', flexDirection: { xs: 'column', md: 'row' }, 
                 alignItems: 'center', p: 0.5, border: '1px solid #E2E8F0', borderRadius: 4,
                 bgcolor: 'white', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                 transition: 'border 0.3s',
                 borderColor: isValidSelection ? '#7C3AED' : 'transparent'
               }}>
                  
                  {/* Pickup Section */}
                  <Box sx={{ display: 'flex', flex: 1, width: '100%', alignItems: 'center', px: 2, py: 1 }}>
                    <TextField
                      fullWidth
                      type="date"
                      value={mainFilter.startDate}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      placeholder="Pickup Date"
                      InputProps={{ 
                        startAdornment: <InputAdornment position="start"><CalendarTodayIcon fontSize="small" sx={{color: mainFilter.startDate ? '#7C3AED' : 'text.secondary'}}/></InputAdornment>,
                        disableUnderline: true,
                        sx: { fontSize: '0.95rem', fontWeight: 600 }
                      }}
                      variant="standard"
                    />
                    <FormControl variant="standard" sx={{ minWidth: 100, ml: 1 }}>
                      {!mainFilter.startTime && <InputLabel sx={{fontSize: '0.8rem'}}>Time</InputLabel>}
                      <Select
                        value={mainFilter.startTime}
                        onChange={(e) => handleTimeChange('startTime', e.target.value)}
                        disableUnderline
                        IconComponent={AccessTimeIcon}
                        displayEmpty
                        sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', '& .MuiSvgIcon-root': { color: mainFilter.startTime ? '#7C3AED' : 'text.secondary', fontSize: 20 } }}
                        MenuProps={{ PaperProps: { sx: { maxHeight: 300, borderRadius: 2 } } }}
                      >
                        {TIME_SLOTS.map((time) => (
                          <MenuItem key={`start-${time}`} value={time}>{time}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, bgcolor: '#E2E8F0', height: 30, alignSelf: 'center' }} />

                  {/* Return Section */}
                  <Box sx={{ display: 'flex', flex: 1, width: '100%', alignItems: 'center', px: 2, py: 1 }}>
                    <TextField
                      fullWidth
                      type="date"
                      value={mainFilter.endDate}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      InputProps={{ 
                        startAdornment: <InputAdornment position="start"></InputAdornment>,
                        disableUnderline: true,
                        sx: { fontSize: '0.95rem', fontWeight: 600 }
                      }}
                      variant="standard"
                    />
                    <FormControl variant="standard" sx={{ minWidth: 100, ml: 1 }}>
                      {!mainFilter.endTime && <InputLabel sx={{fontSize: '0.8rem'}}>Time</InputLabel>}
                      <Select
                        value={mainFilter.endTime}
                        onChange={(e) => handleTimeChange('endTime', e.target.value)}
                        disableUnderline
                        IconComponent={AccessTimeIcon}
                        displayEmpty
                        sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', '& .MuiSvgIcon-root': { color: mainFilter.endTime ? '#7C3AED' : 'text.secondary', fontSize: 20 } }}
                        MenuProps={{ PaperProps: { sx: { maxHeight: 300, borderRadius: 2 } } }}
                      >
                        {TIME_SLOTS.map((time) => (
                          <MenuItem key={`end-${time}`} value={time}>{time}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Search Button */}
                  <Button 
                    variant="contained" 
                    onClick={() => { 
                      if(!isValidSelection) {
                        showAlert('Please select valid pickup and return dates/times (Min 2 hours).', 'info');
                      }
                    }}
                    sx={{ 
                      borderRadius: 3, height: 48, px: 4, 
                      ml: { md: 1 }, width: { xs: '100%', md: 'auto' }, 
                      bgcolor: isValidSelection ? '#0F172A' : '#E2E8F0', 
                      color: isValidSelection ? 'white' : '#64748B',
                      fontWeight: 700, textTransform: 'none',
                      '&:hover': { bgcolor: isValidSelection ? '#334155' : '#E2E8F0' }
                    }}
                  >
                    {isValidSelection ? 'Update' : 'Check'}
                  </Button>
               </Paper>
            </Grid>

            {/* Mobile Filter Toggle */}
            <Grid item xs={12} sx={{ display: { md: 'none' } }}>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<TuneIcon />} 
                onClick={() => setMobileFilterOpen(true)}
                sx={{ borderRadius: 4, borderColor: '#E2E8F0', color: '#0F172A', bgcolor: 'white' }}
              >
                Filters ({secondaryFilter.fuelTypes.length + secondaryFilter.transmissions.length})
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* 2. MAIN CONTENT AREA */}
      <Container maxWidth="xl" sx={{ mt: { xs: 30, md: 20 } }}>
        <Grid container spacing={4}>
          
          {/* Sidebar */}
          <Grid item md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper sx={{ p: 3, position: 'sticky', top: 180, borderRadius: 4, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <FilterPanel />
            </Paper>
          </Grid>

          {/* Results Grid */}
          <Grid item xs={12} md={9}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight={800} color="#0F172A">
                {loading ? 'Fetching cars...' : `${data?.cars?.length || 0} Cars Available`}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {data?.cars?.map((car: any) => (
                <Grid item xs={12} sm={6} lg={4} key={car.id}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%', display: 'flex', flexDirection: 'column',
                      borderRadius: 4, border: '1px solid #E2E8F0',
                      transition: 'all 0.3s', bgcolor: 'white',
                      '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 30px -10px rgba(0,0,0,0.1)', borderColor: '#7C3AED' }
                    }}
                  >
                    <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1 }}>
                          {car.brand.name}
                        </Typography>
                        <Typography variant="h6" fontWeight={800} lineHeight={1.2} color="#0F172A">
                          {car.model.name}
                        </Typography>
                      </Box>
                      <IconButton size="small"><FavoriteBorderIcon fontSize="small" /></IconButton>
                    </Box>

                    <Box sx={{ height: 180, position: 'relative', my: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={car.images?.[0]?.url || '/placeholder.jpg'}
                        alt={car.model.name}
                        style={{ width: '90%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))' }}
                      />
                    </Box>

                    <Box sx={{ p: 2.5, flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                        <Chip size="small" icon={<SettingsIcon sx={{fontSize:14}}/>} label={car.transmission} sx={{bgcolor:'#F8FAFC', fontWeight:600}} />
                        <Chip size="small" icon={<LocalGasStationIcon sx={{fontSize:14}}/>} label={car.fuelType} sx={{bgcolor:'#F8FAFC', fontWeight:600}} />
                        <Chip size="small" icon={<EventSeatIcon sx={{fontSize:14}}/>} label={car.seats} sx={{bgcolor:'#F8FAFC', fontWeight:600}} />
                      </Stack>
                      
                      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h6" fontWeight={800} color="#0F172A">
                            €{car.pricePerDay?.toFixed(0)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>/ day</Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="outlined" onClick={() => { setSelectedCar(car); setDetailsOpen(true); }} sx={{ borderRadius: 3, borderColor: '#E2E8F0', color: '#64748B', fontWeight: 700 }}>
                            Details
                          </Button>
                          <Button 
                            size="small" 
                            variant="contained" 
                            onClick={() => handleBookClick(car)}
                            sx={{ 
                              borderRadius: 3, 
                              bgcolor: isValidSelection ? '#7C3AED' : '#94A3B8', 
                              boxShadow: 'none', fontWeight: 700, 
                              '&:hover': { bgcolor: isValidSelection ? '#6D28D9' : '#94A3B8' } 
                            }}
                          >
                            {isValidSelection ? 'Book Now' : 'Check Dates'}
                          </Button>
                        </Stack>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* Details Popup */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        {selectedCar && (
          <DialogContent sx={{ p: 0 }}>
            <Box display="flex" justifyContent="flex-end" p={1} position="absolute" right={0} zIndex={10}>
              <IconButton onClick={() => setDetailsOpen(false)} sx={{ bgcolor: 'white' }}><CloseIcon /></IconButton>
            </Box>
            <Grid container>
              <Grid item xs={12} md={6} sx={{ bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 350 }}>
                 <img 
                    src={selectedCar.images?.[0]?.url} 
                    style={{ width: '90%', height: 'auto', objectFit: 'contain' }} 
                    alt="Car" 
                  />
              </Grid>
              <Grid item xs={12} md={6} sx={{ p: 5 }}>
                <Typography variant="overline" color="primary" fontWeight={800}>{selectedCar.brand.name}</Typography>
                <Typography variant="h4" fontWeight={800} color="#0F172A">{selectedCar.model.name}</Typography>
                
                <Stack direction="row" spacing={1} mt={2}>
                   <Chip label={selectedCar.transmission} />
                   <Chip label={selectedCar.fuelType} />
                   <Chip label={`${selectedCar.seats} Seats`} />
                </Stack>

                <Stack spacing={2} mt={4}>
                   <Box display="flex" justifyContent="space-between" borderBottom="1px dashed #E2E8F0" pb={1}>
                      <Typography color="text.secondary" fontWeight={500}>Daily Rate</Typography>
                      <Typography fontWeight={700}>€{selectedCar.pricePerDay}</Typography>
                   </Box>
                   <Box display="flex" justifyContent="space-between" borderBottom="1px dashed #E2E8F0" pb={1}>
                      <Typography color="text.secondary" fontWeight={500}>Daily KM Limit</Typography>
                      <Typography fontWeight={700}>{selectedCar.dailyKmLimit || 'Unlimited'}</Typography>
                   </Box>
                   <Box display="flex" justifyContent="space-between" borderBottom="1px dashed #E2E8F0" pb={1}>
                      <Typography color="text.secondary" fontWeight={500}>Security Deposit</Typography>
                      <Typography fontWeight={700}>€{selectedCar.depositAmount}</Typography>
                   </Box>
                </Stack>

                <Button 
                  fullWidth 
                  variant="contained" 
                  size="large"
                  onClick={() => handleBookClick(selectedCar)}
                  sx={{ 
                    mt: 5, 
                    bgcolor: isValidSelection ? '#7C3AED' : '#94A3B8', 
                    py: 1.5, borderRadius: 3, fontWeight: 700 
                  }}
                >
                  {isValidSelection ? 'Proceed to Booking' : 'Select Dates First'}
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
        )}
      </Dialog>

      <Drawer
        anchor="left"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        PaperProps={{ sx: { width: '85vw', p: 3 } }}
      >
        <Box display="flex" justifyContent="space-between" mb={2}>
           <Typography variant="h6" fontWeight={700}>Filters</Typography>
           <IconButton onClick={() => setMobileFilterOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <FilterPanel />
      </Drawer>

      <Snackbar open={alertOpen} autoHideDuration={4000} onClose={() => setAlertOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={alertSeverity} variant="filled" sx={{ borderRadius: 2 }}>{alertMessage}</Alert>
      </Snackbar>
    </Box>
  );
}