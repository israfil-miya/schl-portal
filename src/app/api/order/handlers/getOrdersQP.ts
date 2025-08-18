import Order from '@/models/Orders';
import { getDatesInRange } from '@/utility/date';

import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export interface OrderData {
  date: string;
  orderQuantity: number;
  orderPending: number;
  fileQuantity: number;
  filePending: number;
}

// QP = Quantity and Pending
export const handleGetOrdersQP = async (
  req: NextRequest,
): Promise<{
  data: string | OrderData[];
  status: number;
}> => {
  try {
    const headersList = await headers();
    const fromDate = headersList.get('from_date');
    const toDate = headersList.get('to_date');

    // let query: any = { type: { $ne: 'Test' } };
    let query: any = {};

    if (fromDate || toDate) {
      query.download_date = {
        ...(fromDate && { $gte: fromDate }),
        ...(toDate && { $lte: toDate }),
      };
    }

    const orders = await Order.find(query);

    // Generate complete range of dates using the utility function
    const dateRange: string[] = getDatesInRange(
      fromDate || new Date().toISOString(),
      toDate || new Date().toISOString(),
    );

    // Initialize mergedOrders with zero values
    const mergedOrders: Record<string, OrderData> = {};
    dateRange.forEach(date => {
      // const [year, month, day] = date.split('-');
      // const formattedDate = `${monthNames[parseInt(month) - 1]} ${day}`;
      // console.log(`Year: ${year}, Month: ${month}, Day: ${day}`, formattedDate);

      mergedOrders[date] = {
        date: date,
        orderQuantity: 0,
        orderPending: 0,
        fileQuantity: 0,
        filePending: 0,
      };
    });

    // Update mergedOrders with actual data
    orders.forEach((order: any) => {
      // const date = order.createdAt.toISOString().split('T')[0]; // "YYYY-MM-DD"
      const date = order.download_date;
      // const [year, month, day] = date.split('-');
      // const formattedDate = `${monthNames[parseInt(month) - 1]} ${day}`;

      if (!mergedOrders[date]) {
        return;
      }

      mergedOrders[date].fileQuantity += order.quantity;
      mergedOrders[date].orderQuantity++;
      if (order.status !== 'Finished') {
        mergedOrders[date].filePending += order.quantity;
        mergedOrders[date].orderPending++;
      }
    });

    const ordersQP: OrderData[] = Object.values(mergedOrders);
    return { data: ordersQP, status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
