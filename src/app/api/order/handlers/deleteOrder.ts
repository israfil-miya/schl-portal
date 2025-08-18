import Order, { OrderDataType } from '@/models/Orders';
import { NextRequest, NextResponse } from 'next/server';

export const handleDeleteOrder = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  try {
    const { order_id }: { order_id: string } = await req.json();
    const resData = await Order.findByIdAndDelete(order_id);
    if (resData) {
      return { data: 'Deleted the order successfully', status: 200 };
    } else {
      return { data: 'Unable to delete the order', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
