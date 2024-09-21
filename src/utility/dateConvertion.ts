export const YYYY_MM_DD_to_DD_MM_YY = (dateString: string) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (year.length != 4) return dateString;
  return `${day}-${month}-${year}`;
};

export const ISO_to_DD_MM_YY = (isoDate: string) => {
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear().toString();

  return `${day}-${month}-${year}`;
};
