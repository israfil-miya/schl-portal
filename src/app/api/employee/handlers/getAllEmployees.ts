import { isEmployeePermanent } from '@/lib/utils';
import Employee, { EmployeeDataType } from '@/models/Employees';
import { addIfDefined, createRegexQuery } from '@/utility/filterHelpers';
import moment from 'moment-timezone';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

export interface RegexQuery {
  $regex: string;
  $options: string;
}

export interface Query {
  joining_date?: { $gte?: string; $lte?: string; $lt?: string; $gt?: string };
  blood_group?: string;
  $or?: { [key: string]: RegexQuery }[];
}

interface PaginatedData<ItemsType> {
  pagination: { count: number; pageCount: number };
  items: ItemsType;
}

export async function handleGetAllEmployees(req: NextRequest): Promise<{
  data: string | PaginatedData<EmployeeDataType[]>;
  status: number;
}> {
  try {
    const headersList = await headers();
    const page = Number(headersList.get('page')) || 1;
    const ITEMS_PER_PAGE = Number(headersList.get('items_per_page')) || 30;
    const isFilter = headersList.get('filtered') === 'true';
    const paginated = headersList.get('paginated') === 'true';
    const filters = await req.json();
    const { bloodGroup, serviceTime, generalSearchString } = filters;
    const query: Query = {};
    addIfDefined(query, 'blood_group', bloodGroup);
    if (serviceTime) {
      const [year, month, date] = moment()
        .utc()
        .format('YYYY-MM-DD')
        .split('-');
      switch (serviceTime) {
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
      }
    }
    const searchQuery: Query = { ...query };
    let sortQuery: Record<string, 1 | -1> = { priority: 1, e_id: 1 };
    if (!query && isFilter && !generalSearchString)
      return { data: 'No filter applied', status: 400 };
    const skip = (page - 1) * ITEMS_PER_PAGE;
    if (generalSearchString) {
      searchQuery['$or'] = [
        { e_id: createRegexQuery(generalSearchString.trim(), true)! },
        {
          company_provided_name: createRegexQuery(generalSearchString.trim())!,
        },
        { real_name: createRegexQuery(generalSearchString.trim())! },
        { nid: createRegexQuery(generalSearchString.trim(), true)! },
      ];
    }
    const count = await Employee.countDocuments(searchQuery);
    let employees: any;
    const pipeline = [
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
    ];
    if (paginated)
      employees = await Employee.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: ITEMS_PER_PAGE },
      ]);
    else employees = await Employee.aggregate(pipeline);
    const pageCount = Math.ceil(count / ITEMS_PER_PAGE);
    if (!employees)
      return { data: 'Unable to retrieve employees', status: 400 };
    return {
      data: { pagination: { count, pageCount }, items: employees },
      status: 200,
    };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
