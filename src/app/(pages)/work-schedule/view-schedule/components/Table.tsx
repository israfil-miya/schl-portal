'use client';

import Badge from '@/components/Badge';
import NoData, { Type } from '@/components/NoData';
import Pagination from '@/components/Pagination';
import { cn, fetchApi, hasPerm } from '@/lib/utils';
import { ClientDataType } from '@/models/Clients';
import { ScheduleDataType } from '@/models/Schedule';
import { CirclePlus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'nextjs-toploader/app';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  validationSchema,
  ScheduleDataType as zod_ScheduleDataType,
} from '../../schema';
import DeleteButton from './Delete';
import EditButton from './Edit';
import FilterButton from './Filter';

import ExtendableTd from '@/components/ExtendableTd';
import { usePaginationManager } from '@/hooks/usePaginationManager';
import { formatDate } from '@/utility/date';
import moment from 'moment-timezone';

type SchedulesState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: ScheduleDataType[];
};

const Table: React.FC<{ clientsData: ClientDataType[] }> = props => {
  const [schedules, setSchedules] = useState<SchedulesState>({
    pagination: {
      count: 0,
      pageCount: 0,
    },
    items: [],
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
  const [searchVersion, setSearchVersion] = useState<number>(0);

  const [filters, setFilters] = useState({
    generalSearchString: '',
    receiveFromDate: '',
    receiveToDate: '',
    deliveryFromDate: '',
    deliveryToDate: '',
    clientCode: '',
    task: '',
  });

  const getAllSchedules = useCallback(
    async (page: number, itemPerPage: number) => {
      try {
        // setLoading(true);

        let url: string =
          process.env.NEXT_PUBLIC_BASE_URL +
          '/api/schedule?action=get-all-schedules';
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
          setSchedules(response.data as SchedulesState);
          setPageCount((response.data as SchedulesState).pagination.pageCount);
        } else {
          toast.error(response.data as string);
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while retrieving schedules data');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getAllSchedulesFiltered = useCallback(
    async (page: number, itemPerPage: number) => {
      try {
        // setLoading(true);

        let url: string =
          process.env.NEXT_PUBLIC_BASE_URL +
          '/api/schedule?action=get-all-schedules';
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
          }),
        };

        let response = await fetchApi(url, options);

        if (response.ok) {
          setSchedules(response.data as SchedulesState);
          setIsFiltered(true);
          setPageCount((response.data as SchedulesState).pagination.pageCount);
        } else {
          toast.error(response.data as string);
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while retrieving schedules data');
      } finally {
        setLoading(false);
      }
      return;
    },
    [filters],
  );

  const deleteSchedule = async (scheduleData: ScheduleDataType) => {
    try {
      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/approval?action=new-request';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_model: 'Schedule',
          action: 'delete',
          object_id: scheduleData._id,
          deleted_data: scheduleData,
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
  };

  const editedSchedule = async (
    editedScheduleData: zod_ScheduleDataType,
    previousScheduleData: zod_ScheduleDataType,
  ) => {
    try {
      setLoading(true);
      const parsed = validationSchema.safeParse(editedScheduleData);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/schedule?action=edit-schedule';
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
        toast.success('Updated the schedule data');

        await fetchSchedules();
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating the schedule');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = useCallback(async () => {
    if (!isFiltered) {
      await getAllSchedules(page, itemPerPage);
    } else {
      await getAllSchedulesFiltered(page, itemPerPage);
    }
  }, [isFiltered, getAllSchedules, getAllSchedulesFiltered, page, itemPerPage]);

  usePaginationManager({
    page,
    itemPerPage,
    pageCount,
    setPage,
    triggerFetch: fetchSchedules,
  });

  useEffect(() => {
    if (searchVersion > 0 && isFiltered && page === 1) {
      fetchSchedules();
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
          hasPerm('schedule:create_schedule', userPermissions)
            ? 'sm:flex-row sm:justify-between'
            : 'sm:justify-end sm:flex-row',
        )}
      >
        {hasPerm('schedule:create_schedule', userPermissions) && (
          <button
            onClick={() =>
              router.push(
                process.env.NEXT_PUBLIC_BASE_URL +
                  '/work-schedule/schedule-task',
              )
            }
            className="flex justify-between items-center gap-2 rounded-md bg-primary hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-white px-3 py-2"
          >
            Create new schedule
            <CirclePlus size={18} />
          </button>
        )}

        <div className="items-center flex gap-2">
          <Pagination
            page={page}
            pageCount={pageCount}
            isLoading={loading}
            setPage={setPage}
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
            className="w-full justify-between sm:w-auto"
          />
        </div>
      </div>

      {loading ? <p className="text-center">Loading...</p> : <></>}

      <div className="table-responsive text-nowrap text-base">
        {!loading &&
          (schedules?.items?.length !== 0 ? (
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>S/N</th>
                  <th>Receive Date</th>
                  <th>Delivery Date</th>
                  <th>Client Code</th>
                  {hasPerm('admin:view_client_name', userPermissions) && (
                    <th>Client Name</th>
                  )}
                  <th>Task(s)</th>
                  <th>Comment</th>
                  {hasPerm('schedule:manage_schedule', userPermissions) && (
                    <th>Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {schedules?.items?.map((schedule, index) => (
                  <tr
                    key={String(schedule._id)}
                    className={
                      moment(schedule.receive_date).diff(moment(), 'hours') <=
                      24
                        ? 'table-danger'
                        : 'text-black'
                    }
                  >
                    <td>{index + 1 + itemPerPage * (page - 1)}</td>
                    <td className="text-wrap">
                      {formatDate(schedule.receive_date)}
                    </td>
                    <td className="text-wrap">
                      {formatDate(schedule.delivery_date)}
                    </td>
                    <td className="text-wrap">{schedule.client_code}</td>
                    {hasPerm('admin:view_client_name', userPermissions) && (
                      <td className="text-wrap">{schedule.client_name}</td>
                    )}
                    <td
                      className="uppercase text-wrap"
                      style={{ verticalAlign: 'middle' }}
                    >
                      {schedule.task?.split('+').map((task, index) => {
                        return <Badge key={index} value={task} />;
                      })}
                    </td>

                    <ExtendableTd data={schedule.comment} />

                    {hasPerm('schedule:manage_schedule', userPermissions) && (
                      <td
                        className="text-center"
                        style={{ verticalAlign: 'middle' }}
                      >
                        <div className="inline-block">
                          <div className="flex gap-2">
                            <DeleteButton
                              scheduleData={schedule}
                              submitHandler={deleteSchedule}
                            />

                            <EditButton
                              scheduleData={
                                schedule as unknown as zod_ScheduleDataType
                              }
                              submitHandler={editedSchedule}
                              loading={loading}
                              clientsData={props.clientsData}
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
            <NoData text="No Schedules Found" type={Type.danger} />
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
