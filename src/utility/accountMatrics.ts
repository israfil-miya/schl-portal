export interface SalaryStructureType {
  base: number;
  houseRent: number;
  convAllowance: number;
  grossSalary: number;
}

const getMonthsTillNow = (dateString: string): number => {
  const dateParts = dateString.split('-');
  const givenYear = parseInt(dateParts[0]);
  const givenMonth = parseInt(dateParts[1]) - 1;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const totalYears = currentYear - givenYear;
  const totalMonths = totalYears * 12 + (currentMonth - givenMonth);

  // console.log(totalMonths);

  return totalMonths;
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

  // console.log("EMPLOYEEDATA: ", employeeData);

  if (employeeData.pf_history && employeeData.pf_history.length) {
    // console.log("EMPLOYEEDATA (IF): ", employeeData);

    totalSavedAmount =
      employeeData.pf_history[employeeData.pf_history.length - 1].saved_amount;
    const prevDate =
      employeeData.pf_history[employeeData.pf_history.length - 1].date;

    const newAmount = Math.round(
      baseSalary *
        (employeeData.provident_fund / 100 || 0) *
        getMonthsTillNow(prevDate),
    );

    totalSavedAmount += newAmount;
  } else {
    // console.log("EMPLOYEEDATA (ELSE): ", employeeData);

    const startDate = employeeData.pf_start_date;
    const newAmount = Math.round(
      baseSalary *
        (employeeData.provident_fund / 100 || 0) *
        getMonthsTillNow(startDate),
    );

    totalSavedAmount = newAmount;
  }

  // console.log("TOTAL AMOUNT: ", totalSavedAmount);
  return totalSavedAmount;
};

export { getMonthsTillNow, calculateSalaryComponents, getPFMoneyAmount };
