'use client';

import type { PermissionValue } from '@/app/(pages)/admin/roles/create-role/components/Form';
import { cn, hasAnyPerm, hasPerm } from '@/lib/utils';
import {
  Building,
  Building2,
  ChartBarBig,
  ChartNoAxesCombined,
  ChevronDown,
  CirclePause,
  FilePlus2,
  FileSliders,
  FlaskConical,
  FolderTree,
  KeyRound,
  LayoutList,
  Lightbulb,
  LogOutIcon,
  Map,
  Megaphone,
  Menu,
  ScrollText,
  ShieldUser,
  Signature,
  SquarePlus,
  SquareSigma,
  Table2,
  TableOfContents,
  UserCog,
  UserRoundPen,
  Users,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import Drawer from '../Drawer';

interface PropsType {
  className?: string | undefined;
  LogoutAction: () => Promise<void>;
}
const Sidebar: React.FC<PropsType> = props => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: session } = useSession();

  const userPermissions = (session?.user.permissions ||
    []) as PermissionValue[];
  // Permission helpers
  const has = (perm: PermissionValue) => hasPerm(perm, userPermissions);
  const hasAny = (perms: PermissionValue[]) =>
    hasAnyPerm(perms, userPermissions);

  let pathname = usePathname();

  const router = useRouter();

  const navLogoutHandler = async () => {
    await props.LogoutAction();
    router.push('/login');
  };

  return (
    <div className={props.className}>
      <label
        htmlFor="sidebar-toggle"
        className="font-bold cursor-pointer relative top-1"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={40} />
      </label>

      <Drawer id="sidebar" title="Menu" isOpen={isOpen} setIsOpen={setIsOpen}>
        <nav className="flex flex-col space-y-1 overflow-y-scroll">
          {has('task:view_page') && (
            <Link
              href="/"
              className={cn(
                'p-4 flex items-center',
                pathname == '/' ? 'bg-primary text-white' : 'hover:bg-gray-100',
              )}
            >
              <LayoutList className="mr-2 w-6 h-6" />
              Tasks
            </Link>
          )}
          {has('browse:view_page') && (
            <Link
              href="/browse"
              className={cn(
                'p-4 flex items-center',
                pathname == '/browse'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100',
              )}
            >
              <FolderTree className="w-6 h-6 mr-2" />
              Browse
            </Link>
          )}

          {has('admin:view_page') && (
            <>
              <span
                className={cn(
                  'p-4 flex items-center justify-between',
                  pathname.includes('/admin/')
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100',
                )}
                aria-controls="dropdown-parent-1"
                data-collapse-toggle="dropdown-parent-1"
              >
                <span className="flex items-center">
                  <FileSliders className="w-6 h-6 mr-2" />
                  <span>Admin</span>
                </span>
                <ChevronDown size={17} />
              </span>
              <ul id="dropdown-parent-1" className="hidden pb-2 space-y-1">
                {hasAny(['admin:manage_client', 'admin:create_client']) && (
                  <li>
                    <Link
                      href="/admin/clients"
                      className="flex items-center w-full p-2 text-gray-900 transition duration-75 pl-11 group hover:bg-gray-100"
                    >
                      <Users className="w-6 h-6 mr-2" />
                      Clients
                    </Link>
                  </li>
                )}
                {has('admin:create_task') && (
                  <li>
                    <Link
                      href="/admin/tasks"
                      className="flex items-center w-full p-2 text-gray-900 transition duration-75 pl-11 group hover:bg-gray-100"
                    >
                      <FilePlus2 className="w-6 h-6 mr-2" />
                      Task
                    </Link>
                  </li>
                )}
                {has('admin:create_employee') && (
                  <li>
                    <Link
                      href="/admin/employees"
                      className="flex items-center w-full p-2 text-gray-900 transition duration-75 pl-11 group hover:bg-gray-100"
                    >
                      <Building className="w-6 h-6 mr-2" />
                      Employee
                    </Link>
                  </li>
                )}
                {has('admin:check_approvals') && (
                  <li>
                    <Link
                      href="/admin/approvals"
                      className="flex items-center w-full p-2 text-gray-900 transition duration-75 pl-11 group hover:bg-gray-100"
                    >
                      <Signature className="w-6 h-6 mr-2" />
                      Approvals
                    </Link>
                  </li>
                )}
                {hasAny([
                  'admin:create_role',
                  'admin:delete_role',
                  'admin:edit_user',
                  'admin:delete_user_approval',
                ]) && (
                  <li>
                    <span
                      className={cn(
                        'flex items-center justify-between w-full p-2 text-gray-900 transition duration-75 pl-11 group',
                        pathname.includes('/admin/users') ||
                          pathname.includes('/admin/roles')
                          ? 'bg-lime-100'
                          : 'hover:bg-gray-100',
                      )}
                      aria-controls="dropdown-1-1"
                      data-collapse-toggle="dropdown-1-1"
                    >
                      <span className="flex items-center">
                        <KeyRound className="w-6 h-6 mr-2" />
                        <span>Access & Permissions</span>
                      </span>
                      <ChevronDown size={17} />
                    </span>
                    <ul id="dropdown-1-1" className="hidden pb-2 space-y-1">
                      {hasAny([
                        'admin:edit_user',
                        'admin:delete_user_approval',
                      ]) && (
                        <li>
                          <Link
                            href="/admin/users"
                            className="flex items-center w-full p-2 text-gray-900 transition duration-75 pl-20 group2 hover:bg-gray-100"
                          >
                            <UserRoundPen className="w-6 h-6 mr-2" />
                            Users
                          </Link>
                        </li>
                      )}
                      {hasAny(['admin:create_role', 'admin:delete_role']) && (
                        <li>
                          <Link
                            href="/admin/roles"
                            className="flex items-center w-full p-2 text-gray-900 transition duration-75 pl-20 group2 hover:bg-gray-100"
                          >
                            <ShieldUser className="w-6 h-6 mr-2" />
                            Roles
                          </Link>
                        </li>
                      )}
                    </ul>
                  </li>
                )}
                {hasAny([
                  'notice:send_notice_production',
                  'notice:send_notice_marketers',
                ]) && (
                  <li>
                    <Link
                      href="/admin/notices"
                      className="flex items-center w-full p-2 text-gray-900 transition duration-75 pl-20 group2 hover:bg-gray-100"
                    >
                      <Megaphone className="w-6 h-6 mr-2" />
                      Notice
                    </Link>
                  </li>
                )}
              </ul>
            </>
          )}

          {has('accountancy:view_page') && (
            <>
              <span
                className={cn(
                  'p-4 flex items-center justify-between',
                  pathname.includes('/accountancy/')
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100',
                )}
                aria-controls="dropdown-parent-2"
                data-collapse-toggle="dropdown-parent-2"
              >
                <span className="flex items-center">
                  <SquareSigma className="w-6 h-6 mr-2" />
                  <span>Accountancy</span>
                </span>
                <ChevronDown size={17} />
              </span>
              <ul id="dropdown-parent-2" className="hidden pb-2 space-y-1">
                {has('accountancy:manage_employee') && (
                  <li>
                    <Link
                      href="/accountancy/employees"
                      className="flex items-center w-full p-2 text-gray-900 transition duration-75 pl-11 group hover:bg-gray-100"
                    >
                      <Building2 className="w-6 h-6 mr-2" />
                      Employees
                    </Link>
                  </li>
                )}
                {hasAny([
                  'accountancy:create_invoice',
                  'accountancy:download_invoice',
                ]) && (
                  <li>
                    <span
                      className={cn(
                        'flex items-center justify-between w-full p-2 text-gray-900 transition duration-75 pl-11 group',
                        pathname.includes('/accountancy/invoices')
                          ? 'bg-lime-100'
                          : 'hover:bg-gray-100',
                      )}
                      aria-controls="dropdown-2-1"
                      data-collapse-toggle="dropdown-2-1"
                    >
                      <span className="flex items-center">
                        <ScrollText className="w-6 h-6 mr-2" />
                        <span>Invoices</span>
                      </span>
                      <ChevronDown size={17} />
                    </span>
                    <ul id="dropdown-2-1" className="hidden pb-2 space-y-1">
                      {has('accountancy:download_invoice') && (
                        <li>
                          <Link
                            href="/accountancy/invoices"
                            className="flex items-center w-full p-2 text-gray-900 transition duration-75 pl-20 group2 hover:bg-gray-100"
                          >
                            <TableOfContents className="w-6 h-6 mr-2" />
                            View All
                          </Link>
                        </li>
                      )}
                      {has('accountancy:create_invoice') && (
                        <li>
                          <Link
                            href="/accountancy/invoices/create-invoice"
                            className="flex items-center w-full p-2 text-gray-900 transition duration-75 pl-20 group2 hover:bg-gray-100"
                          >
                            <SquarePlus className="w-6 h-6 mr-2" />
                            Create New
                          </Link>
                        </li>
                      )}
                      {has('accountancy:create_invoice') && (
                        <li>
                          <Link
                            href="/accountancy/invoices/invoice-tracker"
                            className="flex items-center w-full p-2 text-gray-900 transition duration-75 pl-20 group2 hover:bg-gray-100"
                          >
                            <Map className="w-6 h-6 mr-2" />
                            Track Invoices
                          </Link>
                        </li>
                      )}
                    </ul>
                  </li>
                )}
              </ul>
            </>
          )}

          {hasAny(['crm:view_reports', 'crm:check_client_request']) && (
            <>
              <span
                className={cn(
                  'p-4 flex items-center justify-between',
                  pathname.includes('/crm/')
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100',
                )}
                aria-controls="dropdown-parent-3"
                data-collapse-toggle="dropdown-parent-3"
              >
                <span className="flex items-center">
                  <Table2 className="w-6 h-6 mr-2" />
                  <span>CRM</span>
                </span>
                <ChevronDown size={17} />
              </span>
              <ul id="dropdown-parent-3" className="hidden pb-2 space-y-1">
                {has('crm:view_crm_stats') && (
                  <li>
                    <Link
                      href="/crm/statistics"
                      className="flex items-center w-full p-2 text-gray-900 transition duration-75 pl-11 group hover:bg-gray-100"
                    >
                      <ChartBarBig className="w-6 h-6 mr-2" />
                      Statistics
                    </Link>
                  </li>
                )}
                {has('crm:view_reports') && (
                  <>
                    <li>
                      <Link
                        href="/crm/trial-clients"
                        className="flex items-center w-full p-2 text-gray-900 transition duration-75 pl-11 group hover:bg-gray-100"
                      >
                        <FlaskConical className="w-6 h-6 mr-2" />
                        Trial Clients
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/crm/pending-prospects"
                        className="flex items-center w-full p-2 text-gray-900 transition duration-75 pl-11 group hover:bg-gray-100"
                      >
                        <CirclePause className="w-6 h-6 mr-2" />
                        Pending Prospects
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/crm/potential-leads"
                        className="flex items-center w-full p-2 text-gray-900 transition duration-75 pl-11 group hover:bg-gray-100"
                      >
                        <Lightbulb className="w-6 h-6 mr-2" />
                        Potential Leads
                      </Link>
                    </li>
                  </>
                )}
                {has('crm:check_client_request') && (
                  <li>
                    <Link
                      href="/crm/client-approvals"
                      className="flex items-center w-full p-2 text-gray-900 transition duration-75 pl-11 group hover:bg-gray-100"
                    >
                      <Signature className="w-6 h-6 mr-2" />
                      Client Approvals
                    </Link>
                  </li>
                )}
              </ul>
            </>
          )}

          {has('fileflow:view_page') && (
            <Link
              href="/file-flow"
              className={cn(
                'p-4 flex items-center',
                pathname == '/file-flow'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100',
              )}
            >
              <ChartNoAxesCombined className="w-6 h-6 mr-2" />
              File Flow
            </Link>
          )}

          {hasAny(['schedule:view_page', 'schedule:create_schedule']) && (
            <>
              <span
                className={cn(
                  'p-4 flex items-center justify-between',
                  pathname.includes('/work-schedule/')
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100',
                )}
                aria-controls="dropdown-parent-4"
                data-collapse-toggle="dropdown-parent-4"
              >
                <span className="flex items-center">
                  <Table2 className="w-6 h-6 mr-2" />
                  <span>Work Schedule</span>
                </span>
                <ChevronDown size={17} />
              </span>
              <ul id="dropdown-parent-4" className="hidden pb-2 space-y-1">
                {has('schedule:create_schedule') && (
                  <li>
                    <Link
                      href="/work-schedule/schedule-task"
                      className="flex items-center w-full p-2 text-gray-900 transition duration-75 pl-11 group hover:bg-gray-100"
                    >
                      <ChartBarBig className="w-6 h-6 mr-2" />
                      Schedule Task
                    </Link>
                  </li>
                )}
                {has('schedule:view_page') && (
                  <li>
                    <Link
                      href="/work-schedule/view-schedule"
                      className="flex items-center w-full p-2 text-gray-900 transition duration-75 pl-11 group hover:bg-gray-100"
                    >
                      <FlaskConical className="w-6 h-6 mr-2" />
                      View Schedule
                    </Link>
                  </li>
                )}
              </ul>
            </>
          )}

          {has('notice:view_notice') && (
            <Link
              href="/notices"
              className={cn(
                'p-4 flex items-center',
                pathname == '/notices'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100',
              )}
            >
              <Megaphone className="w-6 h-6 mr-2" />
              Notices
            </Link>
          )}

          <hr />

          {has('settings:view_page') && (
            <Link
              href="/protected?redirect=/my-account"
              className={cn(
                'p-4 flex items-center',
                pathname == '/my-account'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100',
              )}
            >
              <UserCog className="w-6 h-6 mr-2" />
              Account
            </Link>
          )}

          {/* Logout */}
          <span
            onClick={navLogoutHandler}
            className={cn(
              'p-4 flex items-center hover:bg-gray-100 hover:cursor-pointer',
            )}
          >
            <LogOutIcon className="w-6 h-6 mr-2" />
            Logout
          </span>
        </nav>
      </Drawer>
    </div>
  );
};

export default Sidebar;
