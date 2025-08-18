import Order, { OrderDataType } from '@/models/Orders';
import { NextRequest, NextResponse } from 'next/server';

export const handleCreateOrder = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  try {
    const orderData = await req.json();
    const resData = await Order.create(orderData);

    if (resData) {
      return { data: 'Added the order successfully', status: 200 };
    } else {
      return { data: 'Unable to add new order', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
