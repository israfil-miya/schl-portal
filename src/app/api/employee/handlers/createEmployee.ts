import Employee from '@/models/Employees';
import { NextRequest } from 'next/server';

export async function handleCreateEmployee(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  const data = await req.json();
  try {
    const docCount = await Employee.countDocuments({ e_id: data.e_id });
    if (docCount > 0) {
      return { data: 'Employee with this id already exists', status: 400 };
    }
    const employeeData = await Employee.create(data);
    if (employeeData) {
      return { data: employeeData, status: 200 };
    }
    return { data: 'Unable to create employee', status: 400 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
