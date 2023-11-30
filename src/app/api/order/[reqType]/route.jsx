import Order from "@/db/Orders";
import Client from "@/db/Clients";
import dbConnect from "@/lib/dbConnect";
import {prepareResponse, accessHeaders, ddMmYyyyToIsoDate} from "@/lib/utils"
import {getDatesInRange, getDateRange, calculateTimeDifference} from "./utils"



async function handleNewOrder(req, res) {
  try {
    const data = req.body;
    const resData = await Order.create(data);

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "No order found");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetOrdersUnFinished(req, res) {
  try {
    const orders = await Order.find({
      status: { $nin: ["Finished", "Correction"] },
      type: { $ne: "Test" },
    }).lean();

    if (!orders) res.status(200).json([]);

    const sortedOrders = orders
      .map((order) => ({
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
    sendError(res, 500, ["An error occurred"]);
  }
}

async function handleGetOrdersRedo(req, res) {
  try {
    const orders = await Order.find({
      $or: [{ type: "Test" }, { status: "Correction" }],
      status: { $ne: "Finished" },
    }).lean();

    const sortedOrders = orders
      .map((order) => ({
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
    sendError(res, 500, "An error occurred");
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
                      { $eq: ["$status", "Correction"] },
                      { $ne: ["$status", "Finished"] },
                    ],
                  },
                  {
                    $and: [
                      { $eq: ["$type", "Test"] },
                      { $ne: ["$status", "Finished"] },
                    ],
                  },
                ],
              },
              then: 0,
              else: {
                $cond: {
                  if: { $ne: ["$status", "Finished"] },
                  then: 1,
                  else: {
                    $cond: {
                      if: {
                        $and: [
                          { $eq: ["$status", "Finished"] },
                          { $eq: ["$type", "Test"] },
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
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetOrdersById(req, res) {
  try {
    let data = req.headers;
    const orders = await Order.findById(data.id).lean();

    if (!orders) sendError(res, 400, "No order found with the id");
    else res.status(200).json(orders);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetOrdersByFilter(req, res) {
  try {
    const { fromtime, totime, folder, client, task, typefilter, forinvoice } =
      req.headers;
    const page = req.headers.page || 1;
    const ITEMS_PER_PAGE = parseInt(req.headers.ordersnumber) ?? 20; // Number of items per page

    console.log(
      "Received request with parameters:",
      fromtime,
      totime,
      folder,
      client,
      task,
      typefilter,
      forinvoice,
      page,
    );

    let query = {};
    if (forinvoice) query.status = "Finished";
    if (folder) query.folder = folder;
    if (client) query.client_code = client;
    if (task) query.task = task;
    if (typefilter) query.type = typefilter;
    if (fromtime || totime) {
      query.createdAt = {};
      if (fromtime) {
        // Set the $gte filter for the start of the day
        query.createdAt.$gte = new Date(ddMmYyyyToIsoDate(fromtime));
      }
      if (totime) {
        // Set the $lte filter for the end of the day
        const toTimeDate = new Date(ddMmYyyyToIsoDate(totime));
        toTimeDate.setHours(23, 59, 59, 999); // Set to end of the day
        query.createdAt.$lte = toTimeDate;
      }
    }

    console.log(query);

    if (Object.keys(query).length === 0 && query.constructor === Object)
      sendError(res, 400, "No filter applied");
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
                        { $eq: ["$status", "Correction"] },
                        { $ne: ["$status", "Finished"] },
                      ],
                    },
                    {
                      $and: [
                        { $eq: ["$type", "Test"] },
                        { $ne: ["$status", "Finished"] },
                      ],
                    },
                  ],
                },
                then: 0,
                else: {
                  $cond: {
                    if: { $ne: ["$status", "Finished"] },
                    then: 1,
                    else: {
                      $cond: {
                        if: {
                          $and: [
                            { $eq: ["$status", "Finished"] },
                            { $eq: ["$type", "Test"] },
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

      console.log(pipeline);

      const count = await Order.countDocuments(query); // Count the total matching documents

      const orders = await Order.aggregate(pipeline).exec();

      console.log("FILTERED ORDERS: ", orders.length);

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
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetOnlyTime(req, res) {
  try {
    const orders = await Order.find(
      { status: { $nin: ["Finished", "Correction"] }, type: { $ne: "Test" } },
      { delivery_date: 1, delivery_bd_time: 1 },
    ).lean();

    const sortedOrders = orders
      .map((order) => ({
        timeDifference: calculateTimeDifference(
          order.delivery_date,
          order.delivery_bd_time,
        ),
      }))
      .sort((a, b) => a.timeDifference - b.timeDifference);

    res.status(200).json(sortedOrders);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
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
      sendError(res, 400, "No order found");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleDeleteOrder(req, res) {
  try {
    const data = req.headers;
    console.log("Received edit request with data:", data);

    const resData = await Order.findByIdAndDelete(data.id, {
      new: true,
    });

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "No order found");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleFinishOrder(req, res) {
  try {
    const data = req.headers;
    console.log("Received edit request with data:", data);

    const resData = await Order.findByIdAndUpdate(
      data.id,
      { status: "Finished" },
      {
        new: true,
      },
    );

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "No order found");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleRedoOrder(req, res) {
  try {
    const data = req.headers;
    console.log("Received edit request with data:", data);

    const resData = await Order.findByIdAndUpdate(
      data.id,
      { status: "Correction" },
      {
        new: true,
      },
    );

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "No order found");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetAllOrdersOfClient(req, res) {
  try {
    const data = req.headers;
    console.log("Received edit request with data of Client:", data);

    const resData = await Order.find({ client_code: data.client_code });

    console.log(resData);

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, "No order found");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetOrdersByFilterStat(req, res) {
  try {
    const { fromtime, totime } = req.headers;
    const fromStatus = getDateRange().from;
    const toStatus = getDateRange().to;

    let query = { type: { $ne: "Test" } };
    if (fromtime || totime) {
      query.createdAt = {};
      if (fromtime) {
        // Set the $gte filter for the start of the day
        query.createdAt.$gte = new Date(ddMmYyyyToIsoDate(fromtime));
      }
      if (totime) {
        // Set the $lte filter for the end of the day
        const toTimeDate = new Date(ddMmYyyyToIsoDate(totime));
        toTimeDate.setHours(23, 59, 59, 999); // Set to end of the day
        query.createdAt.$lte = toTimeDate;
      }
    }

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const orders = await Order.find(query);
    const mergedOrders = orders.reduce((merged, order) => {
      const date =
        order.createdAt instanceof Date
          ? order.createdAt.toISOString().split("T")[0]
          : order.createdAt.split("T")[0];
      const [year, month, day] = date.split("-");
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
      if (order.status !== "Finished") {
        merged[formattedDate].filePending += order.quantity;
        merged[formattedDate].orderPending++;
      }

      return merged;
    }, {});
    const ordersQP = Object.values(mergedOrders);

    const ordersForStatus = await Order.find({
      createdAt: {
        $gte: new Date(ddMmYyyyToIsoDate(fromStatus)),
        $lte: new Date(ddMmYyyyToIsoDate(toStatus)).setHours(23, 59, 59, 999),
      },
    });

    const mergedOrdersStatus = ordersForStatus.reduce((merged, order) => {
      const date =
        order.createdAt instanceof Date
          ? order.createdAt.toISOString().split("T")[0]
          : order.createdAt.split("T")[0];
      const [year, month, day] = date.split("-");
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
      if (order.status !== "Finished") {
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
    const orderPromises = clientsAll.map(async (clientData) =>
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
        : "Others";
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
            ? order.createdAt.toISOString().split("T")[0]
            : order.createdAt.split("T")[0];
        const [year, month, day] = date.split("-");
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

    const dateRange = getDatesInRange(fromtime, totime).map((date) => {
      const [year, month, day] = date.split("-");
      return `${monthNames[month - 1]} ${day}`;
    });

    const dateRangeForStatus = getDatesInRange(fromStatus, toStatus).map(
      (date) => {
        const [year, month, day] = date.split("-");
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
    const ordersQPWithMissingDates = dateRange.map((date) => {
      const existingData = ordersQP.find((item) => item.date === date);
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
    const ordersStatusWithMissingDates = dateRangeForStatus.map((date) => {
      const existingData = ordersStatus.find((item) => item.date === date);
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
      ordersCDWithMissingDates[country] = dateRange.map((date) => {
        const existingData = ordersArr.find((item) => item.date === date);
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
      sendError(res, 400, "Something went wrong");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetOrdersByCountry(req, res) {
  try {
    let { country, fromtime, totime } = req.headers;
    if (!country) sendError(res, 400, "Country must be provided");

    let countriesList = ["Australia", "Denmark", "Finland", "Norway", "Sweden"];

    let query = { type: { $ne: "Test" } };

    if (fromtime || totime) {
      query.createdAt = {};
      if (fromtime) {
        // Set the $gte filter for the start of the day
        query.createdAt.$gte = new Date(ddMmYyyyToIsoDate(fromtime));
      }
      if (totime) {
        // Set the $lte filter for the end of the day
        const toTimeDate = new Date(ddMmYyyyToIsoDate(totime));
        toTimeDate.setHours(23, 59, 59, 999); // Set to end of the day
        query.createdAt.$lte = toTimeDate;
      }
    }

    let countryFilter = country;
    if (country == "Others") countryFilter = { $nin: countriesList };

    const clientsAll = await Client.find(
      { country: countryFilter },
      { client_code: 1, country: 1 },
    );

    let returnData = {
      details: [],
      totalFiles: 0,
    };

    // Create an array of promises for Order.find operations
    const promises = clientsAll.map((clientData) => {
      return Order.find({ ...query, client_code: clientData.client_code })
        .lean()
        .then((ordersOfClient) => {
          if (ordersOfClient.length === 0) return;

          ordersOfClient.forEach((data) => {
            returnData.details.push({ ...data, country: clientData.country });
            returnData.totalFiles += data.quantity;
          });
        });
    });

    Promise.all(promises)
      .then(() => {
        res.status(200).json(returnData);
      })
      .catch((error) => {
        console.log(error);
        sendError(res, 400, "Something went wrong");
      });
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}




export default async function handle(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      if (req.headers.getallorders) {
        await handleGetAllOrderPaginated(req, res);
      } else if (req.headers.getonlytime) {
        await handleGetOnlyTime(req, res);
      } else if (req.headers.deleteorder) {
        await handleDeleteOrder(req, res);
      } else if (req.headers.getordersbyfilter) {
        await handleGetOrdersByFilter(req, res);
      } else if (req.headers.getordersunfinished) {
        await handleGetOrdersUnFinished(req, res);
      } else if (req.headers.getordersredo) {
        await handleGetOrdersRedo(req, res);
      } else if (req.headers.finishorder) {
        await handleFinishOrder(req, res);
      } else if (req.headers.redoorder) {
        await handleRedoOrder(req, res);
      } else if (req.headers.getordersbyid) {
        await handleGetOrdersById(req, res);
      } else if (req.headers.gettimeperiods) {
        await handleGetTimePeriods(req, res);
      } else if (req.headers.getallordersofclient) {
        await handleGetAllOrdersOfClient(req, res);
      } else if (req.headers.getordersbyfilterstat) {
        await handleGetOrdersByFilterStat(req, res);
      } else if (req.headers.getordersbycountry) {
        await handleGetOrdersByCountry(req, res);
      } else {
        sendError(res, 400, "Not a valid GET request");
      }
      break;

    case "POST":
      if (req.headers.editorder) {
        await handleEditOrder(req, res);
      } else {
        await handleNewOrder(req, res);
      }

      break;

    default:
      sendError(res, 400, "Unknown request");
  }
}
