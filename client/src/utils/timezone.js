// client/src/utils/timezone.js
// Timezone utility for consistent date/time formatting across the app

const APP_TIMEZONE = 'Africa/Harare'; // GMT+2

/**
 * Format a date/time string to the app's timezone
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDateTime = (date, options = {}) => {
  if (!date) return 'N/A';
  
  const defaultOptions = {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Use 24-hour format
    ...options,
  };

  try {
    return new Intl.DateTimeFormat('en-ZA', defaultOptions).format(new Date(date));
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date only (no time)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
export const formatDate = (date) => {
  return formatDateTime(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: undefined,
    minute: undefined,
    second: undefined,
  });
};

/**
 * Format time only (no date)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted time string (HH:MM:SS)
 */
export const formatTime = (date) => {
  return formatDateTime(date, {
    year: undefined,
    month: undefined,
    day: undefined,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Format time in 12-hour format with AM/PM
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted time string (hh:mm AM/PM)
 */
export const formatTime12Hour = (date) => {
  return formatDateTime(date, {
    year: undefined,
    month: undefined,
    day: undefined,
    hour: '2-digit',
    minute: '2-digit',
    second: undefined,
    hour12: true,
  });
};

/**
 * Get current date/time in app timezone
 * @returns {Date} Current date/time
 */
export const getCurrentDateTime = () => {
  return new Date();
};

/**
 * Get current date in YYYY-MM-DD format for input[type="date"]
 * @returns {string} Current date string
 */
export const getCurrentDate = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  
  return `${year}-${month}-${day}`;
};

/**
 * Convert ISO string to local datetime-local format for input
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted for datetime-local input (YYYY-MM-DDTHH:MM)
 */
export const toDateTimeLocal = (isoString) => {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  const hour = parts.find(p => p.type === 'hour').value;
  const minute = parts.find(p => p.type === 'minute').value;
  
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

/**
 * Format relative time (e.g., "2 hours ago", "just now")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
};

/**
 * Get timezone offset string (e.g., "GMT+2")
 * @returns {string} Timezone offset
 */
export const getTimezoneOffset = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    timeZoneName: 'longOffset',
  });
  
  const parts = formatter.formatToParts(now);
  const timeZoneName = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+2';
  
  return timeZoneName;
};

/**
 * Get timezone name (e.g., "Africa/Harare")
 * @returns {string} Timezone name
 */
export const getTimezoneName = () => {
  return APP_TIMEZONE;
};

export default {
  formatDateTime,
  formatDate,
  formatTime,
  formatTime12Hour,
  getCurrentDateTime,
  getCurrentDate,
  toDateTimeLocal,
  formatRelativeTime,
  getTimezoneOffset,
  getTimezoneName,
};