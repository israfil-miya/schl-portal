import { auth } from '@/auth';
import { dbConnect, getQuery, isEmployeePermanent } from '@/lib/utils';
import Employee, { EmployeeDataType } from '@/models/Employees';
import { getTodayDate } from '@/utility/date';
import {
  addBooleanField,
  addIfDefined,
  addRegexField,
  createRegexQuery,
} from '@/utility/filterHelpers';
import moment from 'moment-timezone';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

dbConnect();

export interface RegexQuery {
  $regex: string;
  $options: string;
}

export interface Query {
  joining_date?: { $gte?: string; $lte?: string; $lt?: string; $gt?: string };
  blood_group?: string;
  $or?: { [key: string]: RegexQuery }[];
}

// export type BooleanFields = Extract<
//   keyof Query,
//   | 'is_test'
//   | 'is_prospected'
//   | 'is_lead'
//   | 'followup_done'
//   | 'regular_client'
//   | 'permanent_client'
// >;
// export type RegexFields = Extract<
//   keyof Query,
//   'country' | 'company_name' | 'category' | 'marketer_name' | 'prospect_status'
// >;

async function handleCreateEmployee(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  const data = await req.json();

  try {
    const docCount = await Employee.countDocuments({ e_id: data.e_id });

    if (docCount > 0) {
      return { data: 'Employee with this id already exists', status: 400 };
    } else {
      const employeeData = await Employee.create(data);
      if (employeeData) {
        return { data: employeeData, status: 200 };
      } else {
        return { data: 'Unable to create employee', status: 400 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetAllEmployees(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const headersList = await headers();
    const page: number = Number(headersList.get('page')) || 1;
    const ITEMS_PER_PAGE: number =
      Number(headersList.get('items_per_page')) || 30;
    const isFilter: boolean = headersList.get('filtered') === 'true';
    const paginated: boolean = headersList.get('paginated') === 'true';

    const filters = await req.json();
    const { blood_group, service_time } = filters;

    const { generalSearchString } = filters;

    const query: Query = {};

    addIfDefined(query, 'blood_group', blood_group);

    if (service_time) {
      const [year, month, date] = moment()
        .utc()
        .format('YYYY-MM-DD')
        .split('-');

      switch (service_time) {
        case 'lessThan1Year':
          query['joining_date'] = {
            $gt: `${Number(year) - 1}-${month}-${date}`,
          };
          break;
        case 'atLeast1Year':
          query['joining_date'] = {
            $lte: `${Number(year) - 1}-${month}-${date}`,
          };
          break;
        case 'atLeast2Years':
          query['joining_date'] = {
            $lte: `${Number(year) - 2}-${month}-${date}`,
          };
          break;
        case 'atLeast3Years':
          query['joining_date'] = {
            $lte: `${Number(year) - 3}-${month}-${date}`,
          };
          break;
        case 'moreThan3Years':
          query['joining_date'] = {
            $lt: `${Number(year) - 3}-${month}-${date}`,
          };
          break;
        default:
          console.warn(`Invalid service time option: ${service_time}`);
          break;
      }
    }

    const searchQuery: Query = { ...query };

    let sortQuery: Record<string, 1 | -1> = {
      priority: 1,
      e_id: 1,
    };

    if (!query && isFilter == true && !generalSearchString) {
      return { data: 'No filter applied', status: 400 };
    } else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      if (generalSearchString) {
        searchQuery['$or'] = [
          { e_id: createRegexQuery(generalSearchString.trim(), true)! },
          {
            company_provided_name: createRegexQuery(
              generalSearchString.trim(),
            )!,
          },
          { real_name: createRegexQuery(generalSearchString.trim())! },
          { nid: createRegexQuery(generalSearchString.trim(), true)! },
        ];
      }

      const count: number = await Employee.countDocuments(searchQuery);
      let employees: any;

      if (paginated) {
        employees = await Employee.aggregate([
          { $match: searchQuery },
          {
            $addFields: {
              permanentInfo: isEmployeePermanent('$joining_date'),
              priority: {
                $switch: {
                  branches: [
                    { case: { $eq: ['$status', 'Active'] }, then: 1 },
                    { case: { $eq: ['$status', 'Inactive'] }, then: 2 },
                    { case: { $eq: ['$status', 'Fired'] }, then: 3 },
                    { case: { $eq: ['$status', 'Resigned'] }, then: 4 },
                  ],
                  default: 5,
                },
              },
            },
          },
          { $sort: sortQuery },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
        ]);
      } else {
        employees = await Employee.aggregate([
          { $match: searchQuery },
          {
            $addFields: {
              permanentInfo: isEmployeePermanent('$joining_date'),
              priority: {
                $switch: {
                  branches: [
                    { case: { $eq: ['$status', 'Active'] }, then: 1 },
                    { case: { $eq: ['$status', 'Inactive'] }, then: 2 },
                    { case: { $eq: ['$status', 'Fired'] }, then: 3 },
                    { case: { $eq: ['$status', 'Resigned'] }, then: 4 },
                  ],
                  default: 5,
                },
              },
            },
          },
          { $sort: sortQuery },
        ]);
      }

      const pageCount: number = Math.ceil(count / ITEMS_PER_PAGE);

      if (!employees) {
        return { data: 'Unable to retrieve employees', status: 400 };
      } else {
        const employeesData = {
          pagination: {
            count,
            pageCount,
          },
          items: employees,
        };

        return { data: employeesData, status: 200 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetEmployeeByName(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const { real_name } = await req.json();

    const resData = await Employee.findOne({ real_name: real_name }).lean();

    if (resData) {
      return { data: resData, status: 200 };
    } else {
      return { data: 'Employee not found', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

export async function POST(req: Request) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-all-employees':
      res = await handleGetAllEmployees(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'create-employee':
      res = await handleCreateEmployee(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-employee-by-name':
      res = await handleGetEmployeeByName(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: Request) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
