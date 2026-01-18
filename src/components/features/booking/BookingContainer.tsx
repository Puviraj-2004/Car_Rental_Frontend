'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { addHours, isBefore, isSameDay, isToday } from 'date-fns';
import { useBooking } from '@/hooks/graphql/useBooking';
import { BookingView } from './BookingView';
import { generateTimeOptions, getMinPickupDate, generateDefaultBookingDates } from '@/lib/dateUtils';
import { Box, CircularProgress, Typography, Alert, Container, Button } from '@mui/material';

export const BookingContainer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const carId = searchParams.get('carId');
  const bookingId = searchParams.get('bookingId') || null;
  
  // Logic: If bookingId exists, we are in Edit Mode
  const isEditMode = !!bookingId;

  const defaultDates = generateDefaultBookingDates();

  const [startDate, setStartDate] = useState(defaultDates.start.date);
  const [startTime, setStartTime] = useState('10:00');
  const [endDate, setEndDate] = useState(defaultDates.end.date);
  const [endTime, setEndTime] = useState('10:00');

  const [changeCarDialog, setChangeCarDialog] = useState(false);
  const [isCarAvailable, setIsCarAvailable] = useState(true);
  const [emailVerificationPopup, setEmailVerificationPopup] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState<any>(null);
  const [verificationTimer, setVerificationTimer] = useState<string>('60:00');
  const [copySuccess, setCopySuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Sync URL Params
  useEffect(() => {
    const rawStart = searchParams.get('start');
    const rawEnd = searchParams.get('end');
    if (rawStart?.includes('T')) {
      const [d, t] = rawStart.split('T');
      setStartDate(d); setStartTime(t.substring(0, 5));
    }
    if (rawEnd?.includes('T')) {
      const [d, t] = rawEnd.split('T');
      setEndDate(d); setEndTime(t.substring(0, 5));
    }
  }, [searchParams]);

  // Date/Time Validation
  useEffect(() => {
    if (!startDate || !startTime || !endDate || !endTime) {
      setValidationError('');
      return;
    }
    
    const start = new Date(`${startDate}T${startTime}:00`);
    const end = new Date(`${endDate}T${endTime}:00`);
    const nowDate = new Date();
    const today = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
    const pickupDate = new Date(startDate);
    const minPickupTime = addHours(nowDate, 1);
    
    let error = '';
    
    if (pickupDate < today) {
      error = 'Pickup date must be today or a future date.';
    } else if (isToday(pickupDate) && isBefore(start, minPickupTime)) {
      error = 'Pickup time must be at least 1 hour from now.';
    } else if (end < start) {
      error = 'Return date/time must be after pickup date/time.';
    } else if (isSameDay(start, end)) {
      const durationHours = (end.getTime() - start.getTime()) / 36e5;
      if (durationHours < 2) {
        error = 'Minimum booking duration is 2 hours for same-day pickups.';
      }
    }
    
    setValidationError(error);
  }, [startDate, startTime, endDate, endTime]);

  const startDateTime = `${startDate}T${startTime}:00`;
  const endDateTime = `${endDate}T${endTime}:00`;
  const hasDates = !!(startDate && startTime && endDate && endTime);

  // Logic: First check URL carId, if not then check bookingData (when it arrives)
  const [targetCarId, setTargetCarId] = useState<string | null>(carId);

  const { 
    userData, platformData, bookingData, bookingLoading, bookingError,
    carData, carLoading, carError,
    availabilityData, checkingAvailability, availableCarsData, availableCarsLoading,
    createBooking, createBookingLoading, confirmReservation, confirmReservationLoading,
    updateBooking, updateBookingLoading
  } = useBooking(bookingId, targetCarId, startDateTime, endDateTime, hasDates, changeCarDialog);

  // Update targetCarId once booking data arrives
  useEffect(() => {
    if (bookingData?.car?.id) {
      setTargetCarId(bookingData.car.id);
    }
  }, [bookingData]);

  // Populate dates from booking data when editing
  useEffect(() => {
    if (bookingData && bookingId) {
      // Only populate if no URL params are present (editing existing booking)
      const rawStart = searchParams.get('start');
      const rawEnd = searchParams.get('end');
      
      if (!rawStart && !rawEnd && bookingData.startDate && bookingData.endDate) {
        const start = new Date(bookingData.startDate);
        const end = new Date(bookingData.endDate);
        
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
        setStartTime(bookingData.pickupTime || '10:00');
        setEndTime(bookingData.returnTime || '10:00');
      }
    }
  }, [bookingData, bookingId, searchParams]);

  useEffect(() => {
    if (availabilityData?.checkCarAvailability) setIsCarAvailable(availabilityData.checkCarAvailability.available);
  }, [availabilityData]);

  // Price Calculation
  const priceDetails = useMemo(() => {
    if (!carData || !hasDates || !platformData?.platformSettings) return null;
    const settings = platformData.platformSettings;
    const diffMs = Math.abs(new Date(endDateTime).getTime() - new Date(startDateTime).getTime());
    const diffDays = Math.ceil(diffMs / 86400000) || 1;
    let isYoung = false;
    if (userData?.me?.dateOfBirth) {
      const age = (new Date().getTime() - new Date(userData.me.dateOfBirth).getTime()) / 31557600000;
      if (age < settings.youngDriverMinAge) isYoung = true;
    }
    const basePrice = carData.pricePerDay * diffDays;
    const tax = basePrice * (settings.taxPercentage / 100);
    const surcharge = isYoung ? settings.youngDriverFee * diffDays : 0;
    return { durationLabel: `${diffDays} days`, basePrice, totalSurcharge: surcharge, taxAmount: tax, totalPrice: basePrice + tax + surcharge, deposit: carData.depositAmount };
  }, [carData, startDateTime, endDateTime, platformData, userData, hasDates]);

  // Timer & Confirmation logic
  useEffect(() => {
    if (!emailVerificationPopup || !confirmedBookingData?.verification?.expiresAt) return;
    const interval = setInterval(() => {
      const diff = new Date(confirmedBookingData.verification.expiresAt).getTime() - new Date().getTime();
      if (diff <= 0) { setVerificationTimer('EXPIRED'); clearInterval(interval); return; }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setVerificationTimer(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [emailVerificationPopup, confirmedBookingData]);

  const handleConfirmAction = async () => {
    try {
      if (isEditMode && bookingId) {
        // UPDATE EXISTING BOOKING
        await updateBooking({ 
          variables: { 
            id: bookingId, 
            input: { 
              startDate: new Date(startDateTime).toISOString(), 
              endDate: new Date(endDateTime).toISOString(), 
              pickupTime: startTime, 
              returnTime: endTime,
              basePrice: priceDetails?.basePrice,
              taxAmount: priceDetails?.taxAmount, 
              totalPrice: priceDetails?.totalPrice
            } 
          } 
        });
        // Redirect to booking records after successful update
        router.push('/bookingRecords');
      } else {
        // CREATE NEW BOOKING
        const { data: bRes } = await createBooking({ variables: { input: { carId: targetCarId, startDate: new Date(startDateTime).toISOString(), endDate: new Date(endDateTime).toISOString(), pickupTime: startTime, returnTime: endTime, basePrice: priceDetails?.basePrice, taxAmount: priceDetails?.taxAmount, totalPrice: priceDetails?.totalPrice, depositAmount: priceDetails?.deposit, bookingType: 'RENTAL' } } });
        const bId = bRes.createBooking.id;
        const { data: confirmData } = await confirmReservation({ variables: { id: bId } });
        setConfirmedBookingData(confirmData.confirmReservation);
        setEmailVerificationPopup(true);
      }
    } catch (e: any) { alert(e.message); }
  };

  const handleCopyLink = () => {
    if (confirmedBookingData?.verification?.token) {
      navigator.clipboard.writeText(`${window.location.origin}/verification/${confirmedBookingData.verification.token}`);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (bookingError || carError) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {bookingError?.message || carError?.message || "Failed to load booking details."}
        </Alert>
        <Button variant="contained" onClick={() => router.push('/cars')}>Back to Fleet</Button>
      </Container>
    );
  }

  if (status === 'loading' || bookingLoading || carLoading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">Fetching secure data...</Typography>
      </Box>
    );
  }

  return (
    <BookingView 
      router={router} 
      car={carData} 
      startDate={startDate} 
      setStartDate={setStartDate} 
      startTime={startTime} 
      setStartTime={setStartTime} 
      endDate={endDate} 
      setEndDate={setEndDate} 
      endTime={endTime} 
      setEndTime={setEndTime} 
      generateTimeOptions={generateTimeOptions} 
      getMinPickupDate={getMinPickupDate} 
      checkingAvailability={checkingAvailability} 
      isCarAvailable={isCarAvailable} 
      hasDates={hasDates} 
      priceDetails={priceDetails} 
      platformData={platformData} 
      createBookingLoading={createBookingLoading} 
      confirmReservationLoading={confirmReservationLoading} 
      changeCarDialog={changeCarDialog} 
      setChangeCarDialog={setChangeCarDialog} 
      availableCarsLoading={availableCarsLoading} 
      availableCarsData={availableCarsData} 
      startDateTime={startDateTime} 
      endDateTime={endDateTime}
      emailVerificationPopup={emailVerificationPopup} 
      confirmedBookingData={confirmedBookingData} 
      verificationTimer={verificationTimer} 
      copySuccess={copySuccess} 
      handleCopyLink={handleCopyLink} 
      onConfirmAction={handleConfirmAction}
      isEditMode={isEditMode} 
      updateBookingLoading={updateBookingLoading}
    />
  );
};