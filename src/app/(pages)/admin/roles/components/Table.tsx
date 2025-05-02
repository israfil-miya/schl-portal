'use client';

import Badge from '@/components/Badge';
import ExtendableTd from '@/components/ExtendableTd';
import { fetchApi } from '@/lib/utils';
import { UserDataType } from '@/models/Users';

import Pagination from '@/components/Pagination';
import { cn } from '@/lib/utils';
import { RoleDataType } from '@/models/Roles';
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
import { validationSchema, RoleDataType as zod_RoleDataType } from '../schema';
import DeleteButton from './Delete';
import EditButton from './Edit';
import FilterButton from './Filter';

type RolesState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: RoleDataType[];
};

const Table: React.FC<{ usersData: UserDataType[] }> = props => {
  const [roles, setRules] = useState<RolesState>({
    pagination: {
      count: 0,
      pageCount: 0,
    },
    items: [] as RoleDataType[],
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
    name: '',
  });

  async function getAllRoles() {
    try {
      // setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/role?action=get-all-roles';
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
        setRules(response.data as RolesState);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving roles data');
    } finally {
      setLoading(false);
    }
  }

  async function getAllRolesFiltered() {
    try {
      // setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/role?action=get-all-roles';
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
        setRules(response.data as RolesState);
        setIsFiltered(true);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving roles data');
    } finally {
      setLoading(false);
    }
    return;
  }

  async function deleteRole(roleData: RoleDataType) {
    try {
      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/role?action=delete-role';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: roleData._id,
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Deleted the role successfully');
        if (!isFiltered) await getAllRoles();
        else await getAllRolesFiltered();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while deleting the role');
    }
    return;
  }

  // async function editUser(
  //   editedUserData: zod_UserDataType,
  //   previousUserData: zod_UserDataType,
  // ) {
  //   try {
  //     const parsed = validationSchema.safeParse(editedUserData);

  //     if (!parsed.success) {
  //       console.error(parsed.error.issues.map(issue => issue.message));
  //       toast.error('Invalid form data');
  //       return;
  //     }

  //     if (
  //       (session?.role.role === 'admin' &&
  //         ['super', 'admin'].includes(parsed.data.role)) ||
  //       (session?.role.db_id === parsed.data._id &&
  //         session?.role.role !== parsed.data.role)
  //     ) {
  //       toast.error("You don't have the permission to edit this role");
  //       return;
  //     }

  //     setLoading(true);

  //     let url: string =
  //       process.env.NEXT_PUBLIC_BASE_URL + '/api/role?action=edit-role';
  //     let options: {} = {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(parsed.data),
  //     };

  //     const response = await fetchApi(url, options);

  //     if (response.ok) {
  //       toast.success('Updated the role data');

  //       if (!isFiltered) await getAllRules();
  //       else await getAllRulesFiltered();
  //     } else {
  //       toast.error(response.data as string);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error('An error occurred while updating the role');
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  useEffect(() => {
    getAllRoles();
  }, []);

  useEffect(() => {
    if (prevPage.current !== 1 || page > 1) {
      if (roles?.pagination?.pageCount == 1) return;
      if (!isFiltered) getAllRoles();
      else getAllRolesFiltered();
    }
    prevPage.current = page;
  }, [page]);

  useEffect(() => {
    if (roles?.pagination?.pageCount !== undefined) {
      setPage(1);
      if (prevPageCount.current !== 0) {
        if (!isFiltered) getAllRolesFiltered();
      }
      if (roles) setPageCount(roles?.pagination?.pageCount);
      prevPageCount.current = roles?.pagination?.pageCount;
      prevPage.current = 1;
    }
  }, [roles?.pagination?.pageCount]);

  useEffect(() => {
    // Reset to first page when itemPerPage changes
    prevPageCount.current = 0;
    prevPage.current = 1;
    setPage(1);

    if (!isFiltered) getAllRoles();
    else getAllRolesFiltered();
  }, [itemPerPage]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
        <button
          onClick={() =>
            router.push(
              process.env.NEXT_PUBLIC_BASE_URL + '/admin/roles/create-role',
            )
          }
          className="flex justify-between items-center gap-2 rounded-md bg-primary hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-white px-3 py-2"
        >
          Add new role
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
            submitHandler={getAllRolesFiltered}
            setFilters={setFilters}
            filters={filters}
            className="w-full justify-between sm:w-auto"
          />
        </div>
      </div>

      {loading ? <p className="text-center">Loading...</p> : <></>}

      <div className="table-responsive text-nowrap text-base">
        {!loading &&
          (roles?.items?.length !== 0 ? (
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
                {roles?.items?.map((role, index) => (
                  <tr key={String(role._id)}>
                    <td>{index + 1 + itemPerPage * (page - 1)}</td>
                    <td className="text-wrap">{role.name}</td>
                    <ExtendableTd data={role?.description || ''} />

                    <td
                      className="text-center"
                      style={{ verticalAlign: 'middle' }}
                    >
                      <div className="inline-block">
                        <div className="flex gap-2">
                          <DeleteButton
                            roleData={role}
                            submitHandler={deleteRole}
                          />

                          {/* <EditButton
                            userData={role as unknown as zod_UserDataType}
                            employeesData={props.employeesData}
                            submitHandler={editUser}
                            loading={loading}
                          /> */}
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
                    No Rules To Show.
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
