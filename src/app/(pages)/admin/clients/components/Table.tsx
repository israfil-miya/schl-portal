'use client';

import ExtendableTd from '@/components/ExtendableTd';
import { cn, fetchApi, hasPerm } from '@/lib/utils';
import { UserDataType } from '@/models/Users';

import NoData, { Type } from '@/components/NoData';
import Pagination from '@/components/Pagination';
import { usePaginationManager } from '@/hooks/usePaginationManager';
import { ClientDataType } from '@/models/Clients';
import { ChevronLeft, ChevronRight, CirclePlus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'nextjs-toploader/app';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import {
  validationSchema,
  ClientDataType as zod_ClientDataType,
} from '../schema';
import DeleteButton from './Delete';
import EditButton from './Edit';
import FilterButton from './Filter';

type ClientsState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: ClientDataType[];
};

const Table: React.FC = () => {
  const [clients, setClients] = useState<ClientsState>({
    pagination: {
      count: 0,
      pageCount: 0,
    },
    items: [] as ClientDataType[],
  });

  const { data: session } = useSession();

  const userPermissions = useMemo(
    () => session?.user.permissions || [],
    [session?.user.permissions],
  );

  const router = useRouter();

  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(0);
  const [itemPerPage, setItemPerPage] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchVersion, setSearchVersion] = useState(0);

  const [filters, setFilters] = useState({
    marketerName: '',
    clientCode: '',
    contactPerson: '',
    countryName: '',
    category: '',
    generalSearchString: '',
  });

  const [marketerNames, setMarketerNames] = useState<string[]>([]);

  const getAllClients = useCallback(
    async (page: number, itemPerPage: number) => {
      try {
        // setLoading(true);

        let url: string =
          process.env.NEXT_PUBLIC_BASE_URL +
          '/api/client?action=get-all-clients';
        let options: {} = {
          method: 'POST',
          headers: {
            Accept: '*/*',
            filtered: false,
            paginated: true,
            items_per_page: itemPerPage,
            page: page,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            staleClient: true,
            regularClient: false,
            test: false,
          }),
        };

        let response = await fetchApi(url, options);

        if (response.ok) {
          setClients(response.data as ClientsState);
          setPageCount((response.data as ClientsState).pagination.pageCount);
        } else {
          toast.error(response.data as string);
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while retrieving clients data');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getAllClientsFiltered = useCallback(
    async (page: number, itemPerPage: number) => {
      try {
        // setLoading(true);

        let url: string =
          process.env.NEXT_PUBLIC_BASE_URL +
          '/api/client?action=get-all-clients';
        let options: {} = {
          method: 'POST',
          headers: {
            Accept: '*/*',
            filtered: true,
            paginated: true,
            items_per_page: itemPerPage,
            page: page,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...filters,
          }),
        };

        let response = await fetchApi(url, options);

        if (response.ok) {
          setClients(response.data as ClientsState);
          setIsFiltered(true);
          setPageCount((response.data as ClientsState).pagination.pageCount);
        } else {
          toast.error(response.data as string);
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while retrieving clients data');
      } finally {
        setLoading(false);
      }
      return;
    },
    [filters],
  );

  const deleteClient = async (clientData: ClientDataType) => {
    try {
      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/approval?action=new-request';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_model: 'Client',
          action: 'delete',
          object_id: clientData._id,
          deleted_data: clientData,
          req_by: session?.user.db_id,
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Request sent for approval');
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while sending request for approval');
    }
    return;
  };

  const getAllMarketers = async () => {
    try {
      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/user?action=get-all-marketers';
      let options: {} = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        let marketers = response.data as UserDataType[];
        let marketerNames = marketers.map(marketer => marketer.provided_name!);
        setMarketerNames(marketerNames);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving marketers data');
    }
  };

  const editClient = async (
    editedClientData: zod_ClientDataType,
    previousClientData: zod_ClientDataType,
  ) => {
    try {
      setLoading(true);
      const parsed = validationSchema.safeParse(editedClientData);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/client?action=edit-client';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          updated_by: session?.user.real_name,
        },
        body: JSON.stringify(parsed.data),
      };

      const response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Updated the client data');
        await fetchClients();
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating the client');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllMarketers();
  }, []);

  const fetchClients = useCallback(async () => {
    if (!isFiltered) {
      await getAllClients(page, itemPerPage);
    } else {
      await getAllClientsFiltered(page, itemPerPage);
    }
  }, [isFiltered, getAllClients, getAllClientsFiltered, page, itemPerPage]);

  usePaginationManager({
    page,
    itemPerPage,
    pageCount,
    setPage,
    triggerFetch: fetchClients,
  });

  useEffect(() => {
    if (searchVersion > 0 && isFiltered && page === 1) {
      fetchClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchVersion, isFiltered, page]);

  const handleSearch = useCallback(() => {
    setIsFiltered(true);
    setPage(1);
    setSearchVersion(v => v + 1);
  }, [setIsFiltered, setPage]);

  return (
    <>
      <div
        className={cn(
          'flex flex-col mb-4 gap-2',
          hasPerm('admin:create_client', userPermissions)
            ? 'sm:flex-row sm:justify-between'
            : 'sm:justify-end sm:flex-row',
        )}
      >
        {hasPerm('admin:create_client', userPermissions) && (
          <button
            onClick={() =>
              router.push(
                process.env.NEXT_PUBLIC_BASE_URL +
                  '/admin/clients/create-client',
              )
            }
            className="flex justify-between items-center gap-2 rounded-md bg-primary hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-white px-3 py-2"
          >
            Create new client
            <CirclePlus size={18} />
          </button>
        )}

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
            submitHandler={handleSearch}
            setFilters={setFilters}
            filters={filters}
            marketerNames={marketerNames}
            className="w-full justify-between sm:w-auto"
          />
        </div>
      </div>

      {loading ? <p className="text-center">Loading...</p> : <></>}

      <div className="table-responsive text-nowrap text-base">
        {!loading &&
          (clients?.items?.length !== 0 ? (
            <table className="table border table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>S/N</th>
                  <th>Client Code</th>
                  <th>Client Name</th>
                  <th>Marketer</th>
                  <th>Category</th>
                  <th>Contact Person</th>
                  <th>Email</th>
                  <th>Country</th>
                  <th>Prices</th>
                  {hasPerm('admin:manage_client', userPermissions) && (
                    <th>Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {clients?.items?.map((client, index) => (
                  <tr key={String(client._id)}>
                    <td>{index + 1 + itemPerPage * (page - 1)}</td>
                    <td className="text-wrap">{client.client_code}</td>

                    <td className="text-wrap">{client.client_name}</td>
                    <td className="text-wrap">{client.marketer}</td>
                    <td className="text-wrap">{client.category}</td>
                    <td className="text-wrap">{client.contact_person}</td>
                    <td className="text-wrap">{client.email}</td>
                    <td className="text-wrap">{client.country}</td>
                    <ExtendableTd data={client.prices || ''} />
                    {hasPerm('admin:manage_client', userPermissions) && (
                      <td
                        className="text-center"
                        style={{ verticalAlign: 'middle' }}
                      >
                        <div className="inline-block">
                          <div className="flex gap-2">
                            <DeleteButton
                              clientData={client}
                              submitHandler={deleteClient}
                            />

                            <EditButton
                              clientData={
                                client as unknown as zod_ClientDataType
                              }
                              marketerNames={marketerNames}
                              submitHandler={editClient}
                              loading={loading}
                            />
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <NoData text="No Clients Found" type={Type.danger} />
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
