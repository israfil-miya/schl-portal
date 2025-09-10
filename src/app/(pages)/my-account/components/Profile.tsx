'use client';

import HiddenText from '@/components/HiddenText';
import { cn, hasPerm } from '@/lib/utils';
import { EmployeeDataType } from '@/models/Employees';
import {
  calculateSalaryComponents,
  getPFMoneyAmount,
  SalaryStructureType,
} from '@/utility/accountMatrics';
import { Clock4, Coins, Mail } from 'lucide-react';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';

interface ProfilePropsTypes {
  avatarURI: string;
  employeeInfo: EmployeeDataType;
}

const Profile: React.FC<ProfilePropsTypes> = props => {
  const { employeeInfo, avatarURI } = props;

  const [salaryStructure, setSalaryStructure] = useState<SalaryStructureType>({
    base: 0,
    houseRent: 0,
    convAllowance: 0,
    grossSalary: 0,
  });

  const [pfAmount, setPfAmount] = useState<number>(0);

  const { data: session } = useSession();

  const userPermissions = useMemo(
    () => session?.user.permissions || [],
    [session?.user.permissions],
  );

  useEffect(() => {
    if (employeeInfo?._id) {
      setSalaryStructure(calculateSalaryComponents(employeeInfo.gross_salary));
    }
  }, [employeeInfo.gross_salary]);

  useEffect(() => {
    if (employeeInfo?._id) {
      setPfAmount(getPFMoneyAmount(salaryStructure, employeeInfo));
    }
  }, [salaryStructure.base]);

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <Image
            className="w-16 h-16 rounded-full flex items-center justify-center border"
            priority={false}
            src={avatarURI}
            width={100}
            height={100}
            alt="avatar"
          />
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              {employeeInfo.real_name}
              <span className="text-sm text-gray-500">
                ({employeeInfo.e_id})
              </span>
            </h1>
            <p className="text-gray-600">{employeeInfo.designation}</p>
          </div>
        </div>
        <div className="flex flex-col md:items-end">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail size={18} />
            <span className="text-sm">{employeeInfo.email}</span>
          </div>
          {hasPerm('settings:change_password', userPermissions) && (
            <Link
              href="/my-account/change-password"
              className="text-blue-600 text-sm hover:underline"
            >
              Change your password
            </Link>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">
            Joining Date
          </h2>
          <p className="text-lg font-semibold">
            {moment(employeeInfo.joining_date).format('Do MMM, YYYY')}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Department</h2>
          <p className="text-lg font-semibold">{employeeInfo.department}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Phone</h2>
          <p className="text-lg font-semibold">{employeeInfo.phone}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">
            Blood Group
          </h2>
          <p className="text-lg font-semibold">{employeeInfo.blood_group}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Status</h2>
          <p
            className={cn(
              `text-lg font-semibold`,
              employeeInfo.status === 'Active'
                ? 'text-green-500'
                : 'text-red-500',
            )}
          >
            {employeeInfo.status}
          </p>
        </div>
      </div>

      {/* Salary Structure */}
      <div className="bg-white rounded-lg border">
        <h2 className="text-lg font-semibold p-4 border-b">Salary Structure</h2>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Basic</span>
            <HiddenText>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {salaryStructure.base?.toLocaleString('en-US')}
                </span>
                <span className="text-gray-500">BDT</span>
              </div>
            </HiddenText>
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-gray-600">House Rent</span>
            <HiddenText>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {salaryStructure.houseRent?.toLocaleString('en-US')}
                </span>
                <span className="text-gray-500">BDT</span>
              </div>
            </HiddenText>
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-gray-600">Conv. Allowance</span>
            <HiddenText>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {salaryStructure.convAllowance?.toLocaleString('en-US')}
                </span>

                <span className="text-gray-500">BDT</span>
              </div>
            </HiddenText>
          </div>
          <div className="flex items-center justify-between border-t pt-4 font-semibold">
            <span>Monthly Gross Salary:</span>
            <HiddenText>
              <div className="flex items-center gap-2">
                <span>
                  {salaryStructure.grossSalary?.toLocaleString('en-US')}
                </span>
                <span className="text-gray-500">BDT</span>
              </div>
            </HiddenText>
          </div>
        </div>
      </div>

      {/* PF and OT Section */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b">
          Additional Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
          {/* Provident Fund */}
          <div className="p-4">
            <h3 className="text-md font-semibold mb-4 flex items-center">
              <Coins size={20} className="mr-2 text-blue-500" />
              Provident Fund (PF)
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="text-gray-600">Your Part:</span>
                <HiddenText>
                  <span className="font-medium">
                    {employeeInfo?.pf_start_date
                      ? employeeInfo.provident_fund
                        ? `${pfAmount.toLocaleString('en-US')}  BDT`
                        : 'N/A'
                      : 'N/A'}
                  </span>
                </HiddenText>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="text-gray-600">Company&apos;s Part:</span>
                <HiddenText>
                  <span className="font-medium">
                    {employeeInfo?.pf_start_date
                      ? employeeInfo.provident_fund
                        ? `${pfAmount.toLocaleString('en-US')}  BDT`
                        : 'N/A'
                      : 'N/A'}
                  </span>
                </HiddenText>
              </div>
            </div>
          </div>
          {/* Over Time */}
          <div className="p-4">
            <h3 className="text-md font-semibold mb-4 flex items-center">
              <Clock4 size={20} className="mr-2 text-green-500" />
              Over Time (OT)
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="text-gray-600">Hourly Rate:</span>
                <HiddenText>
                  <span className="font-medium">{`${Math.round(salaryStructure.base / 30 / 8)}  BDT`}</span>
                </HiddenText>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
