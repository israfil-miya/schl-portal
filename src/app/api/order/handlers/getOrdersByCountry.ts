import Client from '@/models/Clients';
import Order, { OrderDataType } from '@/models/Orders';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { countriesList } from '../constants';

export interface OrderDetails {
  details: (OrderDataType & { country: string })[];
  totalFiles: number;
}

export const handleGetOrdersByCountry = async (
  req: NextRequest,
): Promise<{
  data: string | OrderDetails;
  status: number;
}> => {
  try {
    const headersList = await headers();
    const fromDate = headersList.get('from_date');
    const toDate = headersList.get('to_date');
    const country = headersList.get('country');

    if (!country) throw new Error('Country must be provided');

    // let query: any = { type: { $ne: 'Test' } };
    let query: any = {};

    if (fromDate || toDate) {
      query.download_date = {
        ...(fromDate && { $gte: fromDate }),
        ...(toDate && { $lte: toDate }),
      };
    }

    if (!fromDate && !toDate) {
      delete query.download_date;
    }

    const countryFilter =
      country === 'Others' ? { $nin: countriesList } : country;
    const clientsAll = await Client.find(
      { country: countryFilter },
      { client_code: 1, country: 1 },
    ).lean();

    const returnData: any = { details: [], totalFiles: 0 };
    await Promise.all(
      clientsAll.map(async clientData => {
        const orders = await Order.find({
          ...query,
          client_code: clientData.client_code,
        }).lean();
        orders.forEach(order => {
          returnData.details.push({ ...order, country: clientData.country });
          returnData.totalFiles += order.quantity;
        });
      }),
    );

    return { data: returnData, status: 200 };
  } catch (error) {
    console.error(error);
    return { data: 'An error occurred', status: 500 };
  }
};
