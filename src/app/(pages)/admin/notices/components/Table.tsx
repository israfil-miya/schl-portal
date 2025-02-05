'use client';

import ExtendableTd from '@/components/ExtendableTd';
import { fetchApi } from '@/lib/utils';
import { UserDataType } from '@/models/Users';

import { ChevronLeft, ChevronRight, CirclePlus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'nextjs-toploader/app';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ClientDataType, validationSchema } from '../schema';
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

const Table = () => {
  const [clients, setClients] = useState<ClientsState>({
    pagination: {
      count: 0,
      pageCount: 0,
    },
    items: [],
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
    marketerName: '',
    clientCode: '',
    contactPerson: '',
    countryName: '',
    category: '',
  });

  const [marketerNames, setMarketerNames] = useState<string[]>([]);

  async function getAllClients() {
    try {
      // setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/client?action=get-all-clients';
      let options: {} = {
        method: 'POST',
        headers: {
          Accept: '*/*',
          filtered: false,
          paginated: true,
          items_per_page: itemPerPage,
          page,
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
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving clients data');
    } finally {
      setLoading(false);
    }
  }

  async function getAllClientsFiltered() {
    try {
      // setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/client?action=get-all-clients';
      let options: {} = {
        method: 'POST',
        headers: {
          Accept: '*/*',
          filtered: true,
          paginated: true,
          items_per_page: itemPerPage,
          page,
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
  }

  async function deleteClient(clientId: string, reqBy: string) {
    try {
      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/approval?action=new-request';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          req_type: 'Client Delete',
          req_by: reqBy,
          id: clientId,
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

  async function getAllMarketers() {
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
  }

  async function editClient(editedClientData: ClientDataType) {
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

        if (!isFiltered) await getAllClients();
        else await getAllClientsFiltered();
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating the client');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAllClients();
    getAllMarketers();
  }, []);

  function handlePrevious() {
    setPage(p => {
      if (p === 1) return p;
      return p - 1;
    });
  }

  function handleNext() {
    setPage(p => {
      if (p === pageCount) return p;
      return p + 1;
    });
  }

  useEffect(() => {
    if (prevPage.current !== 1 || page > 1) {
      if (clients?.pagination?.pageCount == 1) return;
      if (!isFiltered) getAllClients();
      else getAllClientsFiltered();
    }
    prevPage.current = page;
  }, [page]);

  useEffect(() => {
    if (clients?.pagination?.pageCount !== undefined) {
      setPage(1);
      if (prevPageCount.current !== 0) {
        if (!isFiltered) getAllClientsFiltered();
      }
      if (clients) setPageCount(clients?.pagination?.pageCount);
      prevPageCount.current = clients?.pagination?.pageCount;
      prevPage.current = 1;
    }
  }, [clients?.pagination?.pageCount]);

  useEffect(() => {
    // Reset to first page when itemPerPage changes
    prevPageCount.current = 0;
    prevPage.current = 1;
    setPage(1);

    if (!isFiltered) getAllClients();
    else getAllClientsFiltered();
  }, [itemPerPage]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
        <button
          onClick={() =>
            router.push(
              process.env.NEXT_PUBLIC_BASE_URL + '/admin/clients/create-client',
            )
          }
          className="flex justify-between items-center gap-2 rounded-md bg-primary hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-white px-3 py-2"
        >
          Add new client
          <CirclePlus size={18} />
        </button>
        <div className="items-center flex gap-2">
          <div className="inline-flex rounded-md" role="group">
            <button
              onClick={handlePrevious}
              disabled={page === 1 || pageCount === 0 || loading}
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-s-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} className="stroke-gray-500" />
              Prev
            </button>
            <button
              disabled={true}
              className="hidden sm:visible sm:inline-flex items-center px-4 py-2 text-sm font-medium border"
            >
              <label>
                Page <b>{clients?.items?.length !== 0 ? page : 0}</b> of{' '}
                <b>{pageCount}</b>
              </label>
            </button>
            <button
              onClick={handleNext}
              disabled={page === pageCount || pageCount === 0 || loading}
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-e-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={18} className="stroke-gray-500" />
            </button>
          </div>

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
            submitHandler={getAllClientsFiltered}
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
                  <th>Action</th>
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
                            clientData={client}
                            marketerNames={marketerNames}
                            submitHandler={editClient}
                            loading={loading}
                          />
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
                    No Clients To Show.
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
