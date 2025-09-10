import Employee from '@/models/Employees';
import {
  calculateSalaryComponents,
  getMonthsTillNow,
} from '@/utility/accountMatrics';
import { getTodayDate } from '@/utility/date';
import { NextRequest } from 'next/server';

export async function handleEditEmployee(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  const data = await req.json();
  try {
    const originalEmployee = await Employee.findById(data._id);
    const updatedEmployee = await Employee.findByIdAndUpdate(data._id, data, {
      new: true,
    });
    if (!updatedEmployee)
      return { data: 'Unable to update employee', status: 400 };
    if (!originalEmployee) return { data: 'Employee not found', status: 400 };

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
