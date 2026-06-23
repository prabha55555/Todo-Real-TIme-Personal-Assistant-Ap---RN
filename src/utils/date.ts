import { TaskRecurrence } from '../types';

export const getLocalDateString = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
};

export const addMonths = (dateStr: string, months: number): string => {
  const date = new Date(dateStr + 'T00:00:00');
  date.setMonth(date.getMonth() + months);
  return getLocalDateString(date);
};

export const getNextOccurrenceDate = (dateStr: string, recurrence: TaskRecurrence): string => {
  switch (recurrence) {
    case 'Daily':
      return addDays(dateStr, 1);
    case 'Weekly':
      return addDays(dateStr, 7);
    case 'Monthly':
      return addMonths(dateStr, 1);
    default:
      return dateStr;
  }
};

export const isDateToday = (dateStr: string): boolean => {
  return dateStr === getLocalDateString();
};

export const isDateTomorrow = (dateStr: string): boolean => {
  return dateStr === addDays(getLocalDateString(), 1);
};

export const isDateThisWeek = (dateStr: string): boolean => {
  const today = new Date(getLocalDateString() + 'T00:00:00');
  const taskDate = new Date(dateStr + 'T00:00:00');
  
  // Find start of current week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Find end of current week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return taskDate >= startOfWeek && taskDate <= endOfWeek;
};

export const formatDisplayDate = (dateStr: string): string => {
  if (isDateToday(dateStr)) return 'Today';
  if (isDateTomorrow(dateStr)) return 'Tomorrow';
  
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDisplayTime = (timeStr: string): string => {
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutesStr} ${ampm}`;
};

export const parseDateTime = (dateStr: string, timeStr: string): Date => {
  return new Date(`${dateStr}T${timeStr}:00`);
};
