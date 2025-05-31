import { dbConnect, getQuery } from '@/lib/utils';
import Client, { ClientDataType } from '@/models/Clients';
import Invoice, { InvoiceDataType } from '@/models/Invoices';
import Order, { OrderDataType } from '@/models/Orders';
import {
  calculateTimeDifference,
  getDateRange,
  getDatesInRange,
  getLast12Months,
  getMonthRange,
  toISODate,
} from '@/utility/date';
import {
  addIfDefined,
  addRegexField,
  createRegexQuery,
} from '@/utility/filterHelpers';
import moment from 'moment-timezone';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
dbConnect();

export interface RegexQuery {
  $regex: string;
  $options: string;
}

export interface Query {
  type?: RegexQuery;
  task?: RegexQuery;
  status?: RegexQuery;
  folder?: RegexQuery;
  client_code?: RegexQuery;
  download_date?: { $gte?: string; $lte?: string };
  $or?: { [key: string]: RegexQuery }[];
}

export type RegexFields = Extract<
  keyof Query,
  'type' | 'task' | 'folder' | 'client_code' | 'status'
>;

const countriesList = ['Australia', 'Denmark', 'Finland', 'Norway', 'Sweden'];

export interface OrderData {
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
}

export interface OrderDetails {
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

async function handleGetUnfinishedOrders(req: NextRequest): Promise<{
  data: string | OrderDataType[];
  status: number;
}> {
  try {
    const orders: any[] = await Order.aggregate([
      {
        $match: {
          status: { $nin: ['Finished', 'Correction'] },
          type: { $ne: 'Test' },
          $expr: { $ne: ['$production', '$quantity'] },
        },
      },
    ]);

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

async function handleGeQCOrders(req: NextRequest): Promise<{
  data: string | OrderDataType[];
  status: number;
}> {
  try {
    const orders: any[] = await Order.aggregate([
      {
        $match: {
          status: { $nin: ['Finished', 'Correction'] },
          type: { $ne: 'Test' },
          $expr: { $eq: ['$production', '$quantity'] },
        },
      },
    ]);

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

async function handleGetRedoOrders(req: NextRequest): Promise<{
  data: string | (OrderDataType & { timeDifference: number })[];
  status: number;
}> {
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
}

async function handleGetAllOrders(req: NextRequest): Promise<{
  data: string | PaginatedData<OrderDataType[]>;
  status: number;
}> {
  try {
    const headersList = await headers();
    const page: number = Number(headersList.get('page')) || 1;
    const ITEMS_PER_PAGE: number =
      Number(headersList.get('items_per_page')) || 30;
    const isFilter: boolean = headersList.get('filtered') === 'true';
    const paginated: boolean = headersList.get('paginated') === 'true';

    const isForInvoice: boolean = headersList.get('for_invoice') === 'true';

    const filters = await req.json();

    const {
      folder,
      clientCode,
      task,
      type,
      status,
      fromDate,
      toDate,
      generalSearchString,
    } = filters;

    let query: Query = {};

    if (fromDate || toDate) {
      query.download_date = {};
      query.download_date = {
        ...(fromDate && { $gte: fromDate }),
        ...(toDate && { $lte: toDate }),
      };
    }

    if (!fromDate && !toDate) {
      delete query.download_date;
    }

    addRegexField(query, 'folder', folder);
    addRegexField(query, 'client_code', clientCode, isForInvoice ?? false);
    addRegexField(query, 'task', task);
    addRegexField(query, 'type', type, true);
    addRegexField(query, 'status', status, true);

    console.log(query);

    const searchQuery: Query = { ...query };

    let sortQuery: Record<string, 1 | -1> = {
      customSortField: 1,
      download_date: -1,
    };

    if (!query && isFilter == true && !generalSearchString) {
      return { data: 'No filter applied', status: 400 };
    } else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      if (generalSearchString) {
        const searchPattern = createRegexQuery(generalSearchString);

        searchQuery['$or'] = [
          { client_code: searchPattern! },
          { client_name: searchPattern! },
          { folder: searchPattern! },
          { task: searchPattern! },
          // { folder_path: searchPattern! },
        ];
      }

      const count: number = await Order.countDocuments(searchQuery);
      let orders: any[];

      if (paginated) {
        orders = (await Order.aggregate([
          { $match: searchQuery },
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
        orders = await Order.find(searchQuery)
          .sort({
            download_date: 1,
          })
          .lean();
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

async function handleGetOrdersById(req: NextRequest): Promise<{
  data: string | OrderDataType;
  status: number;
}> {
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
}

async function handleEditOrder(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const headersList = await headers();
    let data = await req.json();
    const updatedBy = headersList.get('updated_by');
    const { _id } = data;
    delete data._id;

    const resData = await Order.findByIdAndUpdate(
      _id,
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

async function handleCreateOrder(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
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
}

async function handleDeleteOrder(req: NextRequest): Promise<{
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

async function handleFinishOrder(req: NextRequest): Promise<{
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

async function handleRedoOrder(req: NextRequest): Promise<{
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

async function handleGetAllOrdersOfClient(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
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
}

// QP = Quantity and Pending
async function handleGetOrdersQP(req: NextRequest): Promise<{
  data: string | OrderData[];
  status: number;
}> {
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
}

// CD = Country Data
async function handleGetOrdersCD(req: NextRequest): Promise<{
  data: string | Record<string, CountryOrderData[]>;
  status: number;
}> {
  try {
    const headersList = await headers();
    const fromDate = headersList.get('from_date') as string;
    const toDate = headersList.get('to_date') as string;
    const query: any = {};

    if (fromDate || toDate) {
      query.download_date = {
        ...(fromDate && { $gte: fromDate }),
        ...(toDate && { $lte: toDate }),
      };
    }

    // Retrieve clients and initialize country mapping
    const clientsAll = await Client.find({}, { client_code: 1, country: 1 });
    const clientCodeCountryMap = clientsAll.reduce(
      (map, client) => {
        map[client.client_code] = client.country || 'Others';
        return map;
      },
      {} as Record<string, string>,
    );

    const ordersDetails: Record<string, any[]> = {
      ...countriesList.reduce(
        (acc, country) => ({ ...acc, [country]: [] }),
        {},
      ),
      Others: [],
    };

    // Retrieve all orders
    const ordersAll = await Order.find(query, {
      client_code: 1,
      download_date: 1,
      quantity: 1,
    });

    // Map orders to their respective countries
    ordersAll.forEach(order => {
      const clientCountry = clientCodeCountryMap[order.client_code] || 'Others';
      const country = ordersDetails[clientCountry] ? clientCountry : 'Others';
      ordersDetails[country] = [...(ordersDetails[country] || []), order];
    });

    // Generate date range
    const dateRange: string[] = [];
    if (fromDate && toDate) {
      let currentDate = new Date(fromDate);
      const endDate = new Date(toDate);

      while (currentDate <= endDate) {
        dateRange.push(currentDate.toISOString().split('T')[0]); // "YYYY-MM-DD"
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Process and format data for each country
    const ordersCD: Record<string, CountryOrderData[]> = {};
    Object.entries(ordersDetails).forEach(([country, ordersArr]) => {
      const sortedDates = ordersArr.reduce<Record<string, CountryOrderData>>(
        (merged, order) => {
          // const date = order.createdAt.toISOString().split('T')[0]; // "YYYY-MM-DD"
          const date = order.download_date; // "YYYY-MM-DD"

          if (!merged[date]) {
            merged[date] = {
              date,
              orderQuantity: 0,
              fileQuantity: 0,
            };
          }
          merged[date].fileQuantity += order.quantity;
          merged[date].orderQuantity++;

          return merged;
        },
        {},
      );

      // Ensure every date in the range is represented
      const fullDateData: Record<string, CountryOrderData> = {};
      dateRange.forEach(date => {
        fullDateData[date] = sortedDates[date] || {
          date,
          orderQuantity: 0,
          fileQuantity: 0,
        };
      });

      // Assign data for the country
      ordersCD[country] = Object.values(fullDateData).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    });

    return { data: ordersCD, status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetOrdersByCountry(req: NextRequest): Promise<{
  data: string | OrderDetails;
  status: number;
}> {
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
}

const DATE_FORMAT = {
  MONTH_YEAR: 'YYYY-MM',
  FULL_MONTH_YEAR: 'MMMM YYYY',
};

// used in invoice route
async function handleGetOrdersByMonth(req: NextRequest): Promise<{
  data: string | PaginatedData<ClientOrdersByMonth[]>;
  status: number;
}> {
  const headersList = await headers();
  const page = Number(headersList.get('page')) || 1;
  const ITEMS_PER_PAGE = Number(headersList.get('items_per_page')) || 30;
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const { clientCode } = await req.json();
  const query: any = {};
  if (clientCode) {
    query.client_code = createRegexQuery(clientCode);
  }

  try {
    // Fetch clients with pagination
    const [clients, totalClients] = await Promise.all([
      Client.find(query, { client_code: 1 })
        .skip(skip)
        .limit(ITEMS_PER_PAGE)
        .lean(),
      Client.countDocuments(query),
    ]);

    if (clients.length === 0) {
      return {
        data: {
          pagination: {
            count: totalClients,
            pageCount: Math.ceil(totalClients / ITEMS_PER_PAGE),
          },
          items: [],
        },
        status: 200,
      };
    }

    // Prepare date range and client codes
    const endDate = moment().endOf('month').format('YYYY-MM-DD');
    const startDate = moment()
      .subtract(11, 'months')
      .startOf('month')
      .format('YYYY-MM-DD');
    const clientCodes = clients.map(client => client.client_code);

    // Fetch all relevant orders in a single query
    const orders = (await Order.find({
      client_code: { $in: clientCodes },
      download_date: { $gte: startDate, $lte: endDate },
    }).lean()) as unknown as OrderDataType[];

    console.log('Orders:', orders, clientCodes, startDate, endDate);

    // Initialize result structure with all months
    const last12Months = Array.from({ length: 12 }, (_, i) =>
      moment()
        .subtract(11 - i, 'months')
        .format(DATE_FORMAT.MONTH_YEAR),
    );

    // Group orders by client and month using reduce
    const ordersByClient = orders.reduce(
      (
        acc: Record<
          string,
          Record<string, { count: number; totalFiles: number }>
        >,
        order,
      ) => {
        const monthYear = moment(order.download_date).format(
          DATE_FORMAT.MONTH_YEAR,
        );

        if (!acc[order.client_code]) {
          acc[order.client_code] = {};
        }
        if (!acc[order.client_code][monthYear]) {
          acc[order.client_code][monthYear] = { count: 0, totalFiles: 0 };
        }

        acc[order.client_code][monthYear].count++;
        acc[order.client_code][monthYear].totalFiles += order.quantity;

        return acc;
      },
      {},
    );

    // Build final response
    const result = await Promise.all(
      clients.map(async client => {
        const clientOrders: ClientOrdersByMonth = {
          client_code: client.client_code,
          orders: await Promise.all(
            last12Months.map(async monthYear => {
              const formattedMonthYear = moment(
                monthYear,
                DATE_FORMAT.MONTH_YEAR,
              ).format(DATE_FORMAT.FULL_MONTH_YEAR);

              const monthData = ordersByClient[client.client_code]?.[
                monthYear
              ] || {
                count: 0,
                totalFiles: 0,
              };

              let invoiced = false;
              if (monthData.count > 0) {
                const { start, end } = getMonthRange(formattedMonthYear);
                invoiced = !!(await Invoice.findOne({
                  client_code: client.client_code,
                  'time_period.fromDate': { $gte: start },
                  'time_period.toDate': { $lte: end },
                }).lean());
              }

              return {
                [formattedMonthYear]: {
                  count: monthData.count,
                  totalFiles: monthData.totalFiles,
                  invoiced,
                },
              };
            }),
          ),
        };

        return clientOrders;
      }),
    );

    return {
      data: {
        pagination: {
          count: totalClients,
          pageCount: Math.ceil(totalClients / ITEMS_PER_PAGE),
        },
        items: result,
      },
      status: 200,
    };
  } catch (error) {
    console.error('Error in handleGetOrdersByMonth:', error);
    return { data: 'An error occurred', status: 500 };
  }
}

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
      res = await handleGeQCOrders(req);
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
