'use client';

import { cn } from '@/lib/utils';

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

  let pathname = usePathname();

  const userRole = session?.user.role;
  const userPermissions = session?.user.permissions;

  // Use useEffect to safely initialize flowbite on the client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('flowbite').then(module => {
        module.initFlowbite();
      });
    }
  }, []);

  let { msg = 'Welcome, ' + session?.user.real_name + '!' } = props;

  return (
    <div
      className={cn(
        `w-full flex flex-row align-middle items-center justify-between bg-gray-900 px-5 text-white`,
        props.className,
      )}
    >
      <div className="flex flex-row">
        <Link
          className={cn(
            'py-3 px-5',
            pathname == '/' ? 'bg-primary' : 'hover:opacity-90',
            !userPermissions?.includes('task:view_page') && 'hidden',
          )}
          href={'/'}
        >
          Tasks
        </Link>
        <Link
          className={cn(
            'py-3 px-5',
            pathname == '/browse' ? 'bg-primary' : 'hover:opacity-90',
            !userPermissions?.includes('browse:view_page') && 'hidden',
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
            !userPermissions?.includes('admin:view_page') && 'hidden',
          )}
        >
          <span className="flex gap-1 items-center justify-between">
            <span>Admin</span>
            <ChevronDown size={17} />
          </span>
        </span>
        <div
          id="adminDropdown"
          className="z-10 hidden bg-gray-900 divide-y divide-gray-100 rounded-md shadow w-44"
        >
          <ul className="py-2 text-white" aria-labelledby="adminDropdownButton">
            <li
              className={cn(
                !userPermissions?.includes('admin:create_employee') && 'hidden',
              )}
            >
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/admin/employees'}
              >
                Employee
              </Link>
            </li>
            <li
              className={cn(
                !userPermissions?.includes('admin:create_task') && 'hidden',
              )}
            >
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/admin/tasks'}
              >
                Task
              </Link>
            </li>
            <li
              className={cn(
                !userPermissions?.some(item =>
                  ['admin:manage_client', 'admin:create_client'].includes(item),
                ) && 'hidden',
              )}
            >
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/admin/clients'}
              >
                Clients
              </Link>
            </li>
            <li
              className={cn(
                !userPermissions?.includes('admin:check_approvals') && 'hidden',
              )}
            >
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/admin/approvals'}
              >
                Approvals
              </Link>
            </li>
            <li
              className={cn(
                !userPermissions?.some(item =>
                  [
                    'admin:assign_role',
                    'admin:create_role',
                    'admin:delete_role',
                  ].includes(item),
                ) && 'hidden',
              )}
            >
              <span
                role="button"
                id="adminAccessDropdownButton"
                data-dropdown-toggle="adminAccessDropdown"
                data-dropdown-trigger="hover"
                data-dropdown-placement="right-start"
                className="block px-4 py-2 hover:bg-primary"
              >
                <span className="flex gap-1 items-end text-wrap align-bottom justify-between">
                  <span>Access & Permissions</span>
                  <ChevronRight size={17} />
                </span>
              </span>
              <div
                id="adminAccessDropdown"
                className="z-10 hidden bg-gray-900 divide-y divide-gray-100 rounded-md shadow w-44"
              >
                <ul
                  className="py-2 text-white"
                  aria-labelledby="adminAccessDropdownButton"
                >
                  <li>
                    <Link
                      className={cn('block px-4 py-2 hover:bg-primary')}
                      href={'/admin/users'}
                    >
                      Users
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={cn('block px-4 py-2 hover:bg-primary')}
                      href={'/admin/roles'}
                    >
                      Roles
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
                    <Link
                      className={cn('block px-4 py-2 hover:bg-primary')}
                      href={'/admin/notices/create-notice'}
                    >
                      Send New
                    </Link>
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
            !userPermissions?.includes('accountancy:view_page') && 'hidden',
          )}
        >
          <span className="flex gap-1 items-center justify-between">
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
            <li
              className={cn(
                !userPermissions?.includes('accountancy:manage_employee') &&
                  'hidden',
              )}
            >
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
                className={cn(
                  'block px-4 py-2 hover:bg-primary',
                  !userPermissions?.some(item =>
                    [
                      'accountancy:create_invoice',
                      'accountancy:download_invoice',
                    ].includes(item),
                  ) && 'hidden',
                )}
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
                  <li
                    className={cn(
                      !userPermissions?.includes(
                        'accountancy:create_invoice',
                      ) && 'hidden',
                    )}
                  >
                    <Link
                      className={cn('block px-4 py-2 hover:bg-primary')}
                      href={'/accountancy/invoices/create-invoice'}
                    >
                      Create New
                    </Link>
                  </li>
                  <li
                    className={cn(
                      !userPermissions?.includes(
                        'accountancy:download_invoice',
                      ) && 'hidden',
                    )}
                  >
                    <Link
                      className={cn('block px-4 py-2 hover:bg-primary')}
                      href={'/accountancy/invoices'}
                    >
                      View All
                    </Link>
                  </li>
                  <li
                    className={cn(
                      !userPermissions?.includes(
                        'accountancy:create_invoice',
                      ) && 'hidden',
                    )}
                  >
                    <Link
                      className={cn('block px-4 py-2 hover:bg-primary')}
                      href={'/accountancy/invoices/invoice-tracker'}
                      target="_blank"
                    >
                      Invoice Tracker
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

            !userPermissions?.some(item =>
              ['admin:crm:view_reports', 'crm:check_client_request'].includes(
                item,
              ),
            ) && 'hidden',
          )}
        >
          <span className="flex gap-1 items-center justify-between">
            <span>CRM</span>
            <ChevronDown size={17} />
          </span>
        </span>
        <div
          id="crmDropdown"
          className="z-10 hidden bg-gray-900 divide-y divide-gray-100 rounded-md shadow w-44"
        >
          <ul className="py-2 text-white" aria-labelledby="crmDropdownButton">
            <li
              className={cn(
                !userPermissions?.includes('crm:view_crm_stats') && 'hidden',
              )}
            >
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/crm/statistics'}
              >
                Statistics
              </Link>
            </li>
            <li
              className={cn(
                !userPermissions?.includes('crm:view_reports') && 'hidden',
              )}
            >
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/crm/trial-clients'}
              >
                Trial Clients
              </Link>
            </li>
            <li
              className={cn(
                !userPermissions?.includes('crm:view_reports') && 'hidden',
              )}
            >
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/crm/pending-prospects'}
              >
                Pending Prospects
              </Link>
            </li>
            <li
              className={cn(
                !userPermissions?.includes('crm:view_reports') && 'hidden',
              )}
            >
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/crm/potential-leads'}
              >
                Potential Leads
              </Link>
            </li>
            <li
              className={cn(
                !userPermissions?.includes('crm:check_client_request') &&
                  'hidden',
              )}
            >
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/crm/client-approvals'}
              >
                Client Approvals
              </Link>
            </li>
          </ul>
        </div>
        <Link
          className={cn(
            'py-3 px-5',
            pathname.includes('/file-flow') ? 'bg-primary' : 'hover:opacity-90',
            userPermissions?.includes('fileflow:view_page') && 'hidden',
          )}
          href={'/file-flow'}
        >
          File Flow
        </Link>
        <span
          role="button"
          id="scheduleDropdownButton"
          data-dropdown-toggle="scheduleDropdown"
          data-dropdown-trigger="hover"
          className={cn(
            'py-3 px-5 select-none',
            pathname.includes('/work-schedule/')
              ? 'bg-primary'
              : 'hover:opacity-90',
            userPermissions?.includes('schedule:view_page') && 'hidden',
          )}
        >
          <span className="flex gap-1 items-center justify-between">
            <span>Work Schedule</span>
            <ChevronDown size={17} />
          </span>
        </span>
        <div
          id="scheduleDropdown"
          className="z-10 hidden bg-gray-900 divide-y divide-gray-100 rounded-md shadow w-44"
        >
          <ul
            className="py-2 text-white"
            aria-labelledby="scheduleDropdownButton"
          >
            <li
              className={cn(
                !userPermissions?.includes('schedule:create_schedule') &&
                  'hidden',
              )}
            >
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/work-schedule/schedule-task'}
              >
                Schedule Task
              </Link>
            </li>
            <li
              className={cn(
                !userPermissions?.includes('schedule:view_page') && 'hidden',
              )}
            >
              <Link
                className={cn('block px-4 py-2 hover:bg-primary')}
                href={'/work-schedule/view-schedule'}
              >
                View Schedule
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <span className="max-lg:hidden">{msg}</span>
    </div>
  );
};
export default Nav;
