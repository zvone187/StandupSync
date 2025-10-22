import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay, parseISO, isToday, isPast } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'EEEE, MMMM d, yyyy');
};

export const formatShortDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM d');
};

export const getWeekDays = (weekOffset: number = 0): Date[] => {
  const today = new Date();
  const targetWeek = weekOffset === 0 ? today : addWeeks(today, weekOffset);
  const start = startOfWeek(targetWeek, { weekStartsOn: 1 }); // Monday
  
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
};

export const getWeekRange = (weekOffset: number = 0): { start: Date; end: Date } => {
  const today = new Date();
  const targetWeek = weekOffset === 0 ? today : addWeeks(today, weekOffset);
  const start = startOfWeek(targetWeek, { weekStartsOn: 1 });
  const end = endOfWeek(targetWeek, { weekStartsOn: 1 });
  return { start, end };
};

export const isDateToday = (date: string | Date): boolean => {
  // Normalize both dates to YYYY-MM-DD format for comparison
  // This handles both ISO strings (2025-10-21T00:00:00.000Z) and simple dates (2025-10-21)
  let dateStr: string;
  if (typeof date === 'string') {
    dateStr = date.split('T')[0]; // Extract YYYY-MM-DD from ISO string
  } else {
    dateStr = format(date, 'yyyy-MM-dd');
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  return dateStr === todayStr;
};

export const isDatePast = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isPast(dateObj) && !isToday(dateObj);
};

export const canEditStandup = (date: string): boolean => {
  return isDateToday(date);
};

export const formatDateForAPI = (date: Date): string => {
  // Format date as YYYY-MM-DD using local date components
  // The backend will parse this as UTC midnight for that date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};