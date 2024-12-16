'use client';

import Badge from '@/components/Badge';
import ExtendableTd from '@/components/ExtendableTd';
import { fetchApi } from '@/lib/utils';
import { EmployeeDataType } from '@/models/Employees';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
// import { ApprovalDataType, validationSchema } from '../schema';
import { ApprovalDataType } from '@/models/Approvals';
import { formatTimestamp } from '@/utility/date';
import { CircleCheckBig, CircleX } from 'lucide-react';
import FilterButton from './Filter';

type ApprovalsState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: ApprovalDataType[];
};

const Table: React.FC<{ employeesData: EmployeeDataType[] }> = props => {
  const [approvals, setApprovals] = useState<ApprovalsState>({
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

  const [approvalIds, setApprovalIds] = useState<string[]>([]);

  const { data: session } = useSession();

  const [filters, setFilters] = useState({
    reqBy: '',
    reqType: '',
    approvedCheck: false,
    rejectedCheck: false,
    waitingCheck: false,
    fromDate: '',
    toDate: '',
  });

  async function getAllApprovals() {
    try {
      // setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/approval?action=get-all-approvals';
      let options: {} = {
        method: 'POST',
        headers: {
          filtered: false,
          paginated: true,
          items_per_page: itemPerPage,
          page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setApprovals(response.data as ApprovalsState);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving approvals data');
    } finally {
      setLoading(false);
    }
  }

  async function getAllApprovalsFiltered() {
    try {
      // setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/approval?action=get-all-approvals';
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
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setApprovals(response.data as ApprovalsState);
        setIsFiltered(true);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving approvals data');
    } finally {
      setLoading(false);
    }
    return;
  }

  async function singleApproval(req_id: string, res: 'approve' | 'reject') {
    try {
      let toastId = toast.loading('Sending request for approval...');
      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/approval?action=single-response';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response: res,
          checked_by: session?.user?.real_name,
          id: req_id,
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        if (!isFiltered) await getAllApprovals();
        else await getAllApprovalsFiltered();
        toast.success('Request processed successfully', { id: toastId });

        console.log('response', response.data);
      } else {
        toast.error(response.data.message, { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while sending request for approval');
    }
    return;
  }

  async function multipleApproval(res: 'approve' | 'reject') {
    try {
      let toastId = toast.loading('Sending request for approval...');
      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/approval?action=single-response';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response: res,
          checked_by: session?.user?.real_name,
          approval_ids: approvalIds,
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        if (!isFiltered) await getAllApprovals();
        else await getAllApprovalsFiltered();
        toast.success('Checked ' + approvalIds.length + ' approval requests', {
          id: toastId,
        });
        setApprovalIds([]);
      } else {
        toast.error(response.data.message, { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while sending request for approval');
    }
    return;
  }

  // Function to handle the "Select All" checkbox
  const handleSelectAll = (e: any) => {
    if (e.target.checked) {
      // If "Select All" is checked, select all rows
      const allIds = approvals?.items
        ?.filter(item => item.checked_by === 'None')
        .map(item => String(item._id));
      setApprovalIds(allIds);
    } else {
      // If "Select All" is unchecked, clear all selections
      setApprovalIds([]);
    }
  };

  // Function to handle individual checkbox selection
  const handleCheckboxChange = (id: string) => {
    // Toggle the selection of the checkbox
    setApprovalIds(prevIds => {
      if (prevIds.includes(id)) {
        // If already selected, remove from selection
        return prevIds.filter(rowId => rowId !== id);
      } else {
        // If not selected, add to selection
        return [...prevIds, id];
      }
    });
  };

  useEffect(() => {
    getAllApprovals();
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
      if (approvals?.pagination?.pageCount == 1) return;
      if (!isFiltered) getAllApprovals();
      else getAllApprovalsFiltered();
    }
    prevPage.current = page;
  }, [page]);

  useEffect(() => {
    if (approvals?.pagination?.pageCount !== undefined) {
      setPage(1);
      if (prevPageCount.current !== 0) {
        if (!isFiltered) getAllApprovalsFiltered();
      }
      if (approvals) setPageCount(approvals?.pagination?.pageCount);
      prevPageCount.current = approvals?.pagination?.pageCount;
      prevPage.current = 1;
    }
  }, [approvals?.pagination?.pageCount]);

  useEffect(() => {
    // Reset to first page when itemPerPage changes
    prevPageCount.current = 0;
    prevPage.current = 1;
    setPage(1);

    if (!isFiltered) getAllApprovals();
    else getAllApprovalsFiltered();
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
                Page <b>{approvals?.items?.length !== 0 ? page : 0}</b> of{' '}
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
            submitHandler={getAllApprovalsFiltered}
            setFilters={setFilters}
            filters={filters}
            className="w-full justify-between sm:w-auto"
          />
        </div>
        <div
          className="float-start"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {approvalIds.length !== 0 && (
            <div className="align-middle text-center d-flex align-items-center ms-5 justify-content-center">
              <button
                onClick={() => {
                  let confirmation = confirm(
                    'Are you sure you want to approve these approvals?',
                  );
                  if (confirmation) {
                    multipleApproval('approve');
                  }
                }}
                className="rounded-md bg-green-600 hover:opacity-90 hover:ring-2 hover:ring-green-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center"
              >
                <CircleCheckBig size={18} />
              </button>
              <button
                onClick={() => {
                  let confirmation = confirm(
                    'Are you sure you want to reject these approvals?',
                  );
                  if (confirmation) {
                    multipleApproval('reject');
                  }
                }}
                className="rounded-md bg-red-600 hover:opacity-90 hover:ring-2 hover:ring-red-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center"
              >
                <CircleX size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? <p className="text-center">Loading...</p> : <></>}

      <div className="table-responsive text-nowrap text-base">
        {!loading &&
          (approvals?.items?.length !== 0 ? (
            <table className="table border table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th
                    className="text-center"
                    style={{ verticalAlign: 'middle' }}
                  >
                    <div className="inline-block items-center">
                      <div className="flex gap-2">
                        <input
                          type="checkbox"
                          id="selectAllCheckbox"
                          checked={
                            approvalIds.length ===
                              approvals?.items?.filter(
                                item => item.checked_by === 'None',
                              ).length &&
                            approvals?.items?.filter(
                              item => item.checked_by === 'None',
                            ).length !== 0
                          }
                          className="w-5 h-5 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          onChange={handleSelectAll}
                        />
                      </div>
                    </div>
                  </th>
                  <th>Requester</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {approvals?.items?.map((approval, index) => (
                  <tr key={String(approval._id)}>
                    <td>
                      <div className="form-check align-middle text-center d-flex align-items-center justify-content-center">
                        <input
                          disabled={approval.checked_by !== 'None'}
                          type="checkbox"
                          id={`checkbox_${String(approval._id)}`}
                          className="w-5 h-5 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          checked={approvalIds.includes(String(approval._id))}
                          onChange={() =>
                            handleCheckboxChange(String(approval._id))
                          }
                        />
                      </div>
                    </td>
                    <td className="text-wrap">{approval.req_by}</td>
                    <td className="text-wrap">
                      {approval.checked_by && approval.checked_by !== 'None'
                        ? approval.is_rejected
                          ? 'Rejected'
                          : 'Approved'
                        : 'Waiting'}
                    </td>
                    <td className="text-wrap">{approval.req_type}</td>
                    <td className="text-wrap">
                      {formatTimestamp(approval.createdAt!).date}
                      {' | '}
                      {formatTimestamp(approval.createdAt!).time}
                    </td>
                    <td
                      className="text-center"
                      style={{ verticalAlign: 'middle' }}
                    >
                      <div className="inline-block">
                        <div className="flex gap-2">
                          {approval.checked_by == 'None' && (
                            <>
                              <button
                                onClick={() =>
                                  singleApproval(
                                    String(approval._id),
                                    'approve',
                                  )
                                }
                                className="rounded-md bg-green-600 hover:opacity-90 hover:ring-2 hover:ring-green-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center"
                              >
                                <CircleCheckBig size={18} />
                              </button>

                              <button
                                onClick={() =>
                                  singleApproval(String(approval._id), 'reject')
                                }
                                className="rounded-md bg-red-600 hover:opacity-90 hover:ring-2 hover:ring-red-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center"
                              >
                                <CircleX size={18} />
                              </button>
                            </>
                          )}
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
                    No Approvals To Show.
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
