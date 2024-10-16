'use client';
import cn from '@/utility/cn';
import { UserCog } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

interface PropsType {
  className?: string | undefined;
}

const AccountButton: React.FC<PropsType> = props => {
  let pathname = usePathname();
  const router = useRouter();

  return (
    <button
      onClick={() => router.replace('/my-account')}
      disabled={pathname === '/my-account'}
      type="button"
      className={cn(
        `flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 hover:opacity-90 hover:ring-4 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 text-white px-3 py-2`,
        props.className,
      )}
    >
      Account
      <UserCog size={18} />
    </button>
  );
};

export default AccountButton;
