import Order, { OrderDataType } from '@/models/Orders';
import { NextRequest, NextResponse } from 'next/server';

export const handleGetAllOrdersOfClient = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  try {
    const { client_code }: { client_code: string } = await req.json();

    const resData = await Order.find({ client_code });

    if (resData) {
      return { data: resData, status: 200 };
    } else {
      return { data: 'No orders found', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
