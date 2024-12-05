'use client';

import CallingStatusTd from '@/components/ExtendableTd';
import Linkify from '@/components/Linkify';
import { fetchApi } from '@/lib/utils';
import { ReportDataType } from '@/models/Reports';
import { formatDate } from '@/utility/date';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
    country: '',
    companyName: '',
    category: '',
    fromDate: '',
    toDate: '',
    prospect: false,
    generalSearchString: '',
  });

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
          page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filters,
          staleClient: true,
          regularClient: false,
          test: false,
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

  async function deleteReport(reportId: string, reqBy: string) {
    try {
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
      if (reports?.pagination?.pageCount == 1) return;
      if (!isFiltered) getAllReports();
      else getAllReportsFiltered();
    }
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

    if (!isFiltered) getAllReports();
    else getAllReportsFiltered();
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
                Page <b>{reports?.items?.length !== 0 ? page : 0}</b> of{' '}
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
            submitHandler={getAllReportsFiltered}
            setFilters={setFilters}
            filters={filters}
            className="w-full justify-between sm:w-auto"
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
                  <th>Calling Date</th>
                  <th>Followup Date</th>
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
                  <th>Test</th>
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
                      <td>
                        {item.calling_date && formatDate(item.calling_date)}
                      </td>
                      <td>
                        {item.followup_date && formatDate(item.followup_date)}
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
                        {item.test_given_date_history?.length ? 'Yes' : 'No'}
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
            <table className="table border table-bordered table-striped">
              <tbody>
                <tr key={0}>
                  <td className="align-center text-center text-wrap">
                    No Reports To Show.
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
