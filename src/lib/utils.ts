import { ClassValue, clsx } from 'clsx';
import jwt from 'jsonwebtoken';
import moment from 'moment-timezone';
import mongoose from 'mongoose';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { NextRequest } from 'next/server';
import { Readable } from 'stream';
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

export const getQuery = (req: NextRequest): { [key: string]: string } => {
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

export function rethrowIfRedirectError(error: unknown) {
  if (isRedirectError(error)) {
    throw error;
  }
}

export async function sha256(message: string): Promise<string> {
  // Encode the message as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // Hash the message using SHA-256 algorithm
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // Convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // Convert bytes to a hexadecimal string
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export const generateAvatar = async (text: string): Promise<string> => {
  const value = await sha256(text?.trim().toLowerCase() || 'johndoe@schl.com'); // Default to 'johndoe@schl.com' if value (expected to be a email or username) is missing.

  const avatar = `https://gravatar.com/avatar/${value}/?s=400&d=identicon&r=x`; // Set image size, default avatar, and rating restrictions.

  return avatar;
};

export const verifyCookie = async (
  cookieStore: ReadonlyRequestCookies,
  id: string,
) => {
  try {
    const verifyToken = cookieStore.get('verify-token.tmp')?.value;

    if (!verifyToken) {
      return false;
    }

    const token = verifyToken;

    const decoded = jwt.verify(token, process.env.AUTH_SECRET as string) as {
      userId: string;
      exp: number;
    };

    const userIdFromToken = decoded.userId;
    const sessionUserId = id;

    if (userIdFromToken !== sessionUserId || Date.now() >= decoded.exp * 1000) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

export function nodeStreamToWebStream(
  stream: NodeJS.ReadableStream,
): ReadableStream<any> {
  return new ReadableStream({
    start(controller) {
      stream.on('data', chunk => {
        controller.enqueue(chunk);
      });
      stream.on('end', () => {
        controller.close();
      });
      stream.on('error', err => {
        controller.error(err);
      });
    },
    cancel() {
      if (typeof (stream as Readable).destroy === 'function') {
        (stream as Readable).destroy();
      } else {
        stream.unpipe();
        stream.pause();
      }
    },
  });
}
