'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Box, Container, Grid, Typography, Card, Button, Chip, Stack,
  Divider, Snackbar, Alert, MenuItem, Select,
  FormControl, Paper, IconButton, Skeleton, Drawer, Badge,
  Dialog
} from '@mui/material';
import {
  CalendarToday as CalendarTodayIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  DirectionsCar as DirectionsCarIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Check as CheckIcon,
  LocalGasStation as FuelIcon,
  Settings as GearIcon,
  Person as PersonIcon,
  InfoOutlined as InfoIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Tune as TuneIcon
} from '@mui/icons-material';

export const CarsView = ({
  mainFilter, onDateChange, onTimeChange, TIME_SLOTS,
  secondaryFilter, onCheckboxChange, brands, enums,
  loading, cars, isValidSelection, onBookClick,
  alert, onAlertClose, topBarRef,
  validationError, showValidation, hasDates
}: any) => {

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [dateTimeModalOpen, setDateTimeModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'pickup' | 'return'>('pickup');
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Generate calendar days for month view
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const openDateTimeModal = (mode: 'pickup' | 'return') => {
    setModalMode(mode);
    setDateTimeModalOpen(true);
  };

  const handleDateSelect = (day: number | null) => {
    if (!day) return;
    const year = calendarMonth.getFullYear();
    const month = String(calendarMonth.getMonth() + 1).padStart(2, '0');
    const date = String(day).padStart(2, '0');
    const dateString = `${year}-${month}-${date}`;
    
    if (modalMode === 'pickup') {
      onDateChange('startDate', dateString);
      // Store selected date for time calculation
      selectedPickupDateRef.current = dateString;
    } else {
      onDateChange('endDate', dateString);
    }
  };

  // Ref to track the selected pickup date for time calculation
  const selectedPickupDateRef = useRef<string>(mainFilter.startDate);
  
  // Keep ref in sync with prop
  useEffect(() => {
    selectedPickupDateRef.current = mainFilter.startDate;
  }, [mainFilter.startDate]);

  const handleTimeSelect = (time: string) => {
    if (modalMode === 'pickup') {
      onTimeChange('startTime', time);
      
      // Auto-calculate return date/time (+2 hours from pickup)
      // Use ref to get the most current pickup date (handles same-render date selection)
      const currentPickupDate = selectedPickupDateRef.current;
      if (currentPickupDate) {
        const pickupDateTime = new Date(`${currentPickupDate}T${time}:00`);
        const returnDateTime = new Date(pickupDateTime.getTime() + 2 * 60 * 60 * 1000);
        const returnDateStr = `${returnDateTime.getFullYear()}-${String(returnDateTime.getMonth() + 1).padStart(2, '0')}-${String(returnDateTime.getDate()).padStart(2, '0')}`;
        const returnTimeStr = `${String(returnDateTime.getHours()).padStart(2, '0')}:${String(returnDateTime.getMinutes()).padStart(2, '0')}`;
        onDateChange('endDate', returnDateStr);
        onTimeChange('endTime', returnTimeStr);
      }
    } else {
      onTimeChange('endTime', time);
    }
    // Auto close after selection
    setTimeout(() => setDateTimeModalOpen(false), 300);
  };

  const getSelectedDate = () => {
    return modalMode === 'pickup' ? mainFilter.startDate : mainFilter.endDate;
  };

  const getSelectedTime = () => {
    return modalMode === 'pickup' ? mainFilter.startTime : mainFilter.endTime;
  };

  const calendarDays = getDaysInMonth(calendarMonth);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Calculate minimum return date based on pickup + 2 hours (may be next day if pickup is late)
  const getMinReturnDate = () => {
    if (!mainFilter.startDate || !mainFilter.startTime) return mainFilter.startDate || todayString;
    const pickupDateTime = new Date(`${mainFilter.startDate}T${mainFilter.startTime}:00`);
    const minReturnDateTime = new Date(pickupDateTime.getTime() + 2 * 60 * 60 * 1000);
    return `${minReturnDateTime.getFullYear()}-${String(minReturnDateTime.getMonth() + 1).padStart(2, '0')}-${String(minReturnDateTime.getDate()).padStart(2, '0')}`;
  };
  
  const minDate = modalMode === 'pickup' ? todayString : getMinReturnDate();
  const minPickupDateTime = new Date(Date.now() + 60 * 60 * 1000);

  const handleCheckboxChange = useCallback((key: string, value: string) => {
    onCheckboxChange(key, value);
  }, [onCheckboxChange]);

  const activeFilterCount = 
    secondaryFilter.brandIds.length + 
    secondaryFilter.transmissions.length + 
    secondaryFilter.fuelTypes.length + 
    secondaryFilter.critAirRatings.length;

  const clearAllFilters = useCallback(() => {
    secondaryFilter.brandIds.forEach((id: string) => handleCheckboxChange('brandIds', id));
    secondaryFilter.transmissions.forEach((t: string) => handleCheckboxChange('transmissions', t));
    secondaryFilter.fuelTypes.forEach((f: string) => handleCheckboxChange('fuelTypes', f));
    secondaryFilter.critAirRatings.forEach((c: string) => handleCheckboxChange('critAirRatings', c));
  }, [secondaryFilter, handleCheckboxChange]);

  const FilterGroup = ({ label, items, activeItems, filterKey }: any) => (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="subtitle2" 
        fontWeight={800} 
        sx={{ 
          mb: 2, 
          color: '#0F172A', 
          textTransform: 'uppercase', 
          fontSize: '0.75rem', 
          letterSpacing: '1.2px',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        {label}
        {activeItems.length > 0 && (
          <Badge badgeContent={activeItems.length} color="primary" sx={{ ml: 1 }} />
        )}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {items?.map((item: any) => {
          const id = item.id || item.name;
          const name = item.name.replace('_', ' ');
          const isSelected = activeItems.includes(id);
          return (
            <Chip
              key={id}
              label={name}
              onClick={() => handleCheckboxChange(filterKey, id)}
              sx={{
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.85rem',
                py: 2.5,
                px: 1,
                transition: 'all 0.3s ease',
                bgcolor: isSelected ? '#7C3AED' : 'white',
                color: isSelected ? 'white' : '#475569',
                border: isSelected ? '2px solid #7C3AED' : '2px solid #E2E8F0',
                '&:hover': { 
                  bgcolor: isSelected ? '#6D28D9' : '#F1F5F9',
                  borderColor: '#7C3AED',
                  transform: 'translateY(-2px)'
                }
              }}
            />
          );
        })}
      </Box>
    </Box>
  );

  const FilterDropdown = ({ label, items, activeItems, filterKey, icon }: any) => {
    const count = activeItems.length;
    return (
      <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
        <Select
          multiple
          displayEmpty
          value={activeItems}
          IconComponent={KeyboardArrowDownIcon}
          renderValue={() => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {icon}
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: count > 0 ? '#3B82F6' : 'rgba(255, 255, 255, 0.7)' }}>
                {label}
              </Typography>
              {count > 0 && (
                <Box sx={{ bgcolor: '#3B82F6', color: 'white', borderRadius: '8px', px: 1, py: 0.2, fontSize: '0.7rem', fontWeight: 800 }}>
                  {count}
                </Box>
              )}
            </Box>
          )}
          sx={{ 
            borderRadius: '16px',
            bgcolor: count > 0 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: count > 0 ? '2px solid #3B82F6' : '2px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.2s ease',
            color: '#FFFFFF',
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)', borderColor: '#3B82F6' },
            '& .MuiSelect-icon': { color: '#3B82F6' }
          }}
          MenuProps={{ 
            PaperProps: { 
              sx: { 
                borderRadius: '16px', 
                mt: 1, 
                boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                bgcolor: '#1E293B',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              } 
            } 
          }}
        >
          {items?.map((item: any) => {
            const id = item.id || item.name;
            const isSelected = activeItems.includes(id);
            return (
              <MenuItem 
                key={id} 
                value={id} 
                onClick={() => handleCheckboxChange(filterKey, id)} 
                sx={{ 
                  py: 1.5, 
                  m: 0.5, 
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' },
                  '&.Mui-selected': { bgcolor: 'rgba(59, 130, 246, 0.15)' }
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ 
                    width: 18, 
                    height: 18, 
                    borderRadius: '4px', 
                    border: '2px solid rgba(255, 255, 255, 0.3)', 
                    bgcolor: isSelected ? '#3B82F6' : 'transparent', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {isSelected && <CheckIcon sx={{ fontSize: 12, color: 'white' }} />}
                  </Box>
                  <Typography variant="body2" fontWeight={isSelected ? 700 : 500} color="#FFFFFF">{item.name.replace('_', ' ')}</Typography>
                </Stack>
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    );
  };

  // Detect if admin sidebar is present by checking for a specific class or prop (simple approach: check for window.location.pathname)
  const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

  return (
    <Box
      sx={{
        bgcolor: '#0F172A',
        minHeight: '100vh',
        pb: 10,
        ml: isAdmin ? { md: '260px' } : 0,
        maxWidth: isAdmin ? { md: 'calc(100vw - 260px)' } : '100vw',
        transition: 'all 0.3s',
      }}
    >
      {/* 1. TOP SELECTION BAR - Clean Button-Based Modal UI */}
      <Paper
        ref={topBarRef}
        elevation={0}
        sx={{
          position: 'fixed',
          top: { xs: 56, md: 90 },
          left: isAdmin ? { xs: 0, md: '260px' } : 0,
          right: 0,
          zIndex: 99,
          py: { xs: 2, md: 3 },
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
          bgcolor: '#1E293B',
          backdropFilter: 'blur(12px)',
          maxWidth: isAdmin ? { md: 'calc(100vw - 260px)' } : '100vw',
          marginLeft: isAdmin ? { md: 'auto' } : 0,
          transition: 'all 0.3s',
          // UI size adjustments
          width: { xs: '95vw', md: 'calc(100vw - 280px)' },
          borderRadius: { xs: '24px', md: '32px' },
          mt: { xs: 2, md: 4 },
          mx: 'auto',
          boxShadow: '0 8px 32px rgba(59,130,246,0.10)',
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={1.25}>
            <Box sx={{ overflowX: 'auto', pb: 1 }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1.5}
                alignItems="stretch"
                justifyContent="center"
                sx={{ width: '100%' }}
              >
                {/* Pickup Button */}
                <Button
                  onClick={() => openDateTimeModal('pickup')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                    p: { xs: 2, md: 2.5 },
                    borderRadius: '16px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15)',
                    width: { xs: '100%', md: 'auto' },
                    minWidth: { md: 240 },
                    textTransform: 'none',
                    justifyContent: 'space-between',
                    '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' }
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, fontSize: '0.7rem', mb: 0.5, display: 'block' }}>PICK-UP</Typography>
                    <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem' }}>
                      {mainFilter.startDate && mainFilter.startTime 
                        ? `${mainFilter.startDate} ${mainFilter.startTime}`
                        : 'Select Date & Time'}
                    </Typography>
                  </Box>
                  <CalendarTodayIcon sx={{ color: '#3B82F6', fontSize: 24 }} />
                </Button>

                {/* Return Button */}
                <Button
                  onClick={() => openDateTimeModal('return')}
                  disabled={!mainFilter.startDate}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: mainFilter.startDate ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    p: { xs: 2, md: 2.5 },
                    borderRadius: '16px',
                    border: mainFilter.startDate ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: mainFilter.startDate ? '0 4px 20px rgba(59, 130, 246, 0.15)' : 'none',
                    width: { xs: '100%', md: 'auto' },
                    minWidth: { md: 240 },
                    textTransform: 'none',
                    justifyContent: 'space-between',
                    '&:hover': mainFilter.startDate ? { bgcolor: 'rgba(59, 130, 246, 0.2)' } : {},
                    '&.Mui-disabled': { opacity: 0.5 }
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, fontSize: '0.7rem', mb: 0.5, display: 'block' }}>DROP-OFF</Typography>
                    <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem' }}>
                      {mainFilter.endDate && mainFilter.endTime
                        ? `${mainFilter.endDate} ${mainFilter.endTime}`
                        : 'Select Date & Time'}
                    </Typography>
                  </Box>
                  <CalendarTodayIcon sx={{ color: '#3B82F6', fontSize: 24 }} />
                </Button>
              </Stack>
            </Box>

            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              <FilterDropdown
                label="Brand"
                items={brands}
                activeItems={secondaryFilter.brandIds}
                filterKey="brandIds"
                icon={<DirectionsCarIcon sx={{ fontSize: 18, color: '#3B82F6' }} />}
              />
              <FilterDropdown
                label="Transmission"
                items={enums.transmissionEnum?.enumValues}
                activeItems={secondaryFilter.transmissions}
                filterKey="transmissions"
                icon={<GearIcon sx={{ fontSize: 18, color: '#3B82F6' }} />}
              />
              <FilterDropdown
                label="Fuel"
                items={enums.fuelTypeEnum?.enumValues}
                activeItems={secondaryFilter.fuelTypes}
                filterKey="fuelTypes"
                icon={<FuelIcon sx={{ fontSize: 18, color: '#3B82F6' }} />}
              />
              <FilterDropdown
                label="Crit Air"
                items={enums.critAirRatingEnum?.enumValues}
                activeItems={secondaryFilter.critAirRatings}
                filterKey="critAirRatings"
                icon={<InfoIcon sx={{ fontSize: 18, color: '#3B82F6' }} />}
              />
              {activeFilterCount > 0 && (
                <Button
                  onClick={clearAllFilters}
                  startIcon={<ClearIcon />}
                  sx={{
                    color: '#EF4444',
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    px: 2.5,
                    borderRadius: '12px',
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' },
                  }}
                >
                  Clear
                </Button>
              )}
            </Stack>
          </Stack>
          <Box sx={{ mt: 1.5, textAlign: 'center' }}>
            {(!isValidSelection && (showValidation || hasDates)) ? (
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: '12px',
                bgcolor: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#93C5FD'
              }}>
                <InfoIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: '#93C5FD', fontWeight: 700 }}>
                  {validationError}
                </Typography>
              </Box>
            ) : null}
          </Box>
        </Container>
      </Paper>

      {/* DATE/TIME MODAL */}
      <Dialog
        open={dateTimeModalOpen}
        onClose={() => setDateTimeModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            bgcolor: '#1E293B',
            backgroundImage: 'none',
          }
        }}
      >
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#1E293B' }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={900} color="#FFFFFF">
              {modalMode === 'pickup' ? 'Select Pickup' : 'Select Return'} Date & Time
            </Typography>
            <IconButton onClick={() => setDateTimeModalOpen(false)} sx={{ color: '#FFFFFF' }}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Grid container spacing={3}>
            {/* Calendar Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: 'rgba(59, 130, 246, 0.05)', p: 3, borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography fontWeight={700} color="#FFFFFF">
                    {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <IconButton 
                      size="small" 
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                      sx={{ color: '#3B82F6' }}
                    >
                      <ChevronLeftIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                      sx={{ color: '#3B82F6' }}
                    >
                      <ChevronRightIcon />
                    </IconButton>
                  </Stack>
                </Stack>

                {/* Day Headers */}
                <Grid container sx={{ mb: 1 }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Grid item xs={12 / 7} key={day} sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" fontWeight={700} color="rgba(255, 255, 255, 0.5)">{day}</Typography>
                    </Grid>
                  ))}
                </Grid>

                {/* Calendar Days */}
                <Grid container spacing={0.5}>
                  {calendarDays.map((day, idx) => {
                    const isDisabled = !day || new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day) < new Date(minDate.split('-').map(Number)[0], minDate.split('-').map(Number)[1] - 1, minDate.split('-').map(Number)[2]);
                    const dateStr = day ? `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                    const isSelected = day && getSelectedDate() === dateStr;

                    return (
                      <Grid item xs={12 / 7} key={idx}>
                        {day ? (
                          <Button
                            onClick={() => handleDateSelect(day)}
                            disabled={isDisabled}
                            fullWidth
                            sx={{
                              aspectRatio: '1',
                              p: 0,
                              borderRadius: '10px',
                              bgcolor: isSelected ? '#3B82F6' : 'rgba(59, 130, 246, 0.05)',
                              color: isSelected ? '#FFFFFF' : '#FFFFFF',
                              fontWeight: isSelected ? 700 : 500,
                              border: isSelected ? '2px solid #3B82F6' : 'none',
                              opacity: isDisabled ? 0.3 : 1,
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              '&:hover': !isDisabled ? { bgcolor: isSelected ? '#3B82F6' : 'rgba(59, 130, 246, 0.15)' } : {}
                            }}
                          >
                            {day}
                          </Button>
                        ) : (
                          <Box />
                        )}
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Grid>

            {/* Time Slots Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: 'rgba(59, 130, 246, 0.05)', p: 3, borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.2)', maxHeight: '400px', overflowY: 'auto' }}>
                <Typography fontWeight={700} color="#FFFFFF" sx={{ mb: 2 }}>Select Time</Typography>
                <Grid container spacing={1}>
                  {TIME_SLOTS.filter((time: string) => {
                    const selectedDateStr = getSelectedDate();
                    if (!selectedDateStr) return true; // Show all if no date selected
                    const isPickupToday = modalMode === 'pickup' && selectedDateStr === todayString;
                    const slotDate = new Date(`${selectedDateStr}T${time}:00`);
                    
                    // Filter out unavailable pickup time slots (must be 1h from now)
                    if (isPickupToday && slotDate < minPickupDateTime) return false;
                    
                    // Filter out unavailable return time slots
                    if (modalMode === 'return' && mainFilter.startDate && mainFilter.startTime) {
                      const pickupDateTime = new Date(`${mainFilter.startDate}T${mainFilter.startTime}:00`);
                      const minReturnDateTime = new Date(pickupDateTime.getTime() + 2 * 60 * 60 * 1000);
                      const minReturnDateStr = `${minReturnDateTime.getFullYear()}-${String(minReturnDateTime.getMonth() + 1).padStart(2, '0')}-${String(minReturnDateTime.getDate()).padStart(2, '0')}`;
                      
                      // If selected return date is the minimum return date, filter times before minimum return time
                      if (selectedDateStr === minReturnDateStr && slotDate < minReturnDateTime) return false;
                    }
                    return true;
                  }).map((time: string) => {
                    const isSelected = getSelectedTime() === time;
                    return (
                      <Grid item xs={6} key={time}>
                        <Button
                          onClick={() => handleTimeSelect(time)}
                          fullWidth
                          sx={{
                            p: 1.5,
                            borderRadius: '10px',
                            bgcolor: isSelected ? '#3B82F6' : 'rgba(59, 130, 246, 0.05)',
                            color: '#FFFFFF',
                            fontWeight: isSelected ? 700 : 500,
                            border: isSelected ? '2px solid #3B82F6' : '1px solid rgba(59, 130, 246, 0.2)',
                            textTransform: 'none',
                            '&:hover': { bgcolor: isSelected ? '#3B82F6' : 'rgba(59, 130, 246, 0.15)' }
                          }}
                        >
                          {time}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Grid>
          </Grid>

          {/* Confirm Button */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              onClick={() => setDateTimeModalOpen(false)}
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#3B82F6',
                color: '#FFFFFF',
                fontWeight: 700,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                '&:hover': { bgcolor: '#2563EB' }
              }}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Spacer to account for fixed top bar height */}
      <Box sx={{ height: { xs: 200, md: 180 } }} />

      {/* Mobile Filters Button (floats above bottom nav) */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          right: 16,
          bottom: 88,
          zIndex: 120,
        }}
      >
        <Button
          variant="contained"
          onClick={() => setIsFilterDrawerOpen(true)}
          startIcon={<TuneIcon />}
          sx={{
            borderRadius: '24px',
            bgcolor: '#3B82F6',
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            py: 1.5,
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.5)',
            '&:hover': { bgcolor: '#2563EB' },
          }}
        >
          Filters
        </Button>
      </Box>

      {/* 3. CARS GRID */}
      <Container maxWidth="xl" sx={{ pt: { xs: 4, md: 6 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={900} color="#FFFFFF" sx={{ letterSpacing: '-1px' }}>Available Fleet</Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.6)" fontWeight={500}>Showing {cars.length} vehicles ready for pickup</Typography>
        </Box>

        <Grid container spacing={4}>
          {loading ? (
            [...Array(6)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={380} sx={{ borderRadius: '24px' }} />
              </Grid>
            ))
          ) : (
            cars.map((car: any) => (
              <Grid item xs={12} sm={6} md={4} key={car.id}>
                <Card elevation={0} sx={{ 
                  borderRadius: '24px', border: '1px solid #E2E8F0', transition: '0.3s',
                  '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', borderColor: '#7C3AED' }
                }}>
                  <Box sx={{ position: 'relative', height: 200, p: 3, bgcolor: '#F8FAFC', display: 'flex', justifyContent: 'center' }}>
                    <Image src={car.images?.[0]?.url || '/placeholder.jpg'} alt="car" fill style={{ objectFit: 'contain', padding: '20px' }} />
                    <Chip label="Premium" size="small" sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'white', fontWeight: 800, fontSize: '0.6rem' }} />
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="caption" fontWeight={800} color="#7C3AED" sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{car.brand.name}</Typography>
                    <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>{car.model.name}</Typography>
                    
                    <Stack direction="row" spacing={2} mb={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
                        <GearIcon sx={{ fontSize: 16 }} /><Typography variant="caption" fontWeight={700}>{car.transmission.split('_')[0]}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
                        <FuelIcon sx={{ fontSize: 16 }} /><Typography variant="caption" fontWeight={700}>{car.fuelType}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
                        <PersonIcon sx={{ fontSize: 16 }} /><Typography variant="caption" fontWeight={700}>{car.seats} Seats</Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h5" fontWeight={900} color="#0F172A">€{car.pricePerDay}</Typography>
                        <Typography variant="caption" color="#64748B" fontWeight={600}>per day</Typography>
                      </Box>
                      <Button 
                        variant="contained" 
                        onClick={() => onBookClick(car)}
                        disabled={!isValidSelection}
                        sx={{ borderRadius: '14px', bgcolor: '#0F172A', textTransform: 'none', fontWeight: 700, px: 4, '&:hover': { bgcolor: '#7C3AED' } }}
                      >
                        Book
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>

      {/* 4. MOBILE DRAWER FILTERS */}
      <Drawer
        anchor="bottom"
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        PaperProps={{ sx: { borderRadius: '24px 24px 0 0', p: 3, maxHeight: '80vh' } }}
        transitionDuration={300}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={900}>Filters</Typography>
          <IconButton onClick={() => setIsFilterDrawerOpen(false)} sx={{ bgcolor: '#F1F5F9' }}><CloseIcon /></IconButton>
        </Stack>
        <Box sx={{ overflowY: 'auto' }}>
          <FilterGroup label="Brands" items={brands} activeItems={secondaryFilter.brandIds} filterKey="brandIds" />
          <FilterGroup label="Transmission" items={enums.transmissionEnum?.enumValues} activeItems={secondaryFilter.transmissions} filterKey="transmissions" />
          <FilterGroup label="Fuel Type" items={enums.fuelTypeEnum?.enumValues} activeItems={secondaryFilter.fuelTypes} filterKey="fuelTypes" />
          <FilterGroup label="Crit Air" items={enums.critAirRatingEnum?.enumValues} activeItems={secondaryFilter.critAirRatings} filterKey="critAirRatings" />
        </Box>
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button fullWidth variant="outlined" onClick={clearAllFilters} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>Reset</Button>
          <Button fullWidth variant="contained" onClick={() => setIsFilterDrawerOpen(false)} sx={{ borderRadius: '12px', bgcolor: '#7C3AED', textTransform: 'none', fontWeight: 700 }}>Apply</Button>
        </Stack>
      </Drawer>
      <Snackbar open={alert.open} autoHideDuration={4000} onClose={onAlertClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={alert.severity} variant="filled" sx={{ borderRadius: '12px', fontWeight: 600 }}>{alert.message}</Alert>
      </Snackbar>
    </Box>
  );
};