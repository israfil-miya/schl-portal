import React from 'react';
import Image from 'next/image';
import Timecards from './Timecards';
import LogOut from './Logout';
import SideNavBar from './Sidebar';
import LogoutAction from './Logout/LogoutAction';
import AccountButton from './Accountbutton';

const timezones: string[] = [
  'Europe/Paris',
  'Australia/Canberra',
  'America/New_York',
  'Europe/London',
  'Asia/Riyadh',
];

const Topbar: React.FC = () => {
  return (
    <div className="w-full bg-white align-middle items-center border-b-2 p-3 max-lg:px-3 max-lg:py-2 flex flex-row justify-between">
      <Image
        priority={true}
        src={'/images/logo-grey.png'}
        alt="logo"
        width={95}
        height={95}
      />

      <Timecards className="max-lg:hidden" timezones={timezones} />

      <SideNavBar LogoutAction={LogoutAction} className="block lg:hidden" />

      <div className="max-lg:hidden flex gap-2">
        <AccountButton />
        <LogOut />
      </div>
    </div>
  );
};

export default Topbar;
