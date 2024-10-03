'use client';

import CallingStatusTd from '@/components/ExtendableTd';
import Linkify from '@/components/Linkify';
import countDaysSinceLastCall from '@/utility/countdayspassed';
import { YYYY_MM_DD_to_DD_MM_YY as convertToDDMMYYYY } from '@/utility/dateconvertion';
import fetchData from '@/utility/fetchdata';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import DeleteButton from './Delete';
import EditButton from './Edit';
import FilterButton from './Filter';

type ReportsState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: { [key: string]: any }[];
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
    marketerName: '',
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
          item_per_page: itemPerPage,
          page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          regularClient: false,
        }),
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        setReports(response.data);
      } else {
        toast.error(response.data);
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
          item_per_page: itemPerPage,
          page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filters,
          test: true,
          regularClient: false,
        }),
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        setReports(response.data);
        setIsFiltered(true);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving reports data');
    } finally {
      setLoading(false);
    }
    return;
  }

  async function deleteReport(
    originalReportData: { [key: string]: any },
    reportId: string,
    reqBy: string,
  ) {
    try {
      // block delete action if the report is others and the user is not the one who created the report
      if (originalReportData.marketer_name !== reqBy) {
        toast.error('You are not allowed to delete this report');
        return;
      }

      let url: string = process.env.NEXT_PUBLIC_BASE_URL + '/api/approval';
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

  async function editReport(
    reportId: string,
    isRecall: boolean,
    originalReportData: { [key: string]: any },
    editedData: { [key: string]: any },
    setEditedData: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>,
    setIsRecall: React.Dispatch<React.SetStateAction<boolean>>,
  ) {
    console.log('editReport', reportId, isRecall, editedData);

    try {
      if (!editedData.followup_done && editedData.followup_date === '') {
        toast.error(
          'Followup date is required because followup is set as pending for this report',
        );
        setEditedData({
          ...originalReportData,
          updated_by: session?.user.real_name || '',
        });
        return;
      }

      // block edit action if the report is others and the user is not the one who created the report
      if (originalReportData.marketer_name !== session?.user.provided_name) {
        toast.error('You are not allowed to edit this report');
        setEditedData({
          ...originalReportData,
          updated_by: session?.user.real_name || '',
        });
        return;
      }

      // setLoading(true);

      const recallLimit = 40;
      const lastCallDaysCap = 0;

      const lastCallDate =
        editedData.calling_date_history[
          editedData.calling_date_history.length - 1
        ];

      const daysPassedSinceLastCall = countDaysSinceLastCall(
        new Date(lastCallDate),
      );

      const isRecallAllowed =
        daysPassedSinceLastCall > lastCallDaysCap ||
        session?.user.role === 'super' ||
        session?.user.role === 'admin';

      if (isRecall) {
        if (isRecallAllowed) {
          const recallCountUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/report?action=get-recall-count`;
          const recallCount = await fetchData(recallCountUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              name: session?.user.provided_name,
            },
          });

          if (recallCount.ok) {
            if (recallCount.data < recallLimit) {
              const today = moment().utc().format('YYYY-MM-DD');

              const isFollowup = reports.items.find(
                data =>
                  data.followup_date === today && data._id === editedData._id,
              );

              if (isFollowup) {
                const editReportUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/report?action=edit-report`;

                const editOptions = {
                  method: 'POST',
                  body: JSON.stringify(editedData),
                  headers: {
                    'Content-Type': 'application/json',
                  },
                };

                const response = await fetchData(editReportUrl, editOptions);

                if (response.ok) {
                  if (!isFiltered) await getAllReports();
                  else await getAllReportsFiltered();

                  toast.success('Edited the report successfully');
                  setEditedData({});
                  setIsRecall(false);
                } else {
                  toast.error(response.data);
                }
              } else {
                delete editedData._id;
                delete editedData.__v;

                const submitData = {
                  req_type: 'Report Edit',
                  req_by: session?.user.real_name,
                  id: reportId,
                  ...editedData,
                  calling_date_history:
                    editedData.calling_date_history.includes(today)
                      ? editedData.calling_date_history
                      : [...editedData.calling_date_history, today],
                  updated_by: session?.user.real_name,
                };

                const approvalUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL}/api/approval`;

                const approvalOptions = {
                  method: 'POST',
                  body: JSON.stringify(submitData),
                  headers: {
                    'Content-Type': 'application/json',
                    recall: true,
                  },
                };

                const response = await fetchData(approvalUrl, approvalOptions);

                setEditedData({});
                setIsRecall(false);

                if (response.ok) {
                  toast.success(
                    'Today is not the followup date of the report to recall, an approval request has been sent to admin',
                  );
                } else {
                  toast.error(response.data.message);
                }
              }
            } else {
              toast.error(
                'You have reached the limit of recall requests, please contact an admin!',
              );
              setEditedData({});
              setLoading(false);
              return;
            }
          } else {
            toast.error(recallCount.data);
          }
        } else {
          toast.error(
            'You have to wait 15 days from your last call to make a call again or contact an admin!',
          );
        }
      } else {
        const editReportUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/report?action=edit-report`;
        const editOptions = {
          method: 'POST',
          body: JSON.stringify(editedData),
          headers: {
            'Content-Type': 'application/json',
          },
        };

        const response = await fetchData(editReportUrl, editOptions);

        if (response.ok) {
          if (!isFiltered) await getAllReports();
          else await getAllReportsFiltered();

          toast.success('Edited the report successfully');
        } else {
          toast.error(response.data);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while editing the report');
    } finally {
      setEditedData({
        ...originalReportData,
        updated_by: session?.user.real_name || '',
      });
      setLoading(false);
    }
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
              className="inline-flex items-center px-4 py-2 text-sm bg-gray-200 text-gray-700 border border-gray-200 rounded-s-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"
                />
              </svg>
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
              className="inline-flex items-center px-4 py-2 text-sm bg-gray-200 text-gray-700 border border-gray-200 rounded-e-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            >
              Next
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"
                />
              </svg>
            </button>
          </div>

          <select
            value={itemPerPage}
            onChange={e => setItemPerPage(parseInt(e.target.value))}
            // defaultValue={30}
            required
            className="appearance-none bg-gray-200 text-gray-700 border border-gray-200 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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

      {!loading &&
        (reports?.items?.length !== 0 ? (
          <div className="table-responsive text-nowrap text-sm">
            <table className="table">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Calling Date</th>
                  <th>Followup Date</th>
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
                  <th>Manage</th>
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
                      key={item._id}
                      className={tableRowColor ? tableRowColor : ''}
                    >
                      <td>{index + 1 + itemPerPage * (page - 1)}</td>
                      <td>
                        {item.calling_date &&
                          convertToDDMMYYYY(item.calling_date)}
                      </td>
                      <td>
                        {item.followup_date &&
                          convertToDDMMYYYY(item.followup_date)}
                      </td>
                      <td>
                        {item.test_given_date_history?.length &&
                          convertToDDMMYYYY(
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
                          ? `Yes (${item.followup_done ? 'Done' : 'Pending'})`
                          : 'No'}
                      </td>
                      <td
                        className="text-center"
                        style={{ verticalAlign: 'middle' }}
                      >
                        <div className="inline-block">
                          <div className="flex gap-2">
                            <EditButton
                              loading={loading}
                              submitHandler={editReport}
                              reportData={item}
                            />
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
          </div>
        ) : (
          <tr key={0}>
            <td colSpan={16} className=" align-center text-center">
              No Reports To Show.
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
