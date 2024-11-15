'use client';

import { cn, fetchApi } from '@/lib/utils';
import { getTodayDate } from '@/utility/date';
import { Filter, X } from 'lucide-react';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  ReportsStatusState,
  callsTargetConst,
  leadsTargetConst,
} from './DailyStatusTable';

interface PropsType {
  className?: string;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setReportsStatus: React.Dispatch<React.SetStateAction<ReportsStatusState>>;
  setCallsTarget: React.Dispatch<React.SetStateAction<number>>;
  setLeadsTarget: React.Dispatch<React.SetStateAction<number>>;
}

interface FiltersType {
  fromDate: string;
  toDate: string;
}

const countDays = (startDate: string, endDate: string): number => {
  // Parse the input dates using moment
  const start = moment.tz(startDate, 'YYYY-MM-DD', 'Asia/Dhaka');
  const end = moment.tz(endDate, 'YYYY-MM-DD', 'Asia/Dhaka');

  // Calculate the difference in days
  const dayDifference = end.diff(start, 'days');

  // If dates are equal, return 1
  if (dayDifference === 0) {
    return 1;
  }

  // Return the absolute value to ensure the difference is positive
  return Math.abs(dayDifference) + 1;
};

const FilterButton: React.FC<PropsType> = ({
  loading,
  setLoading,
  setReportsStatus,
  setCallsTarget,
  setLeadsTarget,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const popupRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { data: session } = useSession();

  const getReportsStatus = useCallback(
    async (data: FiltersType) => {
      try {
        setLoading(true);

        let filters = data;

        let url: string =
          process.env.NEXT_PUBLIC_BASE_URL +
          '/api/report?action=get-reports-status';
        let options: {} = {
          method: 'POST',
          body: JSON.stringify(filters),
          headers: {
            name: session?.user.real_name,
            'Content-Type': 'application/json',
          },
        };

        let response = await fetchApi(url, options);

        if (response.ok) {
          setReportsStatus(response.data as ReportsStatusState);
          setCallsTarget(
            callsTargetConst * countDays(filters.fromDate, filters.toDate),
          );
          setLeadsTarget(
            leadsTargetConst * countDays(filters.fromDate, filters.toDate),
          );
        } else {
          toast.error(response.data as string);
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while retrieving daily reports status');
      } finally {
        setLoading(false);
      }
    },
    [
      session?.user.real_name,
      setLoading,
      setReportsStatus,
      setCallsTarget,
      setLeadsTarget,
    ],
  );

  const { register, handleSubmit, reset, watch } = useForm<FiltersType>({
    defaultValues: { fromDate: getTodayDate(), toDate: getTodayDate() },
  });

  useEffect(() => {
    getReportsStatus({ fromDate: watch('fromDate'), toDate: watch('toDate') });
  }, [getReportsStatus, watch]);

  const handleResetFilters = () => {
    reset({
      fromDate: getTodayDate(),
      toDate: getTodayDate(),
    });
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      popupRef.current &&
      !popupRef.current.contains(e.target as Node) &&
      !popupRef.current.querySelector('input:focus, textarea:focus')
    ) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className={cn(
          `flex items-center gap-2 rounded-md bg-blue-600 hover:opacity-90 hover:ring-4 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 text-white px-3 py-2`,
          props.className,
        )}
      >
        Filter
        <Filter size={18} />
      </button>

      <section
        onClick={handleClickOutside}
        className={`fixed z-50 inset-0 flex justify-center items-center transition-colors ${isOpen ? 'visible bg-black/20 disable-page-scroll' : 'invisible'} `}
      >
        <article
          ref={popupRef}
          onClick={e => e.stopPropagation()}
          className={`${isOpen ? 'scale-100 opacity-100' : 'scale-125 opacity-0'} bg-white rounded-lg lg:w-[35vw] md:w-[70vw] sm:w-[80vw] shadow relative`}
        >
          <header className="flex items-center align-middle justify-between px-4 py-2 border-b rounded-t">
            <h3 className="text-gray-900 text-lg lg:text-xl font-semibold  uppercase">
              Filter Reports Status
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            >
              <X size={18} />
            </button>
          </header>
          <form
            ref={formRef}
            className="overflow-y-scroll max-h-[70vh] p-4"
            onSubmit={handleSubmit(getReportsStatus)}
          >
            <div className="grid grid-cols-1 gap-x-3 gap-y-4">
              <div>
                <label className="uppercase tracking-wide text-gray-700 text-sm font-bold flex gap-2 mb-2">
                  Date Picker
                </label>

                <div className="inline-flex w-full" role="group">
                  <input
                    className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded-s-md py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    {...register('fromDate')}
                    type="date"
                  />
                  <span className="inline-flex items-center px-4 py-2 m-0 text-sm font-medium border">
                    <b>to</b>
                  </span>
                  <input
                    className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded-e-md py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    {...register('toDate')}
                    type="date"
                  />
                </div>
              </div>
            </div>
          </form>
          <footer className="flex space-x-2 items-center px-4 py-2 border-t justify-end border-gray-200 rounded-b">
            <button
              onClick={handleResetFilters}
              className="rounded-md bg-gray-600 text-white  hover:opacity-90 hover:ring-2 hover:ring-gray-600 transition duration-200 delay-300 hover:text-opacity-100 px-4 py-1"
              type="button"
              disabled={loading}
            >
              Reset
            </button>
            <button
              onClick={() => {
                formRef.current?.requestSubmit();
              }}
              className="rounded-md bg-blue-600 text-white hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 px-4 py-1"
              type="submit"
              disabled={loading}
            >
              Search
            </button>
          </footer>
        </article>
      </section>
    </>
  );
};

export default FilterButton;
