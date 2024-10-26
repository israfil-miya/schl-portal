import Client from '@/models/Clients';
import Invoice from '@/models/Invoices';
import Order, { OrderDataType } from '@/models/Orders';
import {
  calculateTimeDifference,
  getDateRange,
  getDatesInRange,
  getLast12Months,
  getMonthRange,
} from '@/utility/date';
import {
  addIfDefined,
  addRegexField,
  createRegexQuery,
} from '@/utility/filterHelpers';
import getQuery from '@/utility/getApiQuery';
import moment from 'moment-timezone';
import mongoose from 'mongoose';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export interface RegexQuery {
  $regex: string;
  $options: string;
}

export interface Query {
  type?: RegexQuery;
  task?: RegexQuery;
  folder?: RegexQuery;
  client_code?: RegexQuery;
  createdAt?: { $gte?: string; $lte?: string };
  $or?: { [key: string]: RegexQuery }[];
}

export type RegexFields = Extract<
  keyof Query,
  'type' | 'task' | 'folder' | 'client_code'
>;

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const countriesList = ['Australia', 'Denmark', 'Finland', 'Norway', 'Sweden'];

interface OrderData {
  date: string;
  orderQuantity: number;
  orderPending: number;
  fileQuantity: number;
  filePending: number;
}
interface CountryOrderData {
  date: string;
  orderQuantity: number;
  fileQuantity: number;
  isoDate?: Date;
}
interface StatusOrderData {
  date: string;
  orderQuantity: number;
  orderPending: number;
  fileQuantity: number;
  filePending: number;
  isoDate?: Date;
}

interface OrderDetails {
  details: (OrderDataType & { country: string })[];
  totalFiles: number;
}

interface ClientOrdersByMonth {
  client_code: string;
  orders: {
    [monthYear: string]: {
      count: number;
      totalFiles: number;
      invoiced: boolean;
    };
  }[];
}

interface PaginatedData<ItemsType> {
  pagination: { count: number; pageCount: number };
  items: ItemsType;
}

async function handleGetUnfinishedOrders(req: Request): Promise<{
  data: string | OrderDataType[];
  status: number;
}> {
  try {
    const orders = await Order.find({
      status: { $nin: ['Finished', 'Correction'] },
      type: { $ne: 'Test' },
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
}

async function handleGetRedoOrders(req: Request): Promise<{
  data: string | OrderDataType[];
  status: number;
}> {
  try {
    const orders = await Order.find({
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
}

async function handleGetAllOrders(req: Request): Promise<{
  data: string | PaginatedData<OrderDataType[]>;
  status: number;
}> {
  try {
    const page: number = Number(headers().get('page')) || 1;
    const ITEMS_PER_PAGE: number =
      Number(headers().get('items_per_page')) || 30;
    const isFilter: boolean = headers().get('filtered') === 'true';
    const paginated: boolean = headers().get('paginated') === 'true';

    const filters = await req.json();

    const {
      folder,
      clientCode,
      task,
      type,
      fromDate,
      toDate,
      generalSearchString,
    } = filters;

    let query: Query = {};

    if (fromDate || toDate) {
      query.createdAt = {};
      query.createdAt = {
        ...(fromDate && { $gte: fromDate }),
        ...(toDate && { $lte: toDate }),
      };
    }

    if (!fromDate && !toDate) {
      delete query.createdAt;
    }

    addRegexField(query, 'folder', folder);
    addRegexField(query, 'client_code', clientCode);
    addRegexField(query, 'task', task);
    addRegexField(query, 'type', type, true);

    console.log(query);

    const searchQuery: Query = { ...query };

    let sortQuery: Record<string, 1 | -1> = {
      customSortField: 1,
      createdAt: -1,
    };

    if (!query && isFilter == true && !generalSearchString) {
      return { data: 'No filter applied', status: 400 };
    } else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      if (generalSearchString) {
        searchQuery['$or'] = [
          { client_code: createRegexQuery(generalSearchString)! },
          { client_name: createRegexQuery(generalSearchString)! },
          { folder: createRegexQuery(generalSearchString)! },
          { task: createRegexQuery(generalSearchString)! },
          { folder_path: createRegexQuery(generalSearchString)! },
        ];
      }

      const count: number = await Order.countDocuments(searchQuery);
      let orders: OrderDataType[];

      if (paginated) {
        orders = (await Order.aggregate([
          { $match: query },
          {
            $addFields: {
              customSortField: {
                $cond: {
                  if: {
                    $or: [
                      {
                        $and: [
                          { $eq: ['$status', 'Correction'] },
                          { $ne: ['$status', 'Finished'] },
                        ],
                      },
                      {
                        $and: [
                          { $eq: ['$type', 'Test'] },
                          { $ne: ['$status', 'Finished'] },
                        ],
                      },
                    ],
                  },
                  then: 0,
                  else: {
                    $cond: {
                      if: { $ne: ['$status', 'Finished'] },
                      then: 1,
                      else: {
                        $cond: {
                          if: {
                            $and: [
                              { $eq: ['$status', 'Finished'] },
                              { $eq: ['$type', 'Test'] },
                            ],
                          },
                          then: 2,
                          else: 3,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          { $sort: sortQuery },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
        ])) as OrderDataType[];
      } else {
        orders = await Order.find(searchQuery).lean().sort({ createdAt: -1 });
      }

      console.log('SEARCH Query:', searchQuery);

      const pageCount: number = Math.ceil(count / ITEMS_PER_PAGE);

      if (!orders) {
        return { data: 'Unable to retrieve orders', status: 400 };
      } else {
        let ordersData = {
          pagination: {
            count,
            pageCount,
          },
          items: orders,
        };

        return { data: ordersData, status: 200 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetOrdersById(req: Request): Promise<{
  data: string | OrderDataType;
  status: number;
}> {
  try {
    let _id = headers().get('_id');
    const orders = await Order.findById(_id).lean();
    if (orders) {
      return { data: orders, status: 200 };
    } else {
      return { data: 'No order found', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleEditOrder(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    let data = await req.json();
    const updatedBy = headers().get('updated_by');

    const resData = await Order.findByIdAndUpdate(
      data?._id,
      {
        ...data,
        updated_by: updatedBy,
      },
      {
        new: true,
        upsert: true,
      },
    );

    if (resData) {
      return { data: 'Updated the order successfully', status: 200 };
    } else {
      return { data: 'Unable to update the order', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleCreateOrder(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const orderData = req.json();
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
}

async function handleDeleteOrder(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
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
}

async function handleFinishOrder(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const { order_id }: { order_id: string } = await req.json();
    const resData = await Order.findByIdAndUpdate(
      order_id,
      { status: 'Finished' },
      {
        new: true,
      },
    );
    if (resData) {
      return {
        data: 'Changed the status of the order successfully',
        status: 200,
      };
    } else {
      return { data: 'Unable to change the status of the order', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleRedoOrder(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const { order_id }: { order_id: string } = await req.json();

    const resData = await Order.findByIdAndUpdate(
      order_id,
      { status: 'Correction' },
      {
        new: true,
      },
    );

    if (resData) {
      return {
        data: 'Changed the status of the order successfully',
        status: 200,
      };
    } else {
      return { data: 'Unable to change the status of the order', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetAllOrdersOfClient(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const { client_code }: { client_code: string } = await req.json();

    const resData = await Order.find({ client_code });

    if (resData) {
      return { data: resData, status: 400 };
    } else {
      return { data: 'No orders found', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

// QP = Quantity and Pending
async function handleGetOrdersQP(req: Request): Promise<{
  data: string | OrderData[];
  status: number;
}> {
  try {
    const fromDate = headers().get('from_date');
    const toDate = headers().get('to_date');

    let query: any = { type: { $ne: 'Test' } };

    if (fromDate || toDate) {
      query.createdAt = {};
      query.createdAt = {
        ...(fromDate && { $gte: fromDate }),
        ...(toDate && { $lte: toDate }),
      };
    }

    if (!fromDate && !toDate) {
      delete query.createdAt;
    }

    const orders = await Order.find(query);
    const mergedOrders = orders.reduce(
      (merged: Record<string, OrderData>, order: any) => {
        const date = order.createdAt.toISOString().split('T')[0];
        const [year, month, day] = date.split('-');
        const formattedDate = `${monthNames[parseInt(month) - 1]} ${day}`;

        if (!merged[formattedDate]) {
          merged[formattedDate] = {
            date: formattedDate,
            orderQuantity: 0,
            orderPending: 0,
            fileQuantity: 0,
            filePending: 0,
          };
        }

        merged[formattedDate].fileQuantity += order.quantity;
        merged[formattedDate].orderQuantity++;
        if (order.status !== 'Finished') {
          merged[formattedDate].filePending += order.quantity;
          merged[formattedDate].orderPending++;
        }

        return merged;
      },
      {},
    );

    const ordersQP: OrderData[] = Object.values(mergedOrders);
    return { data: ordersQP, status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

// CD = Country Data
async function handleGetOrdersCD(req: Request): Promise<{
  data: string | Record<string, CountryOrderData[]>;
  status: number;
}> {
  try {
    const fromDate = headers().get('from_date') as string;
    const toDate = headers().get('to_date') as string;
    const query: any = { type: { $ne: 'Test' } };

    if (fromDate || toDate) {
      query.createdAt = {};
      query.createdAt = {
        ...(fromDate && { $gte: fromDate }),
        ...(toDate && { $lte: toDate }),
      };
    }

    if (!fromDate && !toDate) {
      delete query.createdAt;
    }

    // Retrieve clients and initialize country mapping
    const clientsAll = await Client.find({}, { client_code: 1, country: 1 });
    const ordersDetails: Record<string, any[]> = {
      ...countriesList.reduce(
        (acc, country) => ({ ...acc, [country]: [] }),
        {},
      ),
      Others: [],
    };

    // Collect all orders for each client
    const orderPromises = clientsAll.map(client =>
      Order.find(
        { ...query, client_code: client.client_code },
        { createdAt: 1, quantity: 1 },
      ),
    );
    const ordersAll = await Promise.all(orderPromises);

    // Map orders to their respective countries
    ordersAll.forEach((clientOrders, index) => {
      const clientCountry = clientsAll[index].country || 'Others';
      const country = ordersDetails[clientCountry] ? clientCountry : 'Others';
      ordersDetails[country] = [
        ...(ordersDetails[country] || []),
        ...clientOrders,
      ];
    });

    // Process and format data for each country
    const ordersCD: Record<string, CountryOrderData[]> = {};
    Object.entries(ordersDetails).forEach(([country, ordersArr]) => {
      const sortedDates = ordersArr.reduce<Record<string, CountryOrderData>>(
        (merged, order) => {
          const date = order.createdAt.toISOString().split('T')[0];
          const [year, month, day] = date.split('-');
          const formattedDate = `${monthNames[+month - 1]} ${day}`;

          if (!merged[formattedDate]) {
            merged[formattedDate] = {
              date: formattedDate,
              orderQuantity: 0,
              fileQuantity: 0,
              isoDate: order.createdAt,
            };
          }
          merged[formattedDate].fileQuantity += order.quantity;
          merged[formattedDate].orderQuantity++;

          return merged;
        },
        {},
      );

      ordersCD[country] = Object.values(sortedDates);
    });

    return { data: ordersCD, status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetOrdersStatus(req: Request): Promise<{
  data: string | StatusOrderData[];
  status: number;
}> {
  try {
    const statusFromDate = getDateRange(14).from;
    const statusToDate = getDateRange(14).to;

    const ordersForStatus = await Order.find({
      createdAt: {
        $gte: new Date(statusFromDate),
        $lte: new Date(statusToDate).setHours(23, 59, 59, 999),
      },
    });

    const mergedOrdersStatus = ordersForStatus.reduce(
      (merged: Record<string, StatusOrderData>, order: any) => {
        const date = order.createdAt.toISOString().split('T')[0];
        const [year, month, day] = date.split('-');
        const formattedDate = `${monthNames[parseInt(month) - 1]} ${day}`;

        if (!merged[formattedDate]) {
          merged[formattedDate] = {
            date: formattedDate,
            orderQuantity: 0,
            orderPending: 0,
            fileQuantity: 0,
            filePending: 0,
          };
        }

        merged[formattedDate].fileQuantity += order.quantity;
        merged[formattedDate].orderQuantity++;
        if (order.status !== 'Finished') {
          merged[formattedDate].filePending += order.quantity;
          merged[formattedDate].orderPending++;
        }

        merged[formattedDate].isoDate = order.createdAt;

        return merged;
      },
      {},
    );

    const ordersStatus: StatusOrderData[] = Object.values(mergedOrdersStatus);
    return { data: ordersStatus, status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetOrdersByCountry(req: Request): Promise<{
  data: string | OrderDetails;
  status: number;
}> {
  try {
    const fromDate = headers().get('from_date');
    const toDate = headers().get('to_date');
    const country = headers().get('country');

    if (!country) throw new Error('Country must be provided');

    let query: any = { type: { $ne: 'Test' } };

    if (fromDate || toDate) {
      query.createdAt = {};
      query.createdAt = {
        ...(fromDate && { $gte: fromDate }),
        ...(toDate && { $lte: toDate }),
      };
    }

    if (!fromDate && !toDate) {
      delete query.createdAt;
    }

    const countryFilter =
      country === 'Others' ? { $nin: countriesList } : country;
    const clientsAll = await Client.find(
      { country: countryFilter },
      { client_code: 1, country: 1 },
    ).lean();

    const returnData: OrderDetails = { details: [], totalFiles: 0 };
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
}

// Function: handleGetOrdersByMonth
async function handleGetOrdersByMonth(req: Request): Promise<{
  data: string | PaginatedData<ClientOrdersByMonth[]>;
  status: number;
}> {
  const page: number = Number(headers().get('page')) || 1;
  const ITEMS_PER_PAGE: number = Number(headers().get('items_per_page')) || 30;
  // const isFilter: boolean = headers().get('filtered') === 'true';
  // const paginated: boolean = headers().get('paginated') === 'true';

  const filters = await req.json();

  const { client_code } = filters;

  const query: any = {};

  addIfDefined(query, 'client_code', createRegexQuery(client_code, true));

  try {
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const clients = await Client.find(query, { client_code: 1 })
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .lean();
    const result: ClientOrdersByMonth[] = [];

    for (const client of clients) {
      const clientOrders: ClientOrdersByMonth = {
        client_code: client.client_code,
        orders: [],
      };

      const ordersByMonth: Record<
        string,
        { count: number; totalFiles: number; invoiced: boolean }
      > = {};
      const startDate = moment()
        .subtract(11, 'months')
        .startOf('month')
        .toDate();
      const endDate = moment().endOf('month').toDate();

      const orders = await Order.find({
        client_code: client.client_code,
        createdAt: { $gte: startDate, $lte: endDate },
      }).lean();

      orders.forEach((order: any) => {
        const monthYear = moment(order.createdAt).format('YYYY-MM');
        if (!ordersByMonth[monthYear]) {
          ordersByMonth[monthYear] = {
            count: 0,
            totalFiles: 0,
            invoiced: false,
          };
        }
        ordersByMonth[monthYear].count++;
        ordersByMonth[monthYear].totalFiles += order.quantity;
      });

      const last12Months = getLast12Months();
      for (const month of last12Months) {
        const monthAndYear = month.monthAndYear;
        const formattedMonthYear = moment(monthAndYear, 'YYYY-MM').format(
          'MMMM YYYY',
        );
        const count = ordersByMonth[monthAndYear]?.count || 0;
        const totalFiles = ordersByMonth[monthAndYear]?.totalFiles || 0;
        let invoiced = false;

        if (count) {
          const { start, end } = getMonthRange(formattedMonthYear);
          invoiced = !!(await Invoice.findOne({
            client_code: client.client_code,
            'time_period.fromDate': { $gte: start },
            'time_period.toDate': { $lte: end },
          }).lean());
        }

        clientOrders.orders.push({
          [formattedMonthYear]: { count, totalFiles, invoiced },
        });
      }

      result.push(clientOrders);
    }

    const count = await Client.countDocuments(query);
    const pageCount = Math.ceil(count / ITEMS_PER_PAGE);

    return {
      data: {
        pagination: { count, pageCount },
        items: result,
      },
      status: 200,
    };
  } catch (error) {
    console.error(error);
    return { data: 'An error occurred', status: 500 };
  }
}

export async function POST(req: Request) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-all-orders':
      res = await handleGetAllOrders(req);
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

export async function GET(req: Request) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-unfinished-orders':
      res = await handleGetUnfinishedOrders(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-redo-orders':
      res = await handleGetRedoOrders(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-order-by-id':
      res = await handleGetOrdersById(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-client-orders':
      res = await handleGetAllOrdersOfClient(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-orders-status':
      res = await handleGetOrdersStatus(req);
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
