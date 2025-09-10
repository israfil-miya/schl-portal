import Employee, { EmployeeDataType } from '@/models/Employees';
import { NextRequest } from 'next/server';

export async function handleGetAllMarketers(
  req: NextRequest,
): Promise<{ data: EmployeeDataType[] | string; status: number }> {
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
