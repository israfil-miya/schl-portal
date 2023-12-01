import { headers } from "next/headers";
import {formatDate, getCurrentAsiaDhakaTime} from "@/lib/utils"

export function calculateTimeDifference(deliveryDate, deliveryTime) {
  const is12HourFormat = /am|pm/i.test(deliveryTime);
  const [time, meridiem] = deliveryTime.split(/\s+/);
  const [hours, minutes] = time.split(":").map(Number);

  let adjustedHours = hours;
  if (is12HourFormat) {
    if (meridiem.toLowerCase() === "pm" && hours !== 12) {
      adjustedHours = hours + 12;
    }
    if (meridiem.toLowerCase() === "am" && hours === 12) {
      adjustedHours = 0;
    }
  }

  const asiaDhakaTime = getCurrentAsiaDhakaTime();

  // Convert deliveryDate to a valid JavaScript Date object
  const [day, month, year] = deliveryDate.split("-").map(Number);
  const deliveryDateTime = new Date(
    year,
    month - 1,
    day,
    adjustedHours,
    minutes,
    0,
    0
  );

  const timeDifferenceMs = deliveryDateTime - asiaDhakaTime;

  return timeDifferenceMs;
}

export function getDatesInRange(fromTime, toTime) {
  const dates = [];
  let currentDate = new Date(ddMmYyyyToIsoDate(fromTime));
  const endDate = new Date(ddMmYyyyToIsoDate(toTime));

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    dates.push(formattedDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

export function getDateRange() {
  const today = new Date();
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(today.getDate() - 14);
  return {
    from: formatDate(fourteenDaysAgo),
    to: formatDate(today),
  };
}

export function accessHeaders(req, headerNames) {
    const headersList = headers(req);

    const headerValues = {};
    headerNames.forEach((name) => {
        headerValues[name] = headersList.get(name);
    });

    return headerValues;
}

export function prepareResponse(status, data) {
    if (typeof data == "object") return { status, message: JSON.stringify(data) }
    else return { status, message: data }
}
