import Client from '@/models/Clients';
import getQuery from '@/utility/getApiQuery';
import moment from 'moment-timezone';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { createRegexQuery } from '@/utility/filterHelpers';
import Order from '@/models/Orders';

function calculateTimeDifference(deliveryDate, deliveryTime) {
  const is12HourFormat = /\b(?:am|pm)\b/i.test(deliveryTime);
  const [time, meridiem] = deliveryTime.split(/\s+/);
  const [hours, minutes] = time.split(':').map(Number);

  let adjustedHours = hours;
  if (is12HourFormat) {
    const meridiemLower = meridiem.toLowerCase();
    adjustedHours = moment(
      `${hours}:${minutes} ${meridiemLower}`,
      'hh:mm a',
    ).hours();
  }
  const asiaDhakaTime = moment().tz('Asia/Dhaka');

  const [year, month, day] = deliveryDate.split('-').map(Number);
  const deliveryDateTime = moment.tz(
    `${year}-${month}-${day} ${adjustedHours}:${minutes}`,
    'YYYY-MM-DD HH:mm',
    'Asia/Dhaka',
  );

  const timeDifferenceMs = deliveryDateTime.diff(asiaDhakaTime);

  return timeDifferenceMs;
}


async function handleNewOrder(req, res) {
  try {
    const data = req.body;
    const resData = await Order.create(data);

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

async function handleDeleteOrder(req: Request): Promise<{
  data: string | Object;
  status: number;
}>  {
  try {
    const {order_id}: {order_id: string} = await req.json();
    try {
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
    const {order_id}: {order_id: string} = await req.json();
    const resData = await Order.findByIdAndUpdate(
      order_id,
      { status: 'Finished' },
      {
        new: true,
      },
    );

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

async function handleRedoOrder(req, res) {
  try {
    const data = req.headers;
    // console.log("Received edit request with data:", data);

    const resData = await Order.findByIdAndUpdate(
      data.id,
      { status: 'Correction' },
      {
        new: true,
      },
    );

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

async function handleGetAllOrdersOfClient(req, res) {
  try {
    const data = req.headers;
    // console.log("Received edit request with data of Client:", data);

    const resData = await Order.find({ client_code: data.client_code });

    // console.log(resData);

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

function getDatesInRange(fromTime, toTime) {
  const dates = [];
  let currentDate = new Date(fromTime);
  const endDate = new Date(toTime).setHours(23, 59, 59, 999);

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    dates.push(formattedDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

function getDateRange() {
  const today = new Date();
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(today.getDate() - 14);

  const formatDate = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    from: formatDate(fourteenDaysAgo),
    to: formatDate(today),
  };
}

async function handleGetOrdersByFilterStat(req, res) {
  try {
    const { fromtime, totime } = req.headers;

    const fromStatus = getDateRange().from;
    const toStatus = getDateRange().to;

    let query = { type: { $ne: 'Test' } };

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

    // console.log("QUERY: ", query)

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

    const orders = await Order.find(query);
    const mergedOrders = orders.reduce((merged, order) => {
      const date =
        order.createdAt instanceof Date
          ? order.createdAt.toISOString().split('T')[0]
          : order.createdAt.split('T')[0];

      // console.log("VALIDATE IS DATE 1: ", date)

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

      // Update fileQuantity and filePending based on the order status and quantity
      merged[formattedDate].fileQuantity += order.quantity;
      merged[formattedDate].orderQuantity++;
      if (order.status !== 'Finished') {
        merged[formattedDate].filePending += order.quantity;
        merged[formattedDate].orderPending++;
      }

      return merged;
    }, {});
    const ordersQP = Object.values(mergedOrders);

    // console.log("Code reached here 01")

    // console.log(fromStatus, toStatus)

    const ordersForStatus = await Order.find({
      createdAt: {
        $gte: new Date(fromStatus),
        $lte: new Date(toStatus).setHours(23, 59, 59, 999),
      },
    });

    // console.log("Code reached here 02")

    const mergedOrdersStatus = ordersForStatus.reduce((merged, order) => {
      const date =
        order.createdAt instanceof Date
          ? order.createdAt.toISOString().split('T')[0]
          : order.createdAt.split('T')[0];

      // console.log("VALIDATE IS DATE 2: ", date)

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

      // Update fileQuantity and filePending based on the order status and quantity
      merged[formattedDate].fileQuantity += order.quantity;
      merged[formattedDate].orderQuantity++;
      if (order.status !== 'Finished') {
        merged[formattedDate].filePending += order.quantity;
        merged[formattedDate].orderPending++;
      }

      merged[formattedDate].isoDate = order.createdAt;

      return merged;
    }, {});

    const ordersStatus = Object.values(mergedOrdersStatus);

    const clientsAll = await Client.find({}, { client_code: 1, country: 1 });

    let ordersDetails = {
      Australia: [],
      Denmark: [],
      Finland: [],
      Norway: [],
      Sweden: [],
      Others: [],
    }; // Initialize ordersDetails with the countries object

    // Create an array of promises
    const orderPromises = clientsAll.map(async clientData =>
      Order.find(
        { ...query, client_code: clientData.client_code },
        { createdAt: 1, quantity: 1 },
      ),
    );

    // Use Promise.all to wait for all asynchronous calls to complete
    const ordersAll = await Promise.all(orderPromises);

    ordersAll.forEach((clientOrders, index) => {
      const clientData = clientsAll[index];
      const country = ordersDetails[clientData.country]
        ? clientData.country
        : 'Others';
      if (!ordersDetails[country]) {
        ordersDetails[country] = []; // Create an empty array if it doesn't exist
      }
      ordersDetails[country].push(...clientOrders); // Use spread operator to push the client orders
    });

    // Remove empty categories
    for (const country in ordersDetails) {
      if (ordersDetails[country].length === 0) {
        delete ordersDetails[country];
      }
    }

    let ordersCD = {
      Australia: [],
      Denmark: [],
      Finland: [],
      Norway: [],
      Sweden: [],
      Others: [],
    };

    for (const [countryName, ordersArr] of Object.entries(ordersDetails)) {
      const merged = {}; // Reset merged object for each country

      const sortedDates = ordersArr.reduce((merged, order) => {
        const date =
          order.createdAt instanceof Date
            ? order.createdAt.toISOString().split('T')[0]
            : order.createdAt.split('T')[0];
        const [year, month, day] = date.split('-');
        const formattedDate = `${monthNames[parseInt(month) - 1]} ${day}`;

        if (!merged[formattedDate]) {
          merged[formattedDate] = {
            date: formattedDate,
            orderQuantity: 0,
            fileQuantity: 0,
          };
        }

        merged[formattedDate].fileQuantity += order.quantity;
        merged[formattedDate].orderQuantity++;

        merged[formattedDate].isoDate = order.createdAt;

        return merged;
      }, {});

      const sortedDatesArray = Object.values(sortedDates).sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });

      ordersCD[countryName].push(...sortedDatesArray);
    }

    const dateRange = getDatesInRange(fromtime, totime).map(date => {
      const [year, month, day] = date.split('-');
      return `${monthNames[month - 1]} ${day}`;
    });

    const dateRangeForStatus = getDatesInRange(fromStatus, toStatus).map(
      date => {
        const [year, month, day] = date.split('-');
        return `${monthNames[month - 1]} ${day}`;
      },
    );

    const zeroDataQP = {
      orderQuantity: 0,
      orderPending: 0,
      fileQuantity: 0,
      filePending: 0,
      isoDate: null,
    };
    const ordersQPWithMissingDates = dateRange.map(date => {
      const existingData = ordersQP.find(item => item.date === date);
      if (existingData) {
        return existingData;
      } else {
        return { date, ...zeroDataQP };
      }
    });

    const zeroDataStatus = {
      orderQuantity: 0,
      orderPending: 0,
      fileQuantity: 0,
      filePending: 0,
    };
    const ordersStatusWithMissingDates = dateRangeForStatus.map(date => {
      const existingData = ordersStatus.find(item => item.date === date);
      if (existingData) {
        return existingData;
      } else {
        return { date, ...zeroDataStatus };
      }
    });

    const zeroDataCD = {
      orderQuantity: 0,
      fileQuantity: 0,
      isoDate: null,
    };
    const ordersCDWithMissingDates = {};
    for (const [country, ordersArr] of Object.entries(ordersCD)) {
      ordersCDWithMissingDates[country] = dateRange.map(date => {
        const existingData = ordersArr.find(item => item.date === date);
        if (existingData) {
          return existingData;
        } else {
          return { date, ...zeroDataCD };
        }
      });
    }

    const returnData = {
      ordersQP: ordersQPWithMissingDates,
      ordersCD: ordersCDWithMissingDates,
      ordersStatus: ordersStatusWithMissingDates,
    };

    if (returnData) {
      res.status(200).json(returnData);
    } else {
      sendError(res, 400, 'Something went wrong');
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, 'An error occurred');
  }
}

async function handleGetOrdersByCountry(req, res) {
  try {
    let { country, fromtime, totime } = req.headers;
    if (!country) sendError(res, 400, 'Country must be provided');

    let countriesList = ['Australia', 'Denmark', 'Finland', 'Norway', 'Sweden'];

    let query = { type: { $ne: 'Test' } };

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

    let countryFilter = country;
    if (country == 'Others') countryFilter = { $nin: countriesList };

    const clientsAll = await Client.find(
      { country: countryFilter },
      { client_code: 1, country: 1 },
    );

    let returnData = {
      details: [],
      totalFiles: 0,
    };

    // Create an array of promises for Order.find operations
    const promises = clientsAll.map(clientData => {
      return Order.find({ ...query, client_code: clientData.client_code })
        .lean()
        .then(ordersOfClient => {
          if (ordersOfClient.length === 0) return;

          ordersOfClient.forEach(data => {
            returnData.details.push({ ...data, country: clientData.country });
            returnData.totalFiles += data.quantity;
          });
        });
    });

    Promise.all(promises)
      .then(() => {
        res.status(200).json(returnData);
      })
      .catch(error => {
        // console.log(error);
        sendError(res, 400, 'Something went wrong');
      });
  } catch (e) {
    console.error(e);
    sendError(res, 500, 'An error occurred');
  }
}

const getLast12Months = () => {
  const result = [];
  const today = moment();
  for (let i = 0; i < 12; i++) {
    result.push({
      monthYear: today.format('YYYY-MM'), // Format as "YYYY-MM"
    });
    today.subtract(1, 'months');
  }
  return result.reverse(); // Reverse to start from oldest to newest
};

function getMonthRange(monthYear) {
  const [monthName, year] = monthYear.split(' ');
  const monthNumber = moment().month(monthName).format('MM');
  const startDate = moment
    .tz(`${year}-${monthNumber}-01`, 'Asia/Dhaka')
    .startOf('month')
    .format('YYYY-MM-DD');
  const endDate = moment
    .tz(`${year}-${monthNumber}-01`, 'Asia/Dhaka')
    .endOf('month')
    .format('YYYY-MM-DD');
  return { start: startDate, end: endDate };
}

async function handleGetOrdersByMonth(req, res) {
  const ITEMS_PER_PAGE = 20;
  let page = parseInt(req.headers.page) || 1;
  console.log('Page = ', req.headers.page);
  let { client_code } = req.headers;
  let query = {};

  if (client_code)
    query.client_code = { $regex: `^${client_code.trim()}$`, $options: 'i' };

  try {
    // Step 1: Get client codes from the Client collection with pagination
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const clients = await Client.find(query, { client_code: 1 })
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .lean();

    // Step 2: Loop through each client code
    const result = [];
    for (const client of clients) {
      const clientCode = client.client_code;
      const clientOrders = {
        client_code: clientCode,
        orders: [],
      };

      // Step 3: Loop through the Order collection to count orders for each month
      const ordersByMonth = {};
      const startDate = moment()
        .subtract(11, 'months')
        .startOf('month')
        .toDate();
      const endDate = moment().endOf('month').toDate();
      const orders = await Order.find({
        // status: "Finished",
        client_code: clientCode,
        createdAt: { $gte: startDate, $lte: endDate },
      }).lean();

      orders.forEach(order => {
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

      // Step 4: Aggregate monthly order counts for the client
      const last12Months = getLast12Months();
      await Promise.all(
        last12Months.map(async month => {
          const monthYear = month.monthYear;

          // console.log(ordersByMonth, month);
          const count = ordersByMonth[monthYear]?.count || 0;
          const totalFiles = ordersByMonth[monthYear]?.totalFiles || 0;
          let invoiced = ordersByMonth[monthYear]?.invoiced || false;

          const formattedMonthYear = moment(monthYear, 'YYYY-MM').format(
            'MMMM YYYY',
          );

          if (count) {
            let monthYearRange = getMonthRange(formattedMonthYear);
            try {
              const invoiceData = await Invoice.findOne({
                client_code: clientCode,
                'time_period.fromDate': { $gte: monthYearRange.start },
                'time_period.toDate': { $lte: monthYearRange.end },
              }).lean();
              if (invoiceData) {
                invoiced = true;
              }
            } catch (error) {
              console.error('Error fetching invoice data:', error);
              invoiced = false;
            }
          }

          return {
            monthYear: formattedMonthYear,
            data: { count, totalFiles, invoiced },
          };
        }),
      ).then(monthlyData => {
        // Sort the monthlyData array based on monthYear
        monthlyData.sort(
          (a, b) =>
            moment(a.monthYear, 'MMMM YYYY') - moment(b.monthYear, 'MMMM YYYY'),
        );

        // Push the sorted data into clientOrders.orders
        monthlyData.forEach(data => {
          clientOrders.orders.push({ [data.monthYear]: data.data });
        });
      });

      result.push(clientOrders);
    }

    // Step 5: Pagination
    const count = await Client.countDocuments(query); // Count the total matching documents
    const pageCount = Math.ceil(count / ITEMS_PER_PAGE); // Calculate the total number of pages

    res.status(200).json({
      pagination: {
        count,
        pageCount,
        currentPage: page,
      },
      items: result,
    });
  } catch (error) {
    console.error('Error fetching orders by month:', error);
    sendError(res, 500, 'An error occurred');
  }
}

export async function POST(req: Request) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'delete-order':
      res = await handleGetAllReports(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'finish-order':
      res = await handleGetAllReports(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'redo-order':
      res = await handleGetAllReports(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'edit-order':
      res = await handleGetAllReports(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: Request) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-all-orders':
      res = await handleGetReportsCount(req);
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
      res = await handleGetAllMarketers(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-client-orders':
      res = await handleGetAllMarketers(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-order-stats':
      res = await handleGetAllMarketers(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-orders-by-country':
      res = await handleGetAllMarketers(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-orders-by-month':
      res = await handleGetAllMarketers(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
