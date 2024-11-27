import { ClassValue, clsx } from 'clsx';
import moment from 'moment-timezone';
import mongoose from 'mongoose';
import { twMerge } from 'tailwind-merge';

export const cn = (...input: ClassValue[]) => twMerge(clsx(input));

export const fetchApi = async (
  url: string,
  options: {},
): Promise<{ data: any; ok: boolean }> => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { data: data, ok: response.ok };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const getQuery = (req: Request): { [key: string]: string } => {
  const url = new URL(req.url);
  const query = Object.fromEntries(url.searchParams.entries());
  return query;
};

export const copy = async (text: string) => {
  // confirm user if he wants to open the folder or not via confirm alert
  const confirmOpen = confirm('Do you want to copy this text to clipboard?');
  if (!confirmOpen) return;

  navigator.clipboard.writeText(text);
};

export const dbConnect = async (): Promise<void> => {
  try {
    if (mongoose.connections[0].readyState) {
      // console.log('Already connected.');
      return;
    }

    const connectionOptions: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      dbName: 'SCHL_PORTAL',
    };

    await mongoose.connect(process.env?.MONGODB_URI || '', connectionOptions);
    // console.log("Connected to Mongo Successfully!");
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

export function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function generatePassword(
  inputString: string,
  specifiedDigits?: number | string,
): string {
  // Ensure input string is trimmed and properly formatted
  const baseString = inputString.trim();

  // If no input string is provided, use a random English word from a predefined list
  const words = [
    'apple',
    'table',
    'piano',
    'river',
    'house',
    'stars',
    'plane',
    'green',
    'light',
    'cloud',
    'dream',
    'stone',
    'beach',
    'ocean',
    'mount',
    'space',
    'bird',
    'plane',
    'flower',
    'grape',
  ];

  const finalBaseString =
    baseString || words[Math.floor(Math.random() * words.length)];

  // Validate and process the specified digits
  const digits = specifiedDigits
    ? specifiedDigits.toString().slice(0, 4) // Convert to string and limit to 4 digits
    : Math.floor(100 + Math.random() * 900); // Generate random 3-digit number if not provided

  // Define a set of simple patterns for special characters
  const specialChars = ['!', '@', '#', '$', '%', '&', '*'];
  const randomChar =
    specialChars[Math.floor(Math.random() * specialChars.length)];

  // Create the password
  const password = `${finalBaseString.charAt(0).toUpperCase()}${finalBaseString.slice(1)}${randomChar}${digits}`;

  return password;
}

export const isEmployeePermanent = (
  joiningDate: string,
): {
  isPermanent: boolean;
  remainingTime?: number; // in days
  serviceTime?: number; // in days
} => {
  const joinDate = moment(joiningDate, 'YYYY-MM-DD');
  const probationEndDate = joinDate.clone().add(6, 'months');
  const today = moment();

  const isPermanent = today.isSameOrAfter(probationEndDate);

  // Calculate remaining time if not permanent
  if (!isPermanent) {
    const remainingDays = probationEndDate.diff(today, 'days');
    return {
      isPermanent: false,
      remainingTime: remainingDays, // Return raw days
    };
  }

  // Calculate job age/service time if permanent
  const serviceTime = today.diff(joinDate, 'days');
  return {
    isPermanent: true,
    serviceTime: serviceTime, // Return raw days
  };
};
