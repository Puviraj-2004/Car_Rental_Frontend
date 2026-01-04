/**
 * Time utility functions for handling UTC dates and local time conversions
 */

/**
 * Convert UTC ISO string to user's local time for display
 * @param utcISOString - UTC timestamp string from backend (ISO format)
 * @returns Formatted local time string
 */
export function formatUtcToLocalTime(utcISOString: string): string {
  try {
    const utcDate = new Date(utcISOString);

    // Convert UTC to local time
    const localDate = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));

    // Format as HH:MM (24-hour format)
    const hours = localDate.getHours().toString().padStart(2, '0');
    const minutes = localDate.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting UTC time:', error);
    return 'Invalid time';
  }
}

/**
 * Get a human-readable expiration message in user's local time
 * @param utcISOString - UTC expiration timestamp
 * @returns Human-readable message like "Expires at 14:30"
 */
export function getExpirationMessage(utcISOString: string): string {
  const localTime = formatUtcToLocalTime(utcISOString);
  return `Expires at ${localTime}`;
}

/**
 * Calculate remaining time in minutes until expiration
 * @param utcISOString - UTC expiration timestamp
 * @returns Remaining minutes (negative if expired)
 */
export function getRemainingMinutes(utcISOString: string): number {
  try {
    const expirationTime = new Date(utcISOString).getTime();
    const currentTime = new Date().getTime();
    const diffMs = expirationTime - currentTime;
    return Math.floor(diffMs / (1000 * 60)); // Convert to minutes
  } catch (error) {
    console.error('Error calculating remaining minutes:', error);
    return 0;
  }
}

/**
 * Check if a UTC timestamp has expired
 * @param utcISOString - UTC timestamp to check
 * @returns True if expired, false otherwise
 */
export function isExpired(utcISOString: string): boolean {
  return getRemainingMinutes(utcISOString) <= 0;
}

/**
 * Format remaining time as human-readable string
 * @param minutes - Remaining minutes
 * @returns Formatted string like "2 hours 30 minutes" or "Expired"
 */
export function formatRemainingTime(minutes: number): string {
  if (minutes <= 0) {
    return 'Expired';
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  } else {
    return `${mins}m`;
  }
}

