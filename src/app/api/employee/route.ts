import { auth } from '@/auth';
import { dbConnect, getQuery, isEmployeePermanent } from '@/lib/utils';
import Employee, { EmployeeDataType } from '@/models/Employees';
import {
  calculateSalaryComponents,
  getMonthsTillNow,
} from '@/utility/accountMatrics';
import { getTodayDate } from '@/utility/date';
import {
  addBooleanField,
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

async function handleCreateEmployee(req: NextRequest): Promise<{
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

async function handleEditEmployee(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  const data = await req.json();

  try {
    const originalEmployee = await Employee.findById(data._id);

    const updatedEmployee = await Employee.findByIdAndUpdate(data._id, data, {
      new: true,
    });

    if (!updatedEmployee) {
      return { data: 'Unable to update employee', status: 400 };
    }

    if (!originalEmployee) {
      return { data: 'Employee not found', status: 400 };
    }

    const isGrossSalaryUpdated =
      updatedEmployee.gross_salary !== originalEmployee.gross_salary;
    const isProvidentFundUpdated =
      updatedEmployee.provident_fund !== originalEmployee.provident_fund;

    if (isGrossSalaryUpdated || isProvidentFundUpdated) {
      let totalSavedAmount = 0;

      if (originalEmployee.pf_history && originalEmployee.pf_history.length) {
        totalSavedAmount =
          originalEmployee.pf_history[originalEmployee.pf_history.length - 1]
            .saved_amount;
        const prevDate =
          originalEmployee.pf_history[originalEmployee.pf_history.length - 1]
            .date;

        const salaryComponents = calculateSalaryComponents(
          originalEmployee.gross_salary,
        );
        const newAmount = Math.round(
          salaryComponents.base *
            (originalEmployee.provident_fund / 100 || 0) *
            getMonthsTillNow(prevDate),
        );

        totalSavedAmount += newAmount;
      } else {
        const salaryComponents = calculateSalaryComponents(
          originalEmployee.gross_salary,
        );
        const startDate = originalEmployee.pf_start_date;
        const newAmount = Math.round(
          salaryComponents.base *
            (originalEmployee.provident_fund / 100 || 0) *
            getMonthsTillNow(startDate),
        );
        totalSavedAmount = newAmount;
      }

      updatedEmployee.pf_history.push({
        date: getTodayDate(),
        gross: originalEmployee.gross_salary || 0,
        provident_fund: originalEmployee.provident_fund || 0,
        saved_amount: totalSavedAmount || 0,
        note: isProvidentFundUpdated
          ? 'Provident fund percentage was updated.'
          : 'Gross salary was updated.',
      });

      await updatedEmployee.save();
    }

    return { data: updatedEmployee, status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetAllEmployees(req: NextRequest): Promise<{
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
        default:
          console.warn(`Invalid service time option: ${serviceTime}`);
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

      console.log('search query: ', searchQuery);

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

async function handleGetEmployeeByName(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const { real_name } = await req.json();

    const employee = await Employee.findOne({
      real_name: real_name,
    }).lean();

    if (employee) {
      return { data: employee, status: 200 };
    } else {
      return { data: 'Employee not found', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetAllMarketers(req: NextRequest): Promise<{
  data: EmployeeDataType[] | string;
  status: number;
}> {
  try {
    const marketers: any[] = await Employee.find({
      department: 'Marketing',
      status: 'Active',
    }).lean();

    return { data: marketers, status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

export async function POST(req: NextRequest) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-all-employees':
      res = await handleGetAllEmployees(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'create-employee':
      res = await handleCreateEmployee(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'edit-employee':
      res = await handleEditEmployee(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-employee-by-name':
      res = await handleGetEmployeeByName(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-all-marketers':
      res = await handleGetAllMarketers(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
