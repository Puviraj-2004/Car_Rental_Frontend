'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { addHours, isBefore, isSameDay, isToday } from 'date-fns';
import { useCars } from '@/hooks/graphql/useCars';
import { CarsView } from './CarsView';

export const CarsContainer = () => {
  const router = useRouter();
  const { status } = useSession();
  const topBarRef = useRef<HTMLDivElement>(null);

  const [mainFilter, setMainFilter] = useState({ startDate: '', startTime: '', endDate: '', endTime: '' });
  const [touched, setTouched] = useState({ startDate: false, startTime: false, endDate: false, endTime: false });
  const [secondaryFilter, setSecondaryFilter] = useState({ fuelTypes: [], transmissions: [], brandIds: [], critAirRatings: [] });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'warning' as any });

  const { filterPayload, isValidSelection, hasDates, shouldSkip, validationError } = useMemo(() => {
    let payload: any = {
      fuelTypes: secondaryFilter.fuelTypes.length ? secondaryFilter.fuelTypes : undefined,
      transmissions: secondaryFilter.transmissions.length ? secondaryFilter.transmissions : undefined,
      brandIds: secondaryFilter.brandIds.length ? secondaryFilter.brandIds : undefined,
      critAirRatings: secondaryFilter.critAirRatings.length ? secondaryFilter.critAirRatings : undefined,
    };

    const isFilled = !!(mainFilter.startDate && mainFilter.startTime && mainFilter.endDate && mainFilter.endTime);
    if (!isFilled) {
      return { filterPayload: payload, isValidSelection: false, hasDates: false, shouldSkip: false, validationError: '' };
    }

    const start = new Date(`${mainFilter.startDate}T${mainFilter.startTime}:00`);
    const end = new Date(`${mainFilter.endDate}T${mainFilter.endTime}:00`);
    const nowDate = new Date();
    const today = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
    const pickupDate = new Date(mainFilter.startDate);
    const minPickupTime = addHours(nowDate, 1);
    
    let valid = true;
    let validationError = '';
    
    // Validation 1: Pickup date cannot be before today
    if (pickupDate < today) {
      valid = false;
      validationError = 'Pickup date must be today or a future date.';
    }
    // Validation 2: Pickup time must be at least 1 hour from now (if today)
    else if (isToday(pickupDate) && isBefore(start, minPickupTime)) {
      valid = false;
      validationError = 'Pickup time must be at least 1 hour from now.';
    }
    // Validation 3: Return date must be same or later than pickup date
    else if (end < start) {
      valid = false;
      validationError = 'Return date/time must be after pickup date/time.';
    }
    // Validation 4: If same day, minimum 2-hour duration
    else if (isSameDay(start, end)) {
      const durationHours = (end.getTime() - start.getTime()) / 36e5;
      if (durationHours < 2) {
        valid = false;
        validationError = 'Minimum booking duration is 2 hours for same-day pickups.';
      }
    }

    if (valid) {
      payload.startDate = start.toISOString();
      payload.endDate = end.toISOString();
    }

    return { filterPayload: payload, isValidSelection: valid, hasDates: true, shouldSkip: !valid, validationError };
  }, [mainFilter, secondaryFilter]);

  const { cars, enums, brands, loading } = useCars(filterPayload, shouldSkip);

  const handleBookClick = (car: any) => {
    // 1. Validate Selection
    if (!hasDates || !isValidSelection) {
      if (topBarRef.current) {
        topBarRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setAlert({ open: true, message: validationError || 'Please select valid dates to proceed.', severity: 'warning' });
      // Mark fields as touched to show errors in UI
      setTouched({ startDate: true, startTime: true, endDate: true, endTime: true });
      return;
    }

    // 2. Construct URL Parameters
    // We combine date and time into the ISO-like format expected by BookingContainer
    const startDateTime = `${mainFilter.startDate}T${mainFilter.startTime}`;
    const endDateTime = `${mainFilter.endDate}T${mainFilter.endTime}`;

    const params = new URLSearchParams({
      carId: car.id,
      start: startDateTime,
      end: endDateTime
    });

    const targetUrl = `/booking?${params.toString()}`;

    // 3. Navigate (Handle Auth Redirect if needed)
    if (status !== 'authenticated') {
      router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push(targetUrl);
    }
  };

  const handleDateChange = useCallback((f: string, v: string) => {
    setMainFilter((p: any) => ({ ...p, [f]: v }));
    setTouched((t: any) => ({ ...t, [f]: true }));
  }, []);

  const handleTimeChange = useCallback((f: string, v: string) => {
    setMainFilter((p: any) => ({ ...p, [f]: v }));
    setTouched((t: any) => ({ ...t, [f]: true }));
  }, []);

  const handleCheckboxChange = useCallback((k: string, v: string) => {
    setSecondaryFilter((p: any) => ({
      ...p,
      [k]: p[k].includes(v) 
        ? p[k].filter((x: any) => x !== v) 
        : [...p[k], v]
    }));
  }, []);

  const showValidation = Object.values(touched).some(Boolean);

  return (
    <CarsView
      mainFilter={mainFilter}
      onDateChange={handleDateChange}
      onTimeChange={handleTimeChange}
      TIME_SLOTS={Array.from({ length: 48 }, (_, i) => `${Math.floor(i / 2).toString().padStart(2, '0')}:${i % 2 ? '30' : '00'}`)}
      secondaryFilter={secondaryFilter}
      onCheckboxChange={handleCheckboxChange}
      brands={brands}
      enums={enums}
      loading={loading}
      cars={cars}
      isValidSelection={isValidSelection}
      hasDates={hasDates}
      onBookClick={handleBookClick}
      alert={alert}
      onAlertClose={() => setAlert({ ...alert, open: false })}
      topBarRef={topBarRef}
      validationError={showValidation ? validationError : ''}
    />
  );
};