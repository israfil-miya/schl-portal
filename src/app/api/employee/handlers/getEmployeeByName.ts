import Employee from '@/models/Employees';
import { NextRequest } from 'next/server';

export async function handleGetEmployeeByName(
  req: NextRequest,
): Promise<{ data: string | Object; status: number }> {
  try {
    const { real_name } = await req.json();
    const employee = await Employee.findOne({ real_name }).lean();
    if (employee) return { data: employee, status: 200 };
    return { data: 'Employee not found', status: 400 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
