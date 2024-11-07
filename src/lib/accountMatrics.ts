import moment from 'moment-timezone';

export interface SalaryStructureType {
  base: number;
  houseRent: number;
  convAllowance: number;
  grossSalary: number;
}

const getMonthsTillNow = (dateString: string): number => {
  const givenDate = moment.tz(dateString, 'YYYY-MM-DD', 'Asia/Dhaka');
  const currentDate = moment.tz('Asia/Dhaka');
  return currentDate.diff(givenDate, 'months');
};

const calculateSalaryComponents = (
  grossSalary: number,
): SalaryStructureType => {
  const basePercentage = 68;
  const base = Math.floor((grossSalary * basePercentage) / 100);
  const houseRent = Math.floor(
    (grossSalary * (100 - basePercentage)) / 100 / 2,
  );
  const convAllowance = Math.floor(
    (grossSalary * (100 - basePercentage)) / 100 / 2,
  );

  return {
    base,
    houseRent,
    convAllowance,
    grossSalary,
  };
};

const getPFMoneyAmount = (
  salaryComponents: SalaryStructureType,
  employeeData: any,
): number => {
  let totalSavedAmount = 0;
  const baseSalary = salaryComponents.base || 0;

  if (employeeData.pf_history && employeeData.pf_history.length) {
    const lastRecord =
      employeeData.pf_history[employeeData.pf_history.length - 1];
    totalSavedAmount = lastRecord.saved_amount;

    const monthsSinceLastContribution = getMonthsTillNow(lastRecord.date);
    const newAmount = Math.round(
      baseSalary *
        (employeeData.provident_fund / 100 || 0) *
        monthsSinceLastContribution,
    );

    totalSavedAmount += newAmount;
  } else {
    const monthsSinceStart = getMonthsTillNow(employeeData.pf_start_date);
    totalSavedAmount = Math.round(
      baseSalary * (employeeData.provident_fund / 100 || 0) * monthsSinceStart,
    );
  }

  return totalSavedAmount;
};

export { calculateSalaryComponents, getMonthsTillNow, getPFMoneyAmount };
