'use client';

import {
  ClientDataType,
  validationSchema,
} from '@/app/(pages)/admin/clients/schema';
import NoData, { Type } from '@/components/NoData';
import Pagination from '@/components/Pagination';
import { usePaginationManager } from '@/hooks/usePaginationManager';
import { fetchApi, hasAnyPerm, hasPerm } from '@/lib/utils';
import { ReportDataType } from '@/models/Reports';
import { PopulatedByEmployeeUserType, UserDataType } from '@/models/Users';
import { formatDate } from '@/utility/date';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
import DuplicateButton from './Duplicate';
import FilterButton from './Filter';
import NewClient from './New';
import RejectButton from './Reject';

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
    items: React.useMemo(() => [], []),
  });

  const { data: session } = useSession();
  const userPermissions = useMemo(
    () => session?.user.permissions || [],
    [session?.user.permissions],
  );

  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(0);
  const [itemPerPage, setItemPerPage] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchVersion, setSearchVersion] = useState<number>(0);

  const [marketerNames, setMarketerNames] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    country: '',
    companyName: '',
    category: '',
    fromDate: '',
    toDate: '',
    marketerName: '',
    generalSearchString: '',
    show: 'all',
  });

  const getAllClientApprovals = useCallback(
    async (page: number, itemPerPage: number) => {
      try {
        // setLoading(true);

        let url: string =
          process.env.NEXT_PUBLIC_BASE_URL +
          '/api/report?action=get-all-reports';
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
            // it's actually fetching reports in pending state to be converted to regular client
            regularClient: true,
          }),
        };

        let response = await fetchApi(url, options);

        if (response.ok) {
          setReports(response.data as ReportsState);
          setPageCount((response.data as ReportsState).pagination.pageCount);
        } else {
          toast.error(response.data as string);
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while retrieving reports data');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getAllClientApprovalsFiltered = useCallback(
    async (page: number, itemPerPage: number) => {
      try {
        // setLoading(true);

        let url: string =
          process.env.NEXT_PUBLIC_BASE_URL +
          '/api/report?action=get-all-reports';
        let options: {} = {
          method: 'POST',
          headers: {
            filtered: true,
            paginated: true,
            items_per_page: itemPerPage,
            page: page,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...filters,
            // it's actually fetching reports in pending state to be converted to regular client
            regularClient: true,
          }),
        };

        let response = await fetchApi(url, options);

        if (response.ok) {
          setReports(response.data as ReportsState);
          setIsFiltered(true);
          setPageCount((response.data as ReportsState).pagination.pageCount);
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
    },
    [filters],
  );

  // reject the approval of the report to be converted to regular client
  const rejectClient = async (reportId: string) => {
    try {
      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/report?action=reject-regular-client-request';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: reportId }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Rejected the request to convert to regular client');

        fetchClientApprovals();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while rejecting the request');
    }
    return;
  };

  // mark the request as duplicate as the client already exists
  const markDuplicate = async (reportId: string) => {
    try {
      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/report?action=mark-duplicate-client';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: reportId }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Marked the request as duplicate client');

        await fetchClientApprovals();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while marking the request as duplicate');
    }
    return;
  };

  const convertToClient = async (editedClientData: Partial<ClientDataType>) => {
    try {
      setLoading(true);
      const parsed = validationSchema.safeParse(editedClientData);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/report?action=convert-to-permanent';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedClientData),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Successfully created new client');

        await fetchClientApprovals();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while creating new client');
    }
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
        let marketers = response.data as PopulatedByEmployeeUserType[];
        let marketerNames = marketers.map(
          marketer => marketer.employee_id.company_provided_name,
        );
        setMarketerNames(marketerNames);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving marketers data');
    }
  };

  useEffect(() => {
    getAllMarketers();
  }, []);

  const fetchClientApprovals = useCallback(async () => {
    if (!isFiltered) {
      await getAllClientApprovals(page, itemPerPage);
    } else {
      await getAllClientApprovalsFiltered(page, itemPerPage);
    }
  }, [
    isFiltered,
    getAllClientApprovals,
    getAllClientApprovalsFiltered,
    page,
    itemPerPage,
  ]);

  usePaginationManager({
    page,
    itemPerPage,
    pageCount,
    setPage,
    triggerFetch: fetchClientApprovals,
  });

  useEffect(() => {
    if (searchVersion > 0 && isFiltered && page === 1) {
      fetchClientApprovals();
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
          (reports?.items?.length !== 0 ? (
            <table className="table table-striped table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Marketer Name</th>
                  <th>Country</th>
                  <th>Company Name</th>
                  <th>Contact Person</th>
                  <th>Email Address</th>
                  {hasPerm('crm:check_client_request', userPermissions) && (
                    <th>Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {reports?.items?.map((report, index) => {
                  return (
                    <tr key={String(report._id)}>
                      <td>{index + 1 + itemPerPage * (page - 1)}</td>
                      <td>{report.marketer_name}</td>
                      <td>{report.country}</td>
                      <td className="text-wrap">{report.company_name}</td>
                      <td className="text-wrap">{report.contact_person}</td>
                      <td className="text-wrap">{report.email_address}</td>

                      {hasPerm('crm:check_client_request', userPermissions) && (
                        <td
                          className="text-center"
                          style={{ verticalAlign: 'middle' }}
                        >
                          <div className="inline-block">
                            <div className="flex gap-2">
                              <NewClient
                                loading={loading}
                                clientData={{
                                  country: report.country,
                                  client_name: report.company_name,
                                  contact_person: report.contact_person,
                                  designation: report.designation,
                                  contact_number: report.contact_number,
                                  email: report.email_address,
                                  category: report.category,
                                  marketer: report.marketer_name,
                                }}
                                submitHandler={convertToClient}
                              />
                              <RejectButton
                                reportData={report}
                                submitHandler={rejectClient}
                              />
                              <DuplicateButton
                                reportData={report}
                                submitHandler={markDuplicate}
                              />
                            </div>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <NoData text="No Requests Found" type={Type.danger} />
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
