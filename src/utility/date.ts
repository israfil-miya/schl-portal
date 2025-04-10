import moment from 'moment-timezone';

export const getTodayDate = () => moment().format('YYYY-MM-DD');

export const getTodayDate_DD_MM_YYYY = () => {
  return moment().format('DD-MM-YYYY');
};

export const formatTime = (time24: string) => {
  if (!time24) return '';
  return moment(time24, 'HH:mm').format('hh:mm A');
};

export const formatDate = (dateString: string | Date) => {
  if (!dateString) return '';

  return moment(dateString).format("Do MMM. 'YY");
};

export function formatTimestamp(timestamp: string) {
  const formattedDate = moment(timestamp);

  return {
    date: formattedDate.format('DD-MM-YYYY') || '',
    time: formattedDate.format('HH:mm') || '',
  };
}

export const toISODate = (
  dateStr: string,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
): Date | null => {
  if (!dateStr) {
    return moment().startOf('day').toDate(); // Default to start of today
  }

  const isoDate = moment.utc(dateStr);

  if (!isoDate.isValid()) {
    return null; // Return null if the date is invalid
  }

  return isoDate
    .set({
      hour: hours,
      minute: minutes,
      second: seconds,
      millisecond: milliseconds,
    })
    .toDate();
};

export const calculateTimeDifference = (
  deliveryDate: string,
  deliveryTime: string,
): number => {
  const deliveryDateTime = moment.tz(
    `${deliveryDate} ${deliveryTime}`,
    'YYYY-MM-DD HH:mm',
    'Asia/Dhaka',
  );
  const asiaDhakaTime = moment.tz('Asia/Dhaka');
  return deliveryDateTime.diff(asiaDhakaTime);
};

// used to generate graph data for date range
export function getDatesInRange(fromTime: string, toTime: string): string[] {
  const dates: string[] = [];
  let currentDate = moment(fromTime);
  const endDate = moment(toTime).endOf('day');

  while (currentDate.isSameOrBefore(endDate)) {
    dates.push(currentDate.format('YYYY-MM-DD'));
    currentDate.add(1, 'day');
  }

  return dates;
}

export function getDateRange(daysAgo: number): { from: string; to: string } {
  const to = moment();
  const from = moment().subtract(daysAgo, 'days');

  return {
    from: from.format('YYYY-MM-DD'),
    to: to.format('YYYY-MM-DD'),
  };
}

export const getLast12Months = () => {
  const result: { monthAndYear: string }[] = [];
  const today = moment();
  for (let i = 0; i < 12; i++) {
    result.push({
      monthAndYear: today.format('YYYY-MM'), // Format as "YYYY-MM"
    });
    today.subtract(1, 'months');
  }
  return result.reverse(); // Reverse to start from oldest to newest
};

export function getMonthRange(monthAndYear: string): {
  start: string;
  end: string;
} {
  const [monthName, year] = monthAndYear.split(' ');
  const monthNumber = moment().month(monthName).format('MM');
  const startDate = moment
    .tz(`${year}-${monthNumber}-01`, 'Asia/Dhaka')
    .startOf('month')
    .format('YYYY-MM-DD');
  const endDate = moment
    .tz(`${year}-${monthNumber}-01`, 'Asia/Dhaka')
    .endOf('month')
    .format('YYYY-MM-DD');
  return { start: startDate, end: endDate };
}

export const getDaysSince = (date: Date | string): number => {
  const currentDate = moment();
  const inputDate = moment(date);
  return currentDate.diff(inputDate, 'days');
};
