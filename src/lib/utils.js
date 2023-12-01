import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

 
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function ddMmYyyyToIsoDate(ddMmYyyy) {
  try {
    const parts = ddMmYyyy.split("-");
    if (parts.length !== 3) {
      throw new Error("Invalid date format: Incorrect number of parts");
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      throw new Error("Invalid date format: Parts are not numbers");
    }

    // Months are 0-based in JavaScript, so subtract 1 from the month
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0)); // Set time to midnight in UTC

    if (isNaN(date.getTime())) {
      throw new Error("Invalid date: Resulting date is NaN");
    }

    // Convert to ISODate format
    const isoDate = date.toISOString();
    // console.log(`Converted ${ddMmYyyy} to ISODate: ${isoDate}`);
    return isoDate;
  } catch (error) {
    console.error(`Error converting ${ddMmYyyy} to ISODate: ${error.message}`);
    throw error;
  }
}

export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
};

export function getCurrentAsiaDhakaTime() {
  const now = new Date();
  const asiaDhakaTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
  );
  return asiaDhakaTime;
}