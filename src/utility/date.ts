import moment from 'moment-timezone';

export const YYYY_MM_DD_to_DD_MM_YY = (dateString: string): string => {
  if (!dateString) return '';
  return moment(dateString, 'YYYY-MM-DD').format('DD-MM-YYYY');
};

export const ISO_to_DD_MM_YY = (isoDate: string): string => {
  return moment(isoDate).format('DD-MM-YYYY');
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

export const getTodayDate = (): string => {
  return moment().format('YYYY-MM-DD');
};

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

export const getTodayDate_DD_MM_YYYY = (): string => {
  return moment().format('DD-MM-YYYY');
};
