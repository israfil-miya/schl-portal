const hexToRgba = (hex: string, opacity: number): string => {
  let r = 0,
    g = 0,
    b = 0;

  // If the hex code is in shorthand (3 digits), convert it to 6 digits
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Function to convert a color to a transparent version
const transparentize = (color: string, opacity: number = 0.7): string => {
  if (color.startsWith('#')) {
    return hexToRgba(color, opacity);
  } else if (color.startsWith('rgba')) {
    return color.replace(/[\d\.]+\)$/, `${opacity})`);
  } else if (color.startsWith('rgb')) {
    return color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
  }
  return color; // Return the color as-is if it doesn't match known formats
};

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

  Object.keys(data).forEach(monthName => {
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

export { generateBackgroundColors, hexToRgba, transparentize };
