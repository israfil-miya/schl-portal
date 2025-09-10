import Order, { OrderDataType } from '@/models/Orders';
import { calculateTimeDifference } from '@/utility/date';

import { NextRequest, NextResponse } from 'next/server';

export const handleGetQCOrders = async (
  req: NextRequest,
): Promise<{
  data: string | OrderDataType[];
  status: number;
}> => {
  try {
    const orders = (await Order.aggregate([
      {
        $match: {
          status: { $nin: ['Finished', 'Correction'] },
          type: { $ne: 'Test' },
          $expr: { $eq: ['$production', '$quantity'] },
        },
      },
    ])) as OrderDataType[];

    if (orders) {
      const sortedOrders = orders
        .map(order => ({
          ...order,
          timeDifference: calculateTimeDifference(
            order.delivery_date,
            order.delivery_bd_time,
          ),
        }))
        .sort((a, b) => a.timeDifference - b.timeDifference);

      return { data: sortedOrders, status: 200 };
    } else {
      return { data: [], status: 200 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
