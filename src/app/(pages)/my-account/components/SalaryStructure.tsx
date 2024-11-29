'use client';
import HiddenText from '@/components/HiddenText';
import {
  calculateSalaryComponents,
  getPFMoneyAmount,
  SalaryStructureType,
} from '@/utility/accountMatrics';
import React, { useEffect, useState } from 'react';

interface OverviewProps {
  employeeInfo: any;
  isLoading: boolean;
}

const Overview: React.FC<OverviewProps> = props => {
  let { employeeInfo, isLoading } = props;

  const [salaryStructure, setSalaryStructure] = useState<SalaryStructureType>({
    base: 0,
    houseRent: 0,
    convAllowance: 0,
    grossSalary: 0,
  });

  const [pfAmount, setPfAmount] = useState<number>(0);

  useEffect(() => {
    if (!isLoading && employeeInfo?._id) {
      setSalaryStructure(calculateSalaryComponents(employeeInfo.gross_salary));
    }
  }, [employeeInfo.gross_salary]);

  useEffect(() => {
    if (!isLoading && employeeInfo?._id) {
      setPfAmount(getPFMoneyAmount(salaryStructure, employeeInfo));
    }
  }, [salaryStructure.base]);

  return (
    <>
      {isLoading || !employeeInfo._id ? (
        <p className="text-center px-10 py-2 bg-gray-50 border-2 border-gray-100">
          Loading...
        </p>
      ) : null}
      {!isLoading && employeeInfo?._id && (
        <div className="px-10 py-6 bg-gray-50 border-2 border-gray-100">
          <h1 className="text-center underline underline-offset-4 text-2xl font-semibold mb-2">
            Salary Structure
          </h1>

          <div className="flex flex-col text-lg font-mono">
            <div className="flex flex-row items-center">
              <p className="text-nowrap pr-4 font-semibold">Basic</p>
              <div className="border-[1px] border-dashed border-gray-300 w-full h-0 "></div>
              <p className="text-nowrap pl-4 underline">
                <HiddenText className="w-5 h-5">
                  {salaryStructure.base?.toLocaleString('en-US') + ' BDT'}
                </HiddenText>
              </p>
            </div>
            <div className="flex flex-row items-center">
              <p className="text-nowrap pr-4 font-semibold">House Rent</p>
              <div className="border-[1px] border-dashed border-gray-300 w-full h-0 "></div>
              <p className="text-nowrap pl-4 underline">
                <HiddenText className="w-5 h-5">
                  {salaryStructure.houseRent?.toLocaleString('en-US') + ' BDT'}
                </HiddenText>
              </p>
            </div>
            <div className="flex flex-row items-center">
              <p className="text-nowrap pr-4 font-semibold">Conv. Allowance</p>
              <div className="border-[1px] border-dashed border-gray-300 w-full h-0 "></div>
              <p className="text-nowrap pl-4 underline">
                <HiddenText className="w-5 h-5">
                  {salaryStructure.convAllowance?.toLocaleString('en-US') +
                    ' BDT'}
                </HiddenText>
              </p>
            </div>
            <div className="flex flex-row items-center justify-end">
              <p className="text-nowrap pr-3 font-semibold">
                Monthly Gross Salary:{' '}
              </p>
              <p className="text-nowrap underline">
                <HiddenText className="w-5 h-5">
                  {salaryStructure.grossSalary?.toLocaleString('en-US') +
                    ' BDT'}
                </HiddenText>
              </p>
            </div>
          </div>

          <div className="flex justify-between mt-6 text-lg font-mono">
            <div className="flex flex-col">
              <h2 className="underline underline-offset-[3px] text-xl font-semibold mb-1">
                Provident Fund (PF):
              </h2>
              <div className="flex flex-col gap-1">
                <div className="gap-2 flex items-center">
                  <p className="text-nowrap">Your&apos;s Part:</p>
                  <input
                    disabled
                    className="border-2 border-gray-100 py-1 pl-3 w-full"
                    value={
                      employeeInfo?.pf_start_date
                        ? employeeInfo.provident_fund
                          ? pfAmount.toLocaleString('en-US') + ' BDT'
                          : 'N/A'
                        : 'N/A'
                    }
                  />
                </div>
                <div className="gap-2 flex items-center">
                  <p className="text-nowrap">Company&apos;s Part:</p>
                  <input
                    disabled
                    className="border-2 border-gray-100 py-1 pl-3 w-full"
                    value={
                      employeeInfo?.pf_start_date
                        ? employeeInfo.provident_fund
                          ? pfAmount.toLocaleString('en-US') + ' BDT'
                          : 'N/A'
                        : 'N/A'
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="underline underline-offset-[3px] text-xl font-semibold mb-1">
                Over Time (OT):
              </h2>

              <div className="gap-2 flex items-center">
                <p className="text-nowrap">Hourly:</p>
                <input
                  disabled
                  className="border-2 border-gray-100 py-1 pl-3"
                  value={Math.round(salaryStructure.base / 30 / 8) + ' BDT'}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Overview;
