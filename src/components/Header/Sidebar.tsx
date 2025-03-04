'use client';

import { cn } from '@/lib/utils';
import {
  ChartNoAxesCombined,
  ChevronDown,
  FileSliders,
  FolderTree,
  LayoutList,
  Menu,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import Drawer from '../Drawer';

interface PropsType {
  className?: string | undefined;
  LogoutAction: () => Promise<void>;
}
const FilterButton: React.FC<PropsType> = props => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: session } = useSession();

  const userRole = session?.user.role;
  let pathname = usePathname();

  return (
    <div className={props.className}>
      <label
        className="font-bold cursor-pointer relative top-1"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={40} />
      </label>

      <Drawer title="Menu" isOpen={isOpen} setIsOpen={setIsOpen}>
        <nav className="flex flex-col space-y-1 overflow-y-scroll">
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
          <Link
            href="/browse"
            className={cn(
              'p-4 flex items-center',
              pathname == '/browse'
                ? 'bg-primary text-white'
                : 'hover:bg-gray-100',
              userRole === 'user' && 'hidden',
            )}
          >
            <FolderTree className="w-6 h-6 mr-2" />
            Browse
          </Link>

          <Link
            href="/file-flow"
            className={cn(
              'p-4 flex items-center',
              pathname == '/file-flow'
                ? 'bg-primary text-white'
                : 'hover:bg-gray-100',
              ['user', 'manager'].includes(userRole || '') && 'hidden',
            )}
          >
            <ChartNoAxesCombined className="w-6 h-6 mr-2" />
            File Flow
          </Link>

          <span
            className={cn(
              'p-4 flex items-center justify-between',
              pathname.includes('/admin/')
                ? 'bg-primary text-white'
                : 'hover:bg-gray-100',
              !['super', 'admin'].includes(userRole || '') && 'hidden',
            )}
            aria-controls="dropdown-example"
            data-collapse-toggle="dropdown-example"
          >
            <span className="flex items-center">
              <FileSliders className="w-6 h-6 mr-2" />
              <span>Admin</span>
            </span>
            <ChevronDown size={17} />
          </span>
          <ul id="dropdown-example" className="hidden pb-2 space-y-1">
            <li>
              <Link
                href="#"
                className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white"
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white"
              >
                Billing
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white"
              >
                Invoice
              </Link>
            </li>
          </ul>

          <Link
            href="/rules-and-regulations"
            className={cn(
              'p-4 flex items-center',
              pathname == '/rules-and-regulations'
                ? 'bg-primary text-white'
                : 'hover:bg-gray-100',
            )}
          >
            <svg
              className="w-6 h-6 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783" />
            </svg>
            Rules & Regulations
          </Link>
          <hr />
          <Link
            href="/my-account"
            className={cn(
              'p-4 flex items-center',
              pathname == '/my-account'
                ? 'bg-primary text-white'
                : 'hover:bg-gray-100',
            )}
          >
            <svg
              className="w-6 h-6 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m.256 7a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1zm3.63-4.54c.18-.613 1.048-.613 1.229 0l.043.148a.64.64 0 0 0 .921.382l.136-.074c.561-.306 1.175.308.87.869l-.075.136a.64.64 0 0 0 .382.92l.149.045c.612.18.612 1.048 0 1.229l-.15.043a.64.64 0 0 0-.38.921l.074.136c.305.561-.309 1.175-.87.87l-.136-.075a.64.64 0 0 0-.92.382l-.045.149c-.18.612-1.048.612-1.229 0l-.043-.15a.64.64 0 0 0-.921-.38l-.136.074c-.561.305-1.175-.309-.87-.87l.075-.136a.64.64 0 0 0-.382-.92l-.148-.045c-.613-.18-.613-1.048 0-1.229l.148-.043a.64.64 0 0 0 .382-.921l-.074-.136c-.306-.561.308-1.175.869-.87l.136.075a.64.64 0 0 0 .92-.382zM14 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0" />
            </svg>
            Account
          </Link>
          <p
            onClick={() => props.LogoutAction()}
            className={cn(
              'p-4 flex items-center hover:bg-gray-100 hover:cursor-pointer',
            )}
          >
            <svg
              className="w-6 h-6 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
              />
              <path
                fillRule="evenodd"
                d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
              />
            </svg>
            Logout
          </p>
        </nav>
      </Drawer>
    </div>
  );
};

export default FilterButton;
