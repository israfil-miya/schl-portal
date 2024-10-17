'use client';

import CallingStatusTd from '@/components/ExtendableTd';
import Linkify from '@/components/Linkify';
import { YYYY_MM_DD_to_DD_MM_YY as convertToDDMMYYYY } from '@/utility/dateConversion';
import fetchData from '@/utility/fetchData';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import DeleteButton from './Delete';
import FilterButton from './Filter';
import NewClient from './New';

type ClientsState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: { [key: string]: any }[];
};

const Table = () => {
  const [clients, setClients] = useState<ClientsState>({
    pagination: {
      count: 0,
      pageCount: 0,
    },
    items: [],
  });

  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(0);
  const [itemPerPage, setItemPerPage] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);

  const prevPageCount = useRef<number>(0);
  const prevPage = useRef<number>(1);

  const { data: session } = useSession();

  const [filters, setFilters] = useState({
    country: '',
    companyName: '',
    category: '',
    fromDate: '',
    toDate: '',
    test: false,
    generalSearchString: '',
    show: 'all',
  });

  async function getAllClients() {
    try {
      // setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/report?action=get-all-reports';
      let options: {} = {
        method: 'POST',
        headers: {
          filtered: false,
          paginated: true,
          item_per_page: itemPerPage,
          page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          show: 'all',
          regularClient: true,
        }),
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        setClients(response.data);
      } else {
        toast.error(response.data);
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
        process.env.NEXT_PUBLIC_BASE_URL + '/api/report?action=get-all-reports';
      let options: {} = {
        method: 'POST',
        headers: {
          filtered: true,
          paginated: true,
          item_per_page: itemPerPage,
          page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filters,
          regularClient: true,
        }),
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        setClients(response.data);
        setIsFiltered(true);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving clients data');
    } finally {
      setLoading(false);
    }
    return;
  }

  async function deleteClient(
    originalClientData: { [key: string]: any },
    reportId: string,
    reqBy: string,
  ) {
    try {
      // if (originalClientData.marketer_name !== reqBy) {
      //   toast.error('You are not allowed to delete this client');
      //   return;
      // }

      let url: string = process.env.NEXT_PUBLIC_PORTAL_URL + '/api/approval';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          req_type: 'Report Delete',
          req_by: reqBy,
          id: reportId,
        }),
      };

      let response = await fetchData(url, options);

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

  async function createNewClient(
    editedData: { [key: string]: any },
    setEditedData: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>,
  ) {
    try {
      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/client?action=create-new-client';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...editedData, marketer: editedData.marketer }),
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        toast.success('Successfully created new client');
        setEditedData({});
        if (!isFiltered) getAllClients();
        else getAllClientsFiltered();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while creating new client');
    }
  }

  useEffect(() => {
    getAllClients();
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
      <div className="flex flex-col justify-center sm:flex-row sm:justify-end mb-4 gap-2">
        <div className="items-center flex gap-2">
          <div className="inline-flex rounded-md" role="group">
            <button
              onClick={handlePrevious}
              disabled={page === 1 || pageCount === 0 || loading}
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-s-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
              className="inline-flex items-center px-4 py-2 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-e-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
            className="appearance-none bg-gray-50 text-gray-700 border border-gray-200 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
            className="w-full justify-between sm:w-auto"
          />
        </div>
      </div>

      {loading ? <p className="text-center">Loading...</p> : <></>}

      {!loading &&
        (clients?.items?.length !== 0 ? (
          <div className="table-responsive text-nowrap text-sm">
            <table className="table table-striped table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Onboard Date</th>
                  <th>Country</th>
                  <th>Company Name</th>
                  <th>Contact Person</th>
                  <th>Email Address</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {clients?.items?.map((item, index) => {
                  return (
                    <tr key={item._id}>
                      <td>{index + 1 + itemPerPage * (page - 1)}</td>
                      <td>
                        {item.onboard_date &&
                          convertToDDMMYYYY(item.onboard_date)}
                      </td>
                      <td>{item.country}</td>
                      <td className="text-wrap">{item.company_name}</td>
                      <td className="text-wrap">{item.contact_person}</td>
                      <td className="text-wrap">{item.email_address}</td>
                      <td
                        className="text-center"
                        style={{ verticalAlign: 'middle' }}
                      >
                        <div className="inline-block">
                          <div className="flex gap-2">
                            <DeleteButton
                              submitHandler={deleteClient}
                              clientData={item}
                            />
                            {!item.permanent_client && (
                              <NewClient
                                loading={loading}
                                clientData={{
                                  country: item.country,
                                  client_name: item.company_name,
                                  contact_person: item.contact_person,
                                  designation: item.designation,
                                  contact_number: item.contact_number,
                                  email: item.email_address,
                                  marketer: item.marketer_name,
                                }}
                                submitHandler={createNewClient}
                              />
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <tr key={0}>
            <td colSpan={16} className=" align-center text-center">
              No Clients To Show.
            </td>
          </tr>
        ))}
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
