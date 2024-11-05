'use client';

import Link from '@/components/NextLink';
import { ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import cn from '@/utility/cn';

interface PropsType {
  msg?: string | undefined;
  className?: string | undefined;
}

const Nav: React.FC<PropsType> = props => {
  const { data: session } = useSession();
  const { msg = 'Welcome, ' + session?.user.real_name + '!' } = props;
  const pathname = usePathname();
  const userRole = session?.user.role;

  const isAdmin = ['super', 'admin'].includes(userRole || '');
  const isSuper = userRole === 'super';

  const NavLink = ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <Link
      className={cn(
        'py-3 px-5',
        pathname === href ? 'bg-primary' : 'hover:opacity-90',
        className,
      )}
      href={href}
    >
      {children}
    </Link>
  );

  return (
    <div
      className={cn(
        'w-full flex flex-row align-middle items-center justify-between bg-gray-900 px-5 text-white',
        props.className,
      )}
    >
      <div className="flex flex-row">
        <NavLink href="/">Tasks</NavLink>
        <NavLink href="/browse" className={cn(userRole === 'user' && 'hidden')}>
          Browse
        </NavLink>

        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'py-3 px-5 select-none',
                pathname.includes('/admin/')
                  ? 'bg-primary'
                  : 'hover:opacity-90',
              )}
            >
              <span className="flex gap-1 items-center">
                Admin
                <ChevronDown size={17} />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/admin/employees">Employees</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/tasks">Tasks</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/clients">Clients</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/approvals">Approvals</Link>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span className="flex gap-1 items-center">Users</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users/roles">Manage Roles</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users">Manage Users</Link>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span className="flex gap-1 items-center">Notices</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/notices/new">Send New</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/notices">View All</Link>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'py-3 px-5 select-none',
                pathname.includes('/accountancy/')
                  ? 'bg-primary'
                  : 'hover:opacity-90',
              )}
            >
              <span className="flex gap-1 items-center">
                Accountancy
                <ChevronDown size={17} />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/accountancy/employees">Employees</Link>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span className="flex gap-1 items-center">Invoices</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem asChild>
                    <Link href="/accountancy/invoices/new">Create New</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/accountancy/invoices">View All</Link>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {isSuper && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'py-3 px-5 select-none',
                pathname.includes('/crm/') ? 'bg-primary' : 'hover:opacity-90',
              )}
            >
              <span className="flex gap-1 items-center">
                CRM
                <ChevronDown size={17} />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/crm/statistics">Statistics</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/crm/trial-clients">Trial Clients</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/crm/pending-prospects">Pending Prospects</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/crm/potential-leads">Potential Leads</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/crm/regular-clients">Regular Clients</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <NavLink
          href="/file-flow"
          className={cn(userRole === 'user' && 'hidden')}
        >
          File Flow
        </NavLink>
      </div>

      <span className="max-lg:hidden">{msg}</span>
    </div>
  );
};

export default Nav;
