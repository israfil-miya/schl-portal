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
import { addIfDefined, createRegexQuery } from '@/utility/filterHelpers';
import getQuery from '@/utility/getApiQuery';
import moment from 'moment-timezone';
import mongoose from 'mongoose';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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

async function handleGetOrdersUnFinished(req, res) {
  try {
    const orders = await Order.find({
      status: { $nin: ['Finished', 'Correction'] },
      type: { $ne: 'Test' },
    }).lean();

    if (!orders) res.status(200).json([]);

    const sortedOrders = orders
      .map(order => ({
        ...order,
        timeDifference: calculateTimeDifference(
          order.delivery_date,
          order.delivery_bd_time,
        ),
      }))
      .sort((a, b) => a.timeDifference - b.timeDifference);

    res.status(200).json(sortedOrders);
  } catch (e) {
    console.error(e);
    sendError(res, 500, ['An error occurred']);
  }
}

async function handleGetOrdersRedo(req, res) {
  try {
    const orders = await Order.find({
      $or: [{ type: 'Test' }, { status: 'Correction' }],
      status: { $ne: 'Finished' },
    }).lean();

    const sortedOrders = orders
      .map(order => ({
        ...order,
        timeDifference: calculateTimeDifference(
          order.delivery_date,
          order.delivery_bd_time,
        ),
      }))
      .sort((a, b) => a.timeDifference - b.timeDifference);

    res.status(200).json(sortedOrders);
  } catch (e) {
    console.error(e);
    sendError(res, 500, 'An error occurred');
  }
}

async function handleGetAllOrderPaginated(req, res) {
  const ITEMS_PER_PAGE = 50;
  const page = req.headers.page || 1;

  // Put all your query params in here
  const query = {};

  try {
    const skip = (page - 1) * ITEMS_PER_PAGE; // Calculate the number of items to skip

    // Add a new field "customSortField" based on your custom sorting criteria
    const pipeline = [
      { $match: query }, // Apply the query filter
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
      { $sort: { customSortField: 1, createdAt: -1 } }, // Sort the documents based on "customSortField"
      { $skip: skip }, // Skip items for pagination
      { $limit: ITEMS_PER_PAGE }, // Limit the number of items per page
    ];

    const count = await Order.estimatedDocumentCount(query);

    // Execute the aggregation pipeline and convert the result to an array
    const orders = await Order.aggregate(pipeline).exec();

    const pageCount = Math.ceil(count / ITEMS_PER_PAGE); // Calculate the total number of pages

    // Send the response with pagination information and sorted, paginated data
    res.status(200).json({
      pagination: {
        count,
        pageCount,
      },
      items: orders,
    });
  } catch (e) {
    console.error(e);
    sendError(res, 500, 'An error occurred');
  }
}

async function handleGetOrdersById(req, res) {
  try {
    let data = req.headers;
    const orders = await Order.findById(data.id).lean();

    if (!orders) sendError(res, 400, 'No order found with the id');
    else res.status(200).json(orders);
  } catch (e) {
    console.error(e);
    sendError(res, 500, 'An error occurred');
  }
}

async function handleGetOrdersByFilter(req, res) {
  try {
    const { fromtime, totime, folder, client_code, task, type, forinvoice } =
      req.headers;
    const page = req.headers.page || 1;
    const ITEMS_PER_PAGE = parseInt(req.headers.ordersnumber) || 20; // Number of items per page

    console.log(
      'Received request with parameters:',
      fromtime,
      totime,
      folder,
      client_code,
      task,
      type,
      forinvoice,
      page,
    );

    let query = {};
    // if (forinvoice) query.status = "Finished";

    if (folder) query.folder = { $regex: `^${folder.trim()}$`, $options: 'i' };
    if (client_code)
      query.client_code = { $regex: `^${client_code.trim()}$`, $options: 'i' };
    if (task) query.task = { $regex: `^${task.trim()}$`, $options: 'i' };

    if (type) query.type = { $regex: type, $options: 'i' };

    if (fromtime || totime) {
      query.createdAt = {};
      if (fromtime) {
        // Set the $gte filter for the start of the day
        query.createdAt.$gte = new Date(fromtime);
      }
      if (totime) {
        // Set the $lte filter for the end of the day
        const toTimeDate = new Date(totime);
        toTimeDate.setHours(23, 59, 59, 999); // Set to end of the day
        query.createdAt.$lte = toTimeDate;
      }
    }

    if (Object.keys(query).length === 0 && query.constructor === Object)
      sendError(res, 400, 'No filter applied');
    else {
      // Calculate the number of documents to skip based on the current page
      const skip = (page - 1) * ITEMS_PER_PAGE;

      let pipeline = [
        { $match: query }, // Apply the query filter
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
        { $sort: { customSortField: 1 } }, // Sort the documents based on "customSortField"
        // Limit the number of items per page
      ];

      if (!req.headers.not_paginated) {
        pipeline = [
          ...pipeline,
          { $sort: { createdAt: -1 } },
          { $skip: skip }, // Skip items for pagination
          { $limit: ITEMS_PER_PAGE },
        ];
      } else {
        pipeline = [...pipeline, { $sort: { createdAt: 1 } }];
      }

      // console.log(pipeline);

      console.log('Final Query: ', query);

      const count = await Order.countDocuments(query); // Count the total matching documents

      const orders = await Order.aggregate(pipeline).exec();

      // console.log("FILTERED ORDERS: ", orders.length);

      const pageCount = Math.ceil(count / ITEMS_PER_PAGE); // Calculate the total number of pages

      res.status(200).json({
        pagination: {
          count,
          pageCount,
        },
        items: orders,
      });
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, 'An error occurred');
  }
}

async function handleEditOrder(req, res) {
  try {
    let data = req.body;
    const updated_by = req.headers.name;
    data = { ...data, updated_by };

    const resData = await Order.findByIdAndUpdate(data._id, data, {
      new: true,
    });

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, 'No order found');
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, 'An error occurred');
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
    case 'get-all-orders':
      res = await handleGetAllOrderPaginated(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-unfinished-orders':
      res = await handleGetClientsOnboard(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-redo-orders':
      res = await handleGetTestOrdersTrend(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-all-marketers':
      res = await handleGetAllMarketers(req);
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
