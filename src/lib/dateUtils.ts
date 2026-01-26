/**
 * Industrial Date Utilities for Car Rental System
 * Handles all date parsing, validation, and formatting operations
 */

export interface DateTimeComponents {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  iso: string;  // YYYY-MM-DDTHH:MM
}

export function isValidDateValue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime()) && dateObj.getTime() > 0;
  } catch {
    return false;
  }
}

export function generateDefaultBookingDates(): { start: DateTimeComponents; end: DateTimeComponents } {
  const now = new Date();
  const startDateTime = new Date(now.getTime() + (60 * 60 * 1000)); 
  const startDate = startDateTime.toISOString().split('T')[0];
  const startTime = startDateTime.toISOString().split('T')[1].substring(0, 5);
  const endDateTime = new Date(startDateTime.getTime() + (2 * 60 * 60 * 1000)); 
  const endDate = endDateTime.toISOString().split('T')[0];
  const endTime = endDateTime.toISOString().split('T')[1].substring(0, 5);

  return {
    start: { date: startDate, time: startTime, iso: `${startDate}T${startTime}` },
    end: { date: endDate, time: endTime, iso: `${endDate}T${endTime}` }
  };
}

export function parseUrlDateParams(startParam?: string | null, endParam?: string | null): {
  start: DateTimeComponents | null;
  end: DateTimeComponents | null;
} {
  const parseSingleParam = (param: string | null | undefined): DateTimeComponents | null => {
    if (!param || typeof param !== 'string') return null;
    try {
      const parts = param.split('T');
      if (parts.length === 1) {
        const date = parts[0];
        return { date, time: '09:00', iso: `${date}T09:00` } as DateTimeComponents;
      } else if (parts.length === 2) {
        const [date, time] = parts;
        return { date, time: time.length >= 5 ? time.substring(0, 5) : time, iso: `${date}T${time}` };
      }
    } catch (error) { return null; }
    return null;
  };
  return { start: parseSingleParam(startParam), end: parseSingleParam(endParam) };
}

export function formatDateForDisplay(date: Date | string | null): string {
  if (!date) return 'N/A';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';
    
    // Use UTC methods to avoid timezone conversion issues
    const day = dateObj.getUTCDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[dateObj.getUTCMonth()];
    const year = dateObj.getUTCFullYear();
    
    return `${day} ${month} ${year}`;
  } catch (error) {
    return 'N/A';
  }
}

export function formatTimeForDisplay(date: Date | string | null): string {
  if (!date) return '--:--';
  try {
    let dateObj: Date;
    if (typeof date === 'string' && date.match(/^\d{2}:\d{2}$/)) {
      const today = new Date().toISOString().split('T')[0];
      dateObj = new Date(`${today}T${date}:00`);
    } else {
      dateObj = new Date(date);
    }
    if (isNaN(dateObj.getTime())) return '--:--';
    return dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch (error) {
    return '--:--';
  }
}

export function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }
  return times;
}

export function getMinPickupDate(): string {
  const minDate = new Date();
  minDate.setHours(minDate.getHours() + 2);
  return minDate.toISOString().split('T')[0];
}