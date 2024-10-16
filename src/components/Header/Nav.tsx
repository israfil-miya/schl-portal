'use client';

import cn from '@/utility/cn';
import 'flowbite';
import { initFlowbite } from 'flowbite';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
// import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import Link from '../NextLink';

interface PropsType {
  msg?: string | undefined;
  className?: string | undefined;
}

const Nav: React.FC<PropsType> = props => {
  const { data: session } = useSession();

  let { msg = 'Welcome, ' + session?.user.real_name + '!' } = props;
  let pathname = usePathname();

  const userRole = session?.user.role;

  useEffect(() => {
    if (typeof window !== 'undefined') initFlowbite();
  }, []);

  return (
    <div
      className={`w-full flex flex-row align-middle items-center justify-between bg-gray-900 px-5 text-white ${props.className}`}
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
          className="z-10 hidden bg-gray-900 divide-y divide-gray-100 rounded-md shadow w-44"
        >
          <ul className="py-2 text-white" aria-labelledby="adminDropdownButton">
            <li>
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/admin/employees'}
              >
                {/* without salary*/}
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
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/admin/approvals'}
              >
                Approvals
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
                className="z-10 hidden bg-gray-900 divide-y divide-gray-100 rounded-md shadow w-44"
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
            <li>
              <span
                role="button"
                id="adminNoticesDropdownButton"
                data-dropdown-toggle="adminNoticesDropdown"
                data-dropdown-trigger="hover"
                data-dropdown-placement="right-start"
                className="block px-4 py-2 hover:bg-primary"
              >
                <span className="flex gap-1 items-end align-bottom justify-between">
                  <span>Notices</span>
                  <ChevronRight size={17} />
                </span>
              </span>
              <div
                id="adminNoticesDropdown"
                className="z-10 hidden bg-gray-900 divide-y divide-gray-100 rounded-md shadow w-44"
              >
                <ul
                  className="py-2 text-white"
                  aria-labelledby="adminNoticesDropdownButton"
                >
                  <li>
                    <li>
                      <Link
                        className={cn('block px-4 py-2 hover:bg-primary')}
                        href={'/admin/notices/new'}
                      >
                        Send New
                      </Link>
                    </li>
                  </li>
                  <li>
                    <Link
                      className={cn('block px-4 py-2 hover:bg-primary')}
                      href={'/admin/notices'}
                    >
                      View All
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
        <span
          role="button"
          id="accountancyDropdownButton"
          data-dropdown-toggle="accountancyDropdown"
          data-dropdown-trigger="hover"
          className={cn(
            'py-3 px-5 select-none',
            pathname.includes('/accountancy/')
              ? 'bg-primary'
              : 'hover:opacity-90',
            !['super', 'admin'].includes(userRole || '') && 'hidden',
          )}
        >
          <span className="flex gap-1 items-end align-bottom justify-between">
            <span>Accountancy</span>
            <ChevronDown size={17} />
          </span>
        </span>
        <div
          id="accountancyDropdown"
          className="z-10 hidden bg-gray-900 divide-y divide-gray-100 rounded-md shadow w-44"
        >
          <ul
            className="py-2 text-white"
            aria-labelledby="accountancyDropdownButton"
          >
            <li>
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/accountancy/employees'}
              >
                {/* with salary */}
                Employees
              </Link>
            </li>
            <li>
              <span
                role="button"
                id="accountancyInvoicesDropdownButton"
                data-dropdown-toggle="accountancyInvoicesDropdown"
                data-dropdown-trigger="hover"
                data-dropdown-placement="right-start"
                className="block px-4 py-2 hover:bg-primary"
              >
                <span className="flex gap-1 items-end align-bottom justify-between">
                  <span>Invoices</span>
                  <ChevronRight size={17} />
                </span>
              </span>
              <div
                id="accountancyInvoicesDropdown"
                className="z-10 hidden bg-gray-900 divide-y divide-gray-100 rounded-md shadow w-44"
              >
                <ul
                  className="py-2 text-white"
                  aria-labelledby="accountancyInvoicesDropdownButton"
                >
                  <li>
                    <li>
                      <Link
                        className={cn('block px-4 py-2 hover:bg-primary')}
                        href={'/accountancy/invoices/new'}
                      >
                        Create New
                      </Link>
                    </li>
                  </li>
                  <li>
                    <Link
                      className={cn('block px-4 py-2 hover:bg-primary')}
                      href={'/accountancy/invoices'}
                    >
                      View All
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
        <span
          role="button"
          id="crmDropdownButton"
          data-dropdown-toggle="crmDropdown"
          data-dropdown-trigger="hover"
          className={cn(
            'py-3 px-5 select-none',
            pathname.includes('/crm/') ? 'bg-primary' : 'hover:opacity-90',
            userRole !== 'super' && 'hidden',
          )}
        >
          <span className="flex gap-1 items-end align-bottom justify-between">
            <span>CRM</span>
            <ChevronDown size={17} />
          </span>
        </span>
        <div
          id="crmDropdown"
          className="z-10 hidden bg-gray-900 divide-y divide-gray-100 rounded-md shadow w-44"
        >
          <ul className="py-2 text-white" aria-labelledby="crmDropdownButton">
            <li>
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/crm/statistics'}
              >
                Statistics
              </Link>
            </li>
            <li>
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/crm/trial-clients'}
              >
                Trial Clients
              </Link>
            </li>
            <li>
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/crm/pending-prospects'}
              >
                Pending Prospects
              </Link>
            </li>
            <li>
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/crm/potential-leads'}
              >
                Potential Leads
              </Link>
            </li>
            <li>
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/crm/regular-clients'}
              >
                Regular Clients
              </Link>
            </li>
          </ul>
        </div>
        <Link
          className={cn(
            'py-3 px-5',
            pathname == '/file-flow' ? 'bg-primary' : 'hover:opacity-90',
            userRole === 'user' && 'hidden',
          )}
          href={'/file-flow'}
        >
          File Flow
        </Link>
      </div>

      <span className="max-lg:hidden">{msg}</span>
    </div>
  );
};
export default Nav;
