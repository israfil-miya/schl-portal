import { ClassValue, clsx } from 'clsx';
import mongoose from 'mongoose';
import { twMerge } from 'tailwind-merge';
interface RawFormData {
  [key: string]: string | boolean | number | ''; // Include empty string as a possible type
}

export const cn = (...input: ClassValue[]) => twMerge(clsx(input));

export function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const copy = async (text: string) => {
  // confirm user if he wants to open the folder or not via confirm alert
  const confirmOpen = confirm('Do you want to copy this text to clipboard?');
  if (!confirmOpen) return;

  navigator.clipboard.writeText(text);
};

export const retrieveFormData = (formData: FormData): RawFormData => {
  const rawFormData: RawFormData = {};

  formData.forEach((value, key) => {
    if (!key.startsWith('$')) {
      // Exclude keys starting with $
      if (value === 'on') {
        // Replace "on" with true
        rawFormData[key] = true;
      } else if (value !== '') {
        // Convert numeric strings to numbers if not empty
        rawFormData[key] = isNaN(Number(value))
          ? value.toString()
          : Number(value);
      } else {
        rawFormData[key] = ''; // Keep empty strings as empty strings
      }
    }
  });

  return rawFormData;
};

export const getQuery = (req: Request): { [key: string]: string } => {
  const url = new URL(req.url);
  const query = Object.fromEntries(url.searchParams.entries());
  return query;
};

export const fetchApi = async (
  url: string,
  options: {},
): Promise<{ data: string | Object; ok: boolean }> => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { data: data, ok: response.ok };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
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
