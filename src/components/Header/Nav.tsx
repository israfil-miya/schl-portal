'use client';

import cn from '@/utility/cn';
import 'flowbite';
import { initFlowbite } from 'flowbite';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';

interface PropsType {
  msg?: string | undefined;
  className?: string | undefined;
}

const Nav: React.FC<PropsType> = props => {
  const { data: session } = useSession();

  let { msg = 'Welcome, ' + session?.user.real_name + '!' } = props;
  let pathname = usePathname();

  console.log(pathname);

  const userRole = session?.user.role;

  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <div
      className={`w-full flex flex-row align-middle items-center justify-between bg-black px-5 text-white ${props.className}`}
    >
      <div className="flex flex-row">
        <Link
          className={cn(
            'py-3 px-5',
            pathname == '/' ? 'bg-primary' : 'hover:opacity-90',
          )}
          href={'/'}
        >
          Tasks
        </Link>
        <Link
          className={cn(
            'py-3 px-5',
            pathname == '/browse' ? 'bg-primary' : 'hover:opacity-90',
            userRole === 'user' && 'hidden',
          )}
          href={'/browse'}
        >
          Browse
        </Link>
        <span
          role="button"
          id="adminDropdownButton"
          data-dropdown-toggle="adminDropdown"
          data-dropdown-trigger="hover"
          className={cn(
            'py-3 px-5 select-none',
            pathname.includes('/admin/') ? 'bg-primary' : 'hover:opacity-90',
            !['super', 'admin'].includes(userRole || '') && 'hidden',
          )}
        >
          <span className="flex gap-1 items-end align-bottom justify-between">
            <span>Admin</span>
            <ChevronDown size={17} />
          </span>
        </span>

        <div
          id="adminDropdown"
          className="z-10 hidden bg-black divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
        >
          <ul className="py-2 text-white" aria-labelledby="adminDropdownButton">
            <li>
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/admin/employees'}
              >
                Employees
              </Link>
            </li>
            <li>
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/admin/tasks'}
              >
                Tasks
              </Link>
            </li>
            <li>
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/admin/clients'}
              >
                Clients
              </Link>
            </li>
            <li>
              <span
                role="button"
                id="adminUsersDropdownButton"
                data-dropdown-toggle="adminUsersDropdown"
                data-dropdown-trigger="hover"
                data-dropdown-placement="right-start"
                className="block px-4 py-2 hover:bg-primary"
              >
                <span className="flex gap-1 items-end align-bottom justify-between">
                  <span>Users</span>
                  <ChevronRight size={17} />
                </span>
              </span>
              <div
                id="adminUsersDropdown"
                className="z-10 hidden bg-black divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
              >
                <ul
                  className="py-2 text-white"
                  aria-labelledby="adminUsersDropdownButton"
                >
                  <li>
                    <li>
                      <Link
                        className={cn('block px-4 py-2 hover:bg-primary')}
                        href={'/admin/users/roles'}
                      >
                        Manage Roles
                      </Link>
                    </li>
                  </li>
                  <li>
                    <Link
                      className={cn('block px-4 py-2 hover:bg-primary')}
                      href={'/admin/users'}
                    >
                      Manage Users
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>

        {/* <Link
          className={cn(
            'py-3 px-5',
            pathname == '/pending-followups'
              ? 'bg-primary'
              : 'hover:opacity-90',
          )}
          href={'/pending-followups'}
        >
          Pending Followups
        </Link>
        <Link
          className={cn(
            'py-3 px-5',
            pathname.includes('/notices') ? 'bg-primary' : 'hover:opacity-90',
          )}
          href={'/notices'}
        >
          Notices
        </Link>
        <Link
          className={cn(
            'py-3 px-5',
            pathname == '/rules-and-regulations'
              ? 'bg-primary'
              : 'hover:opacity-90',
          )}
          href={'/rules-and-regulations'}
        >
          Rules & Regulations
        </Link> */}
      </div>

      <span className="max-lg:hidden">{msg}</span>
    </div>
  );
};
export default Nav;
