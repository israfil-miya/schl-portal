import Order, { OrderDataType } from '@/models/Orders';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const handleGetOrdersById = async (
  req: NextRequest,
): Promise<{
  data: string | OrderDataType;
  status: number;
}> => {
  try {
    const headersList = await headers();
    let id = headersList.get('id');
    const orders = (await Order.findById(id)) as OrderDataType;
    if (orders) {
      return { data: orders, status: 200 };
    } else {
      return { data: 'No order found', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
