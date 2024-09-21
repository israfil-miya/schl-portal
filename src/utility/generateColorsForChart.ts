// Function to get year from the month name
const getYear = (monthName: string) => parseInt(monthName.split('_')[1]);

// Function to generate background colors and border colors based on year
const generateBackgroundColors = (
  data: { [key: string]: number },
  evenYearBgColor: string,
  oddYearBgColor: string,
  evenYearBorderColor: string,
  oddYearBorderColor: string,
): { bgColors: string[]; borderColors: string[] } => {
  const bgColors: string[] = [];
  const borderColors: string[] = [];

  Object.keys(data).forEach((monthName) => {
    const year = getYear(monthName);
    if (year % 2 === 0) {
      bgColors.push(evenYearBgColor);
      borderColors.push(evenYearBorderColor);
    } else {
      bgColors.push(oddYearBgColor);
      borderColors.push(oddYearBorderColor);
    }
  });

  return { bgColors, borderColors };
};

export default generateBackgroundColors;
