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

export { transparentize, hexToRgba };
