'use client';

import Badge from '@/components/Badge';
import ExtendableTd from '@/components/ExtendableTd';
import { fetchApi } from '@/lib/utils';
import { EmployeeDataType } from '@/models/Employees';

import Pagination from '@/components/Pagination';
import { cn } from '@/lib/utils';
import { UserDataType } from '@/models/Users';
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  ClipboardCopy,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'nextjs-toploader/app';
import React, { use, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { validationSchema, UserDataType as zod_UserDataType } from '../schema';
import DeleteButton from './Delete';
import EditButton from './Edit';
import FilterButton from './Filter';

type UsersState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: UserDataType[];
};

const Table: React.FC<{ employeesData: EmployeeDataType[] }> = props => {
  const [users, setUsers] = useState<UsersState>({
    pagination: {
      count: 0,
      pageCount: 0,
    },
    items: [] as UserDataType[],
  });

  const router = useRouter();

  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(0);
  const [itemPerPage, setItemPerPage] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);

  const prevPageCount = useRef<number>(0);
  const prevPage = useRef<number>(1);

  const { data: session } = useSession();

  const [filters, setFilters] = useState({
    role: '',
    generalSearchString: '',
  });

  async function getAllUsers() {
    try {
      // setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/user?action=get-all-users';
      let options: {} = {
        method: 'POST',
        headers: {
          filtered: false,
          paginated: true,
          items_per_page: itemPerPage,
          page: page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setUsers(response.data as UsersState);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving users data');
    } finally {
      setLoading(false);
    }
  }

  async function getAllUsersFiltered() {
    try {
      // setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/user?action=get-all-users';
      let options: {} = {
        method: 'POST',
        headers: {
          filtered: true,
          paginated: true,
          items_per_page: itemPerPage,
          page: !isFiltered ? 1 : page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filters,
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setUsers(response.data as UsersState);
        setIsFiltered(true);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving users data');
    } finally {
      setLoading(false);
    }
    return;
  }

  async function deleteUser(userData: UserDataType) {
    try {
      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/approval?action=new-request';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_model: 'User',
          action: 'delete',
          object_id: userData._id,
          deleted_data: userData,
          req_by: session?.user.db_id,
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Request sent for approval');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while sending request for approval');
    }
    return;
  }

  async function editUser(
    editedUserData: zod_UserDataType,
    previousUserData: zod_UserDataType,
  ) {
    try {
      const parsed = validationSchema.safeParse(editedUserData);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      if (
        (session?.user.role === 'admin' &&
          ['super', 'admin'].includes(parsed.data.role)) ||
        (session?.user.db_id === parsed.data._id &&
          session?.user.role !== parsed.data.role)
      ) {
        toast.error("You don't have the permission to edit this user");
        return;
      }

      setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/user?action=edit-user';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed.data),
      };

      const response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Updated the user data');

        if (!isFiltered) await getAllUsers();
        else await getAllUsersFiltered();
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating the user');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAllUsers();
  }, []);

  useEffect(() => {
    // if (prevPage.current !== 1 || page > 1) {
    if (users?.pagination?.pageCount == 1) return;
    if (!isFiltered) getAllUsers();
    else getAllUsersFiltered();
    // }
    prevPage.current = page;
  }, [page]);

  useEffect(() => {
    if (users?.pagination?.pageCount !== undefined) {
      setPage(1);
      if (prevPageCount.current !== 0) {
        if (!isFiltered) getAllUsersFiltered();
      }
      if (users) setPageCount(users?.pagination?.pageCount);
      prevPageCount.current = users?.pagination?.pageCount;
      prevPage.current = 1;
    }
  }, [users?.pagination?.pageCount]);

  useEffect(() => {
    // Reset to first page when itemPerPage changes
    prevPageCount.current = 0;
    prevPage.current = 1;
    setPage(1);

    // if (!isFiltered) getAllUsers();
    // else getAllUsersFiltered();
  }, [itemPerPage]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
        <button
          onClick={() =>
            router.push(
              process.env.NEXT_PUBLIC_BASE_URL + '/admin/users/create-user',
            )
          }
          className="flex justify-between items-center gap-2 rounded-md bg-primary hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-white px-3 py-2"
        >
          Add new user
          <CirclePlus size={18} />
        </button>
        <div className="items-center flex gap-2">
          <Pagination
            page={page}
            pageCount={pageCount}
            setPage={setPage}
            isLoading={loading}
          />

          <select
            value={itemPerPage}
            onChange={e => setItemPerPage(parseInt(e.target.value))}
            // defaultValue={30}
            required
            className="appearance-none cursor-pointer px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          >
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <FilterButton
            loading={loading}
            submitHandler={getAllUsersFiltered}
            setFilters={setFilters}
            filters={filters}
            className="w-full justify-between sm:w-auto"
          />
        </div>
      </div>

      {loading ? <p className="text-center">Loading...</p> : <></>}

      <div className="table-responsive text-nowrap text-base">
        {!loading &&
          (users?.items?.length !== 0 ? (
            <table className="table border table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>S/N</th>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Comment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users?.items?.map((user, index) => (
                  <tr
                    key={String(user._id)}
                    className={cn(
                      session?.user.role === 'admin' &&
                        (user.role === 'admin' || user.role === 'super') &&
                        'hidden',
                    )}
                  >
                    <td>{index + 1 + itemPerPage * (page - 1)}</td>
                    <td className="text-wrap">{user.real_name}</td>
                    <td className="text-wrap">{user.name}</td>
                    <td
                      // className="text-center"
                      style={{ verticalAlign: 'middle' }}
                    >
                      <Badge value={user.role} className="text-sm uppercase" />
                    </td>
                    <ExtendableTd data={user?.comment || ''} />

                    <td
                      className="text-center"
                      style={{ verticalAlign: 'middle' }}
                    >
                      <div className="inline-block">
                        <div className="flex gap-2">
                          <DeleteButton
                            userData={user}
                            submitHandler={deleteUser}
                          />

                          <EditButton
                            userData={user as unknown as zod_UserDataType}
                            employeesData={props.employeesData}
                            submitHandler={editUser}
                            loading={loading}
                          />

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${user.name} ${user.password}`,
                              );
                              toast.info('Copied to clipboard', {
                                position: 'bottom-right',
                              });
                            }}
                            className={cn(
                              'rounded-md bg-orange-600 hover:opacity-90 hover:ring-2 hover:ring-orange-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center',
                              session?.user.role === 'admin' &&
                                (user.role === 'admin' ||
                                  user.role === 'super') &&
                                'hidden',
                            )}
                          >
                            <ClipboardCopy size={18} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="table border table-bordered table-striped">
              <tbody>
                <tr key={0}>
                  <td className="align-center text-center text-wrap">
                    No Users To Show.
                  </td>
                </tr>
              </tbody>
            </table>
          ))}
      </div>
      <style jsx>
        {`
          th,
          td {
            padding: 2.5px 10px;
          }
        `}
      </style>
    </>
  );
};

export default Table;
