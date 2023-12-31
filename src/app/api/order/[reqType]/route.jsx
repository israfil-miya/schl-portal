import Order from "@/db/Orders";
import Client from "@/db/Clients";
import dbConnect from "@/lib/dbConnect";

import { ddMmYyyyToIsoDate } from "@/lib/utils";
import {
  prepareResponse,
  accessHeaders,
  getDatesInRange,
  getDateRange,
  calculateTimeDifference,
} from "@/lib/utils-api";

async function handleNewOrder(req) {
  try {
    const data = req.body;
    const orderData = await Order.create(data);

    if (orderData) {
      return prepareResponse(200, orderData);
    } else {
      return prepareResponse(400, "UNABLE TO CREATE NEW ORDER");
    }
  } catch (e) {
    console.error(e);
    return prepareResponse(400, "AN ERROR OCCURED");
  }
}

async function handleGetOrdersUnfinished(req) {
  try {
    const ordersData = await Order.find({
      status: { $nin: ["Finished", "Correction"] },
      type: { $ne: "Test" },
    }).lean();

    if (ordersData) {
      const sortedOrdersDataByTimeRemaining = ordersData
        .map((order) => ({
          ...order,
          timeDifference: calculateTimeDifference(
            order.delivery_date,
            order.delivery_bd_time,
          ),
        }))
        .sort((a, b) => a.timeDifference - b.timeDifference);

      return prepareResponse(200, sortedOrdersDataByTimeRemaining);
    } else {
      return prepareResponse(200, []);
    }
  } catch (e) {
    console.error(e);
    return prepareResponse(400, "AN ERROR OCCURED");
  }
}

async function handleGetOrdersRedo(req) {
  try {
    const ordersData = await Order.find({
      $or: [{ type: "Test" }, { status: "Correction" }],
      status: { $ne: "Finished" },
    }).lean();

    if (ordersData) {
      return prepareResponse(200, ordersData);
    } else {
      return prepareResponse(200, []);
    }
  } catch (e) {
    console.error(e);
    return prepareResponse(400, "AN ERROR OCCURED");
  }
}

async function handleGetAllOrders(req) {
  try {
    const ITEMS_PER_PAGE = parseInt(accessHeaders(req, ["itemsperpage"])) || 50;
    const page = accessHeaders(req, ["page"]) || 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const query = {};

    const pipeline = [
      { $match: query },
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
      { $sort: { customSortField: 1, createdAt: -1 } },
      { $skip: skip },
      { $limit: ITEMS_PER_PAGE },
    ];

    const count = await Order.estimatedDocumentCount(query);
    const pageCount = Math.ceil(count / ITEMS_PER_PAGE);

    const ordersData = await Order.aggregate(pipeline).exec();

    return prepareResponse(200, {
      pagination: {
        count,
        pageCount,
      },
      items: ordersData,
    });
  } catch (e) {
    console.error(e);
    return prepareResponse(400, "AN ERROR OCCURED");
  }
}

async function handleGetOrdersByFilter(req) {
  try {
    const { fromtime, totime, folder, clientcode, task, type, status } =
      accessHeaders(req, [
        "fromtime",
        "totime",
        "folder",
        "clientcode",
        "task",
        "type",
        "status",
      ]);
    const page = accessHeaders(req, ["page"]) || 1;
    const ITEMS_PER_PAGE = parseInt(accessHeaders(req, ["itemsperpage"])) || 50;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const NOT_PAGINATED = accessHeaders(req, ["notpaginated"]) || false;

    let query = {};
    if (status) query.status = status;
    if (folder) query.folder = folder;
    if (clientcode) query.client_code = clientcode;
    if (task) query.task = task;
    if (type) query.type = type;

    if (fromtime || totime) {
      query.createdAt = {};
      if (fromtime) {
        query.createdAt.$gte = new Date(ddMmYyyyToIsoDate(fromtime));
      }
      if (totime) {
        const toTimeDate = new Date(ddMmYyyyToIsoDate(totime));
        toTimeDate.setHours(23, 59, 59, 999); // Set to end of the day
        query.createdAt.$lte = toTimeDate;
      }
    }

    if (Object.keys(query).length === 0 && query.constructor === Object) {
      return prepareResponse(400, "NO FILTER APPLIED");
    } else {
      let pipeline = [
        { $match: query },
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
        { $sort: { customSortField: 1 } },
      ];

      if (!NOT_PAGINATED) {
        pipeline = [
          ...pipeline,
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
        ];
      } else {
        pipeline = [...pipeline, { $sort: { createdAt: 1 } }];
      }

      const count = await Order.estimatedDocumentCount(query);
      const pageCount = Math.ceil(count / ITEMS_PER_PAGE);

      const ordersData = await Order.aggregate(pipeline).exec();

      return prepareResponse(200, {
        pagination: {
          count,
          pageCount,
        },
        items: ordersData,
      });
    }
  } catch (e) {
    console.error(e);
    return prepareResponse(400, "AN ERROR OCCURED");
  }
}

async function handleGetTimeRemainingForOrders(req) {
  try {
    const ordersData = await Order.find(
      { status: { $nin: ["Finished", "Correction"] }, type: { $ne: "Test" } },
      { delivery_date: 1, delivery_bd_time: 1 },
    ).lean();

    if (ordersData) {
      const sortedOrdersDataByTimeRemaining = ordersData
        .map((order) => ({
          timeDifference: calculateTimeDifference(
            order.delivery_date,
            order.delivery_bd_time,
          ),
        }))
        .sort((a, b) => a.timeDifference - b.timeDifference);

      return prepareResponse(200, sortedOrdersDataByTimeRemaining);
    } else {
      return prepareResponse(200, []);
    }
  } catch (e) {
    console.error(e);
    return prepareResponse(400, "AN ERROR OCCURED");
  }
}

async function handleEditOrder(req) {
  try {
    let data = req.body;
    const updated_by = accessHeaders(req, ["updatedby"]);
    data = { ...data, updated_by };

    const orderData = await Order.findByIdAndUpdate(data._id, data, {
      new: true,
    });

    if (orderData) {
      return prepareResponse(200, orderData);
    } else {
      return prepareResponse(400, "UNABLE TO EDIT THE ORDER");
    }
  } catch (e) {
    console.error(e);
    return prepareResponse(400, "AN ERROR OCCURED");
  }
}

async function handleDeleteOrder(req) {
  try {
    let { id } = req.body;

    const orderData = await Order.findByIdAndDelete(id);

    if (orderData) {
      return prepareResponse(200, orderData);
    } else {
      return prepareResponse(400, "UNABLE TO DELETE THE ORDER");
    }
  } catch (e) {
    console.error(e);
    return prepareResponse(400, "AN ERROR OCCURED");
  }
}

async function handleFinishOrder(req) {
  try {
    let { id } = req.body;
    const updated_by = accessHeaders(req, ["updatedby"]);

    const orderData = await Order.findByIdAndUpdate(
      id,
      { status: "Finished", updated_by },
      {
        new: true,
      },
    );
    if (orderData) {
      return prepareResponse(200, orderData);
    } else {
      return prepareResponse(
        400,
        "UNABLE TO CHANGE THE ORDER STATUS TO FINISHED",
      );
    }
  } catch (e) {
    console.error(e);
    return prepareResponse(400, "AN ERROR OCCURED");
  }
}

async function handleRedoOrder(req) {
  try {
    let { id } = req.body;
    const updated_by = accessHeaders(req, ["updatedby"]);

    const orderData = await Order.findByIdAndUpdate(
      id,
      { status: "Correction", updated_by },
      {
        new: true,
      },
    );
    if (orderData) {
      return prepareResponse(200, orderData);
    } else {
      return prepareResponse(
        400,
        "UNABLE TO CHANGE THE ORDER STATUS TO CORRECTION",
      );
    }
  } catch (e) {
    console.error(e);
    return prepareResponse(400, "AN ERROR OCCURED");
  }
}

async function handleGetAllOrdersOfClient(req) {
  try {
    const { clientcode } = accessHeaders(req, ["clientcode"]);

    const ordersData = await Order.find({ client_code: clientcode });

    if (ordersData) {
      return prepareResponse(200, ordersData);
    } else {
      return prepareResponse(200, []);
    }
  } catch (e) {
    console.error(e);
    return prepareResponse(400, "AN ERROR OCCURED");
  }
}

async function handleGetOrdersByCountry(req) {
  try {
    let { country, fromtime, totime } = accessHeaders(req, [
      "country",
      "fromtime",
      "totime",
    ]);
    let countriesList = ["Australia", "Denmark", "Finland", "Norway", "Sweden"];

    if (!country) {
      return prepareResponse(400, "NO COUNTRY NAME PROVIDED");
    } else {
      let query = { type: { $ne: "Test" } };

      if (fromtime || totime) {
        query.createdAt = {};
        if (fromtime) {
          query.createdAt.$gte = new Date(ddMmYyyyToIsoDate(fromtime));
        }
        if (totime) {
          const toTimeDate = new Date(ddMmYyyyToIsoDate(totime));
          toTimeDate.setHours(23, 59, 59, 999);
          query.createdAt.$lte = toTimeDate;
        }
      }

      let countryFilter = country;
      if (country == "Others") countryFilter = { $nin: countriesList };

      const clientsData = await Client.find(
        { country: countryFilter },
        { client_code: 1, country: 1 },
      );

      let returnData = {
        details: [],
        totalFiles: 0,
      };

      clientsData.map((clientData) => {
        Order.find({ ...query, client_code: clientData.client_code })
          .lean()
          .then((ordersOfClient) => {
            if (ordersOfClient.length === 0) return;

            ordersOfClient.forEach((data) => {
              returnData.details.push({ ...data, country: clientData.country });
              returnData.totalFiles += data.quantity;
            });
          })
          .catch((e) => {
            console.error(e);
            return;
          });
      });

      return prepareResponse(200, returnData);
    }
  } catch (e) {
    console.error(e);
    return prepareResponse(400, "AN ERROR OCCURED");
  }
}

async function handleGetOrderById(req) {
  try {
    let { id } = accessHeaders(req, ["id"]);
    const orderData = await Order.findById(id).lean();

    if (orderData) {
      return prepareResponse(200, orderData);
    } else {
      return prepareResponse(400, "NO ORDER FOUND WITH THE ID");
    }
  } catch (e) {
    console.error(e);
    return prepareResponse(400, "AN ERROR OCCURED");
  }
}

async function handleGetOrdersByFilterForStatus(req) {
  try {
    const { fromtime, totime } = accessHeaders(req, ["fromtime", "totime"]);
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

    const fromStatus = getDateRange().from;
    const toStatus = getDateRange().to;

    const query = { type: { $ne: "Test" } };

    if (fromtime || totime) {
      query.createdAt = {};
      if (fromtime) {
        query.createdAt.$gte = new Date(ddMmYyyyToIsoDate(fromtime));
      }
      if (totime) {
        const toTimeDate = new Date(ddMmYyyyToIsoDate(totime));
        toTimeDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toTimeDate;
      }
    }

    const orders = await Order.find(query);
    const ordersForStatus = await Order.find({
      createdAt: {
        $gte: new Date(ddMmYyyyToIsoDate(fromStatus)),
        $lte: new Date(ddMmYyyyToIsoDate(toStatus)).setHours(23, 59, 59, 999),
      },
    });

    const mergeOrdersByDate = (orders) => {
      return orders.reduce((merged, order) => {
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

        merged[formattedDate].fileQuantity += order.quantity;
        merged[formattedDate].orderQuantity++;

        if (order.status !== "Finished") {
          merged[formattedDate].filePending += order.quantity;
          merged[formattedDate].orderPending++;
        }

        return merged;
      }, {});
    };

    const mergedOrders = mergeOrdersByDate(orders);
    const mergedOrdersStatus = mergeOrdersByDate(ordersForStatus);

    const initializeOrdersObject = () => {
      const countries = [
        "Australia",
        "Denmark",
        "Finland",
        "Norway",
        "Sweden",
        "Others",
      ];
      return countries.reduce((obj, country) => {
        obj[country] = [];
        return obj;
      }, {});
    };

    const generateZeroData = () => ({
      orderQuantity: 0,
      orderPending: 0,
      fileQuantity: 0,
      filePending: 0,
      isoDate: null,
    });

    const ordersDetails = initializeOrdersObject();
    const ordersCD = initializeOrdersObject();

    const clientsAll = await Client.find({}, { client_code: 1, country: 1 });

    const orderPromises = clientsAll.map(async (clientData) =>
      Order.find(
        { ...query, client_code: clientData.client_code },
        { createdAt: 1, quantity: 1 },
      ),
    );

    const ordersAll = await Promise.all(orderPromises);

    ordersAll.forEach((clientOrders, index) => {
      const clientData = clientsAll[index];
      const country = ordersDetails[clientData.country]
        ? clientData.country
        : "Others";
      if (!ordersDetails[country]) {
        ordersDetails[country] = [];
      }
      ordersDetails[country].push(...clientOrders);
    });

    for (const country in ordersDetails) {
      if (ordersDetails[country].length === 0) {
        delete ordersDetails[country];
      }
    }

    for (const [countryName, ordersArr] of Object.entries(ordersDetails)) {
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

    const ordersQP = Object.values(mergedOrders);
    const ordersStatus = Object.values(mergedOrdersStatus);

    const ordersQPWithMissingDates = dateRange.map((date) => {
      const existingData = ordersQP.find((item) => item.date === date);
      return existingData || { date, ...generateZeroData() };
    });

    const zeroDataStatus = generateZeroData();
    const ordersStatusWithMissingDates = dateRangeForStatus.map((date) => {
      const existingData = ordersStatus.find((item) => item.date === date);
      return existingData || { date, ...zeroDataStatus };
    });

    const zeroDataCD = generateZeroData();
    const ordersCDWithMissingDates = {};

    for (const [country, ordersArr] of Object.entries(ordersCD)) {
      ordersCDWithMissingDates[country] = dateRange.map((date) => {
        const existingData = ordersArr.find((item) => item.date === date);
        return existingData || { date, ...zeroDataCD };
      });
    }

    const returnData = {
      ordersQP: ordersQPWithMissingDates,
      ordersCD: ordersCDWithMissingDates,
      ordersStatus: ordersStatusWithMissingDates,
    };

    if (returnData) {
      return prepareResponse(200, returnData);
    } else {
      return prepareResponse(400, "UNABLE TO CREATE FILEFLOW STATUS DATA");
    }
  } catch (e) {
    console.error(e);
    return prepareResponse(400, "AN ERROR OCCURRED");
  }
}

export async function GET(req, { params }) {
  const reqType = params?.reqType; // access the request type from the link /api/user/<reqType>
  dbConnect();
  let res = { status: 500, message: "NO RESPONSE FROM SERVER" };

  switch (reqType) {
    case "getallorders":
      res = await handleGetAllOrders(req);
      return new Response(res.message, { status: res.status });
      break;

    case "gettimeremainingfororders":
      res = await handleGetTimeRemainingForOrders(req);
      return new Response(res.message, { status: res.status });
      break;

    case "getordersbyfilter":
      res = await handleGetOrdersByFilter(req);
      return new Response(res.message, { status: res.status });
      break;

    case "getordersunfinished":
      res = await handleGetOrdersUnfinished(req);
      return new Response(res.message, { status: res.status });
      break;

    case "getordersredo":
      res = await handleGetOrdersRedo(req);
      return new Response(res.message, { status: res.status });
      break;

    case "getallordersofclient":
      res = await handleGetAllOrdersOfClient(req);
      return new Response(res.message, { status: res.status });
      break;

    case "getordersbyfilterforstatus":
      res = await handleGetOrdersByFilterForStatus(req);
      return new Response(res.message, { status: res.status });
      break;

    case "getordersbycountry":
      res = await handleGetOrdersByCountry(req);
      return new Response(res.message, { status: res.status });
      break;

    case "getorderbyid":
      res = await handleGetOrderById(req);
      return new Response(res.message, { status: res.status });
      break;

    default:
      return new Response("UNKNOWN GET REQUEST", { status: 400 });
  }
}

export async function POST(req, { params }) {
  const reqType = params?.reqType; // access the request type from the link /api/user/<reqType>
  await dbConnect();
  let res = { status: 500, message: "NO RESPONSE FROM SERVER" };

  switch (reqType) {
    case "deleteorder":
      res = await handleDeleteOrder(req);
      return new Response(res.message, { status: res.status });
      break;

    case "redoorder":
      res = await handleRedoOrder(req);
      return new Response(res.message, { status: res.status });
      break;

    case "finishorder":
      res = await handleFinishOrder(req);
      return new Response(res.message, { status: res.status });
      break;

    case "editorder":
      res = await handleEditOrder(req);
      return new Response(res.message, { status: res.status });
      break;

    case "neworder":
      res = await handleNewOrder(req);
      return new Response(res.message, { status: res.status });
      break;

    default:
      return new Response("UNKNOWN POST REQUEST", { status: 400 });
  }
}
