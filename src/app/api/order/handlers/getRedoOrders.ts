import Order, { OrderDataType } from '@/models/Orders';
import { calculateTimeDifference } from '@/utility/date';
import { NextRequest, NextResponse } from 'next/server';

export const handleGetRedoOrders = async (
  req: NextRequest,
): Promise<{
  data: string | (OrderDataType & { timeDifference: number })[];
  status: number;
}> => {
  try {
    const orders: any[] = await Order.find({
      $or: [{ type: 'Test' }, { status: 'Correction' }],
      status: { $ne: 'Finished' },
    }).lean();

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
