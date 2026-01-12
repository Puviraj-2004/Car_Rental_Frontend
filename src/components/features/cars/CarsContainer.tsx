'use client';

import React, { useState, useMemo, useRef } from 'react';
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

  const { cars, enums, brands, loading, createBooking } = useCars(filterPayload, shouldSkip);

  const handleBookClick = async (car: any) => {
    if (!hasDates || !isValidSelection) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setAlert({ open: true, message: validationError || 'Please select valid dates.', severity: 'warning' });
      return;
    }

    if (status !== 'authenticated') {
      const params = new URLSearchParams({
        carId: car.id,
        start: `${mainFilter.startDate}T${mainFilter.startTime}`,
        end: `${mainFilter.endDate}T${mainFilter.endTime}`
      });
      router.push(`/login?redirect=${encodeURIComponent(`/booking?${params.toString()}`)}`);
      return;
    }

    try {
      const days = Math.ceil((new Date(mainFilter.endDate).getTime() - new Date(mainFilter.startDate).getTime()) / 86400000) || 1;
      const { data } = await createBooking({
        variables: {
          input: {
            carId: car.id,
            startDate: new Date(`${mainFilter.startDate}T${mainFilter.startTime}:00`).toISOString(),
            endDate: new Date(`${mainFilter.endDate}T${mainFilter.endTime}:00`).toISOString(),
            totalPrice: car.pricePerDay * days,
            bookingType: 'RENTAL'
          }
        }
      });
      if (data?.createBooking?.id) {
        const params = new URLSearchParams({
          bookingId: data.createBooking.id,
          carId: car.id,
          start: `${mainFilter.startDate}T${mainFilter.startTime}`,
          end: `${mainFilter.endDate}T${mainFilter.endTime}`
        });
        router.push(`/booking?${params.toString()}`);
      }
    } catch (e: any) {
      setAlert({ open: true, message: e.message, severity: 'error' });
    }
  };

  // Enhanced handlers to track user interaction
  const handleDateChange = (f: any, v: any) => {
    setMainFilter((p) => ({ ...p, [f]: v }));
    setTouched((t) => ({ ...t, [f]: true }));
  };
  const handleTimeChange = (f: any, v: any) => {
    setMainFilter((p) => ({ ...p, [f]: v }));
    setTouched((t) => ({ ...t, [f]: true }));
  };
  // Show validation if any date/time field has been touched
  const showValidation = Object.values(touched).some(Boolean);

  return (
    <CarsView
      mainFilter={mainFilter}
      onDateChange={handleDateChange}
      onTimeChange={handleTimeChange}
      TIME_SLOTS={Array.from({ length: 48 }, (_, i) => `${Math.floor(i / 2).toString().padStart(2, '0')}:${i % 2 ? '30' : '00'}`)}
      secondaryFilter={secondaryFilter}
      onCheckboxChange={(c: any, v: any) => setSecondaryFilter((p: any) => ({ ...p, [c]: p[c].includes(v) ? p[c].filter((x: any) => x !== v) : [...p[c], v] }))}
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