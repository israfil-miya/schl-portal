import Client from '@/models/Clients';
import Order from '@/models/Orders';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { countriesList } from '../route';

interface CountryOrderData {
  date: string;
  orderQuantity: number;
  fileQuantity: number;
}

// CD = Country Data
export const handleGetOrdersCD = async (
  req: NextRequest,
): Promise<{
  data: string | Record<string, CountryOrderData[]>;
  status: number;
}> => {
  try {
    const headersList = await headers();
    const fromDate = headersList.get('from_date') as string;
    const toDate = headersList.get('to_date') as string;
    const query: any = {};

    if (fromDate || toDate) {
      query.download_date = {
        ...(fromDate && { $gte: fromDate }),
        ...(toDate && { $lte: toDate }),
      };
    }

    // Retrieve clients and initialize country mapping
    const clientsAll = await Client.find({}, { client_code: 1, country: 1 });
    const clientCodeCountryMap = clientsAll.reduce(
      (map, client) => {
        map[client.client_code] = client.country || 'Others';
        return map;
      },
      {} as Record<string, string>,
    );

    const ordersDetails: Record<string, any[]> = {
      ...countriesList.reduce(
        (acc, country) => ({ ...acc, [country]: [] }),
        {},
      ),
      Others: [],
    };

    // Retrieve all orders
    const ordersAll = await Order.find(query, {
      client_code: 1,
      download_date: 1,
      quantity: 1,
    });

    // Map orders to their respective countries
    ordersAll.forEach(order => {
      const clientCountry = clientCodeCountryMap[order.client_code] || 'Others';
      const country = ordersDetails[clientCountry] ? clientCountry : 'Others';
      ordersDetails[country] = [...(ordersDetails[country] || []), order];
    });

    // Generate date range
    const dateRange: string[] = [];
    if (fromDate && toDate) {
      let currentDate = new Date(fromDate);
      const endDate = new Date(toDate);

      while (currentDate <= endDate) {
        dateRange.push(currentDate.toISOString().split('T')[0]); // "YYYY-MM-DD"
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Process and format data for each country
    const ordersCD: Record<string, CountryOrderData[]> = {};
    Object.entries(ordersDetails).forEach(([country, ordersArr]) => {
      const sortedDates = ordersArr.reduce<Record<string, CountryOrderData>>(
        (merged, order) => {
          // const date = order.createdAt.toISOString().split('T')[0]; // "YYYY-MM-DD"
          const date = order.download_date; // "YYYY-MM-DD"

          if (!merged[date]) {
            merged[date] = {
              date,
              orderQuantity: 0,
              fileQuantity: 0,
            };
          }
          merged[date].fileQuantity += order.quantity;
          merged[date].orderQuantity++;

          return merged;
        },
        {},
      );

      // Ensure every date in the range is represented
      const fullDateData: Record<string, CountryOrderData> = {};
      dateRange.forEach(date => {
        fullDateData[date] = sortedDates[date] || {
          date,
          orderQuantity: 0,
          fileQuantity: 0,
        };
      });

      // Assign data for the country
      ordersCD[country] = Object.values(fullDateData).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    });

    return { data: ordersCD, status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
