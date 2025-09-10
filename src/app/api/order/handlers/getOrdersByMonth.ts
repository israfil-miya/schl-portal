import Client from '@/models/Clients';
import Invoice from '@/models/Invoices';
import Order, { OrderDataType } from '@/models/Orders';
import { getMonthRange } from '@/utility/date';
import {
  addIfDefined,
  addRegexField,
  createRegexQuery,
} from '@/utility/filterHelpers';
import moment from 'moment-timezone';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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

const DATE_FORMAT = {
  MONTH_YEAR: 'YYYY-MM',
  FULL_MONTH_YEAR: 'MMMM YYYY',
};

export const handleGetOrdersByMonth = async (
  req: NextRequest,
): Promise<{
  data: string | PaginatedData<ClientOrdersByMonth[]>;
  status: number;
}> => {
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
};
