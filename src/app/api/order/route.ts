import { dbConnect, getQuery } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

dbConnect();

import { handleCreateOrder } from './handlers/createOrder';
import { handleDeleteOrder } from './handlers/deleteOrder';
import { handleFinishOrder } from './handlers/finishOrder';
import { handleGetAllOrders } from './handlers/getAllOrders';
import { handleGetAllOrdersOfClient } from './handlers/getAllOrdersOfClient';
import { handleGetOrdersByCountry } from './handlers/getOrdersByCountry';
import { handleGetOrdersById } from './handlers/getOrdersById';
import { handleGetOrdersByMonth } from './handlers/getOrdersByMonth';
import { handleGetOrdersCD } from './handlers/getOrdersCD';
import { handleGetOrdersQP } from './handlers/getOrdersQP';
import { handleGetQCOrders } from './handlers/getQCOrders';
import { handleGetRedoOrders } from './handlers/getRedoOrders';
import { handleGetUnfinishedOrders } from './handlers/getUnfinishedOrders';
import { handleEditOrder } from './handlers/newOrder';
import { handleRedoOrder } from './handlers/redoOrder';

export async function POST(req: NextRequest) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-all-orders':
      res = await handleGetAllOrders(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-client-orders':
      res = await handleGetAllOrdersOfClient(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'create-order':
      res = await handleCreateOrder(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'delete-order':
      res = await handleDeleteOrder(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'finish-order':
      res = await handleFinishOrder(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'redo-order':
      res = await handleRedoOrder(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'edit-order':
      res = await handleEditOrder(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-orders-by-month':
      res = await handleGetOrdersByMonth(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-unfinished-orders':
      res = await handleGetUnfinishedOrders(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-qc-orders':
      res = await handleGetQCOrders(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-redo-orders':
      res = await handleGetRedoOrders(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-order-by-id':
      res = await handleGetOrdersById(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-orders-qp':
      res = await handleGetOrdersQP(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-orders-cd':
      res = await handleGetOrdersCD(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-orders-by-country':
      res = await handleGetOrdersByCountry(req);
      return NextResponse.json(res.data, { status: res.status });

    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
