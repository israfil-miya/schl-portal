'use client';

import CallingStatusTd from '@/components/ExtendableTd';
import Linkify from '@/components/Linkify';
import NoData, { Type } from '@/components/NoData';
import Pagination from '@/components/Pagination';
import { fetchApi } from '@/lib/utils';
import { ReportDataType } from '@/models/Reports';
import { UserDataType } from '@/models/Users';
import { formatDate } from '@/utility/date';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import { useRouter } from 'nextjs-toploader/app';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import DeleteButton from './Delete';
import FilterButton from './Filter';

type ReportsState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: ReportDataType[];
};

const Table = () => {
  const [reports, setReports] = useState<ReportsState>({
    pagination: {
      count: 0,
      pageCount: 0,
    },
    items: [] as ReportDataType[],
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
    country: '',
    companyName: '',
    category: '',
    fromDate: '',
    toDate: '',
    prospect: false,
    generalSearchString: '',
    show: 'all',
  });

  const [marketerNames, setMarketerNames] = useState<string[]>([]);

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

  async function getAllReports() {
    try {
      // setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/report?action=get-all-reports';
      let options: {} = {
        method: 'POST',
        headers: {
          filtered: false,
          paginated: true,
          items_per_page: itemPerPage,
          page: page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          show: 'all',
          test: true,
          regularClient: false,
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setReports(response.data as ReportsState);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving reports data');
    } finally {
      setLoading(false);
    }
  }

  async function getAllReportsFiltered() {
    try {
      // setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/report?action=get-all-reports';
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
          test: true,
          regularClient: false,
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setReports(response.data as ReportsState);
        setIsFiltered(true);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving reports data');
    } finally {
      setLoading(false);
    }
    return;
  }

  async function deleteReport(reportData: ReportDataType) {
    try {
      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/approval?action=new-request';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_model: 'Report',
          action: 'delete',
          object_id: reportData._id,
          deleted_data: reportData,
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

  useEffect(() => {
    getAllReports();
    getAllMarketers();
  }, []);

  useEffect(() => {
    // if (prevPage.current !== 1 || page > 1) {
    if (reports?.pagination?.pageCount == 1) return;
    if (!isFiltered) getAllReports();
    else getAllReportsFiltered();
    // }
    prevPage.current = page;
  }, [page]);

  useEffect(() => {
    if (reports?.pagination?.pageCount !== undefined) {
      setPage(1);
      if (prevPageCount.current !== 0) {
        if (!isFiltered) getAllReportsFiltered();
      }
      if (reports) setPageCount(reports?.pagination?.pageCount);
      prevPageCount.current = reports?.pagination?.pageCount;
      prevPage.current = 1;
    }
  }, [reports?.pagination?.pageCount]);

  useEffect(() => {
    // Reset to first page when itemPerPage changes
    prevPageCount.current = 0;
    prevPage.current = 1;
    setPage(1);

    // if (!isFiltered) getAllReports();
    // else getAllReportsFiltered();
  }, [itemPerPage]);

  return (
    <>
      <div className="flex flex-col justify-center sm:flex-row sm:justify-end mb-4 gap-2">
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
            submitHandler={getAllReportsFiltered}
            setFilters={setFilters}
            filters={filters}
            className="w-full justify-between sm:w-auto"
            marketerNames={marketerNames}
          />
        </div>
      </div>

      {loading ? <p className="text-center">Loading...</p> : <></>}

      <div className="table-responsive text-nowrap text-base">
        {!loading &&
          (reports?.items?.length !== 0 ? (
            <table className="table">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <td>Marketer</td>
                  <th>Calling Date</th>
                  <th>Last Test Date</th>
                  <th>Country</th>
                  <th>Website</th>
                  <th>Category</th>
                  <th>Company Name</th>
                  <th>Contact Person</th>
                  <th>Designation</th>
                  <th>Contact Number</th>
                  <th>Email Address</th>
                  <th>Calling Status</th>
                  <th>LinkedIn</th>
                  <th>Prospected</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports?.items?.map((item, index) => {
                  let tableRowColor = 'table-secondary';

                  if (item.is_prospected) {
                    if (item?.prospect_status == 'high_interest') {
                      tableRowColor = 'table-success';
                    } else if (item?.prospect_status == 'low_interest') {
                      tableRowColor = 'table-warning';
                    }
                  } else {
                    tableRowColor = 'table-danger';
                  }

                  return (
                    <tr
                      key={String(item._id)}
                      className={tableRowColor ? tableRowColor : ''}
                    >
                      <td>{index + 1 + itemPerPage * (page - 1)}</td>
                      <td>{item.marketer_name}</td>
                      <td>
                        {item.calling_date && formatDate(item.calling_date)}
                      </td>
                      <td>
                        {item.test_given_date_history?.length &&
                          formatDate(
                            item.test_given_date_history[
                              item.test_given_date_history.length - 1
                            ],
                          )}
                      </td>
                      <td>{item.country}</td>
                      <td>
                        {item.website.length ? (
                          <Linkify
                            coverText="Click here to visit"
                            data={item.website}
                          />
                        ) : (
                          'No link provided'
                        )}
                      </td>
                      <td>{item.category}</td>
                      <td className="text-wrap">{item.company_name}</td>
                      <td className="text-wrap">{item.contact_person}</td>
                      <td>{item.designation}</td>
                      <td className="text-wrap">{item.contact_number}</td>
                      <td className="text-wrap">{item.email_address}</td>
                      <CallingStatusTd data={item.calling_status} />
                      <td>
                        {item.linkedin.length ? (
                          <Linkify
                            coverText="Click here to visit"
                            data={item.linkedin}
                          />
                        ) : (
                          'No link provided'
                        )}
                      </td>
                      <td>
                        {item.is_prospected
                          ? `Yes (${item.followup_done ? 'Dealt' : 'Pending'})`
                          : 'No'}
                      </td>
                      <td
                        className="text-center"
                        style={{ verticalAlign: 'middle' }}
                      >
                        <div className="inline-block">
                          <div className="flex gap-2">
                            <DeleteButton
                              submitHandler={deleteReport}
                              reportData={item}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <NoData text="No Reports Found" type={Type.danger} />
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
