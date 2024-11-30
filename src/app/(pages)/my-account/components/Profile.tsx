'use client';

import { EmployeeDataType } from '@/models/Employees';
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import Overview from './Overview';
import SalaryStructure from './SalaryStructure';

interface ProfilePropsTypes {
  avatarURI: string;
  employeeInfo: EmployeeDataType;
}

const Profile: React.FC<ProfilePropsTypes> = props => {
  return (
    <div className="flex flex-col gap-4 font-mono">
      <Overview employeeInfo={props.employeeInfo} avatarURI={props.avatarURI} />
      <SalaryStructure employeeInfo={props.employeeInfo} />
    </div>
  );
};

export default Profile;
