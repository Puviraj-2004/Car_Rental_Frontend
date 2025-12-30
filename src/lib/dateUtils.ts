/**
 * Industrial Date Utilities for Car Rental System
 * Handles all date parsing, validation, and formatting operations
 */

export interface DateTimeComponents {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  iso: string;  // YYYY-MM-DDTHH:MM
}

/**
 * Comprehensive date validation
 */
export function isValidDateValue(date: Date | string | null | undefined): boolean {
  if (!date) return false;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime()) && dateObj.getTime() > 0;
  } catch {
    return false;
  }
}


/**
 * Generate default booking dates when URL params are missing
 */
export function generateDefaultBookingDates(): { start: DateTimeComponents; end: DateTimeComponents } {
  const now = new Date();

  // Start: Next hour from now
  const startDateTime = new Date(now.getTime() + (60 * 60 * 1000)); // +1 hour
  const startDate = startDateTime.toISOString().split('T')[0];
  const startTime = startDateTime.toISOString().split('T')[1].substring(0, 5);

  // End: 2 hours after start
  const endDateTime = new Date(startDateTime.getTime() + (2 * 60 * 60 * 1000)); // +2 hours
  const endDate = endDateTime.toISOString().split('T')[0];
  const endTime = endDateTime.toISOString().split('T')[1].substring(0, 5);

  return {
    start: {
      date: startDate,
      time: startTime,
      iso: `${startDate}T${startTime}`
    },
    end: {
      date: endDate,
      time: endTime,
      iso: `${endDate}T${endTime}`
    }
  };
}

/**
 * Safely parse URL date parameters from car listing page
 */
export function parseUrlDateParams(startParam?: string | null, endParam?: string | null): {
  start: DateTimeComponents | null;
  end: DateTimeComponents | null;
} {
  const parseSingleParam = (param: string | null | undefined): DateTimeComponents | null => {
    if (!param || typeof param !== 'string') return null;

    try {
      // Handle both ISO format (2024-01-15T10:30) and date-only format
      const parts = param.split('T');

      if (parts.length === 1) {
        // Date only (e.g., "2024-01-15")
        const date = parts[0];
        if (!isValidDateString(date)) return null;
      return {
        date,
        time: '09:00', // Default morning time
        iso: `${date}T09:00`
      } as DateTimeComponents;
      } else if (parts.length === 2) {
        // Date and time (e.g., "2024-01-15T10:30")
        const [date, time] = parts;
        if (!isValidDateString(date) || !isValidTimeString(time)) return null;

        return {
          date,
          time: time.length >= 5 ? time.substring(0, 5) : time,
          iso: `${date}T${time}`
        };
      }
    } catch (error) {
      console.warn('Failed to parse date parameter:', param, error);
    }

    return null;
  };

  return {
    start: parseSingleParam(startParam),
    end: parseSingleParam(endParam)
  };
}

/**
 * Validate date string format (YYYY-MM-DD)
 */
export function isValidDateString(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;

  const date = new Date(dateStr + 'T00:00:00');
  return !isNaN(date.getTime()) &&
         date.getFullYear() === parseInt(dateStr.split('-')[0]) &&
         date.getMonth() === parseInt(dateStr.split('-')[1]) - 1 &&
         date.getDate() === parseInt(dateStr.split('-')[2]);
}

/**
 * Validate time string format (HH:MM)
 */
export function isValidTimeString(timeStr: string): boolean {
  if (!timeStr || typeof timeStr !== 'string') return false;

  const timeRegex = /^\d{1,2}:\d{2}$/;
  if (!timeRegex.test(timeStr)) return false;

  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

/**
 * Validate complete ISO datetime string
 */
export function isValidDateTime(isoString: string): boolean {
  if (!isoString || typeof isoString !== 'string') return false;

  try {
    const date = new Date(isoString);
    return !isNaN(date.getTime()) && isoString.includes('T');
  } catch {
    return false;
  }
}

/**
 * Format date for display in Indian locale
 */
export function formatDateForDisplay(date: Date | string | null): string {
  if (!date) return 'N/A';

  try {
    let dateObj: Date;

    if (typeof date === 'string') {
      // Handle different date string formats from database/API
      if (date.includes('T')) {
        // ISO format with time (2024-01-15T10:30:00.000Z)
        dateObj = new Date(date);
      } else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Date only format (YYYY-MM-DD)
        dateObj = new Date(date + 'T12:00:00'); // Use noon to avoid timezone issues
      } else {
        // Try parsing as regular date string
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }

    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date value:', date);
      return 'Invalid Date';
    }

    // Use local timezone for consistent display
    return dateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.warn('Date formatting error for value:', date, error);
    return 'Invalid Date';
  }
}

/**
 * Format time for display
 */
export function formatTimeForDisplay(date: Date | string | null): string {
  if (!date) return '--:--';

  try {
    let dateObj: Date;

    if (typeof date === 'string') {
      // Handle different date string formats
      if (date.includes('T')) {
        // ISO format with time
        dateObj = new Date(date);
      } else if (date.match(/^\d{2}:\d{2}$/)) {
        // Time only format (HH:MM) - assume today
        const today = new Date().toISOString().split('T')[0];
        dateObj = new Date(today + 'T' + date + ':00');
      } else {
        // Try parsing as regular date string
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }

    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid time value:', date);
      return '--:--';
    }

    return dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  } catch (error) {
    console.warn('Time formatting error for value:', date, error);
    return '--:--';
  }
}

/**
 * Format date and time together
 */
export function formatDateTimeForDisplay(date: Date | string | null): string {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    return dateObj.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  } catch (error) {
    console.warn('DateTime formatting error:', error);
    return 'Invalid Date';
  }
}

/**
 * Calculate duration between two dates
 */
export function calculateDuration(startDate: Date | string, endDate: Date | string): {
  hours: number;
  days: number;
  label: string;
} {
  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { hours: 0, days: 0, label: 'Invalid dates' };
    }

    const diffMs = end.getTime() - start.getTime();
    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let label = '';
    if (hours < 24) {
      label = `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      label = `${days} day${days !== 1 ? 's' : ''}`;
    }

    return { hours, days, label };
  } catch (error) {
    console.warn('Duration calculation error:', error);
    return { hours: 0, days: 0, label: 'Calculation error' };
  }
}

/**
 * Generate time options for dropdowns (30-minute intervals)
 */
export function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(timeString);
    }
  }
  return times;
}

/**
 * Get minimum pickup date (2 hours from now)
 */
export function getMinPickupDate(): string {
  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 2);
  return minDate.toISOString().split('T')[0];
}

/**
 * Validate date range (end must be after start)
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  if (!isValidDateString(startDate) || !isValidDateString(endDate)) return false;

  const start = new Date(startDate + 'T00:00');
  const end = new Date(endDate + 'T00:00');

  return end > start;
}
