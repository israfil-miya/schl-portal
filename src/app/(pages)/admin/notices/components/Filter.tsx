'use client';

import { cn } from '@/lib/utils';
import { Filter, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface PropsType {
  className?: string;
  submitHandler: () => void;
  filters: {
    fromDate: string;
    toDate: string;
    noticeNo: string;
    title: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  isLoading: boolean;
}

const FilterButton: React.FC<PropsType> = props => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { filters, setFilters } = props;
  const popupRef = useRef<HTMLElement>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ): void => {
    const { name, type, value } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFilters((prevData: {}) => ({
        ...prevData,
        [name]: checked,
      }));
    } else {
      setFilters((prevData: {}) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      noticeNo: '',
      title: '',
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
        className={`fixed inset-0 flex justify-center items-center transition-colors ${isOpen ? 'visible bg-black/20 disable-page-scroll' : 'invisible'} `}
      >
        <article
          ref={popupRef}
          onClick={e => e.stopPropagation()}
          className={`${isOpen ? 'scale-100 opacity-100' : 'scale-125 opacity-0'} bg-white rounded-lg lg:w-[35vw] md:w-[70vw] sm:w-[80vw] shadow relative`}
        >
          <header className="flex items-center align-middle justify-between px-4 py-2 border-b rounded-t">
            <h3 className="text-gray-900 text-lg lg:text-xl font-semibold dark:text-white uppercase">
              Filter Notices
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-toggle="default-modal"
            >
              <X size={18} />
            </button>
          </header>
          <div className="overflow-y-scroll max-h-[70vh] p-4">
            <div className="grid grid-cols-1 gap-x-3 gap-y-4">
              <div className="">
                <label className="uppercase tracking-wide text-gray-700 text-sm font-bold block mb-2">
                  Title
                </label>
                <input
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  name="title"
                  value={filters.title}
                  onChange={handleChange}
                  type="text"
                />
              </div>
              <div className="">
                <label className="uppercase tracking-wide text-gray-700 text-sm font-bold flex gap-2 mb-2">
                  Date Picker
                </label>

                <div className="inline-flex w-full" role="group">
                  <input
                    className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded-s-md py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    name="fromDate"
                    value={filters.fromDate}
                    onChange={handleChange}
                    type="date"
                  />
                  <span className="inline-flex items-center px-4 py-2 m-0 text-sm font-medium border">
                    <b>to</b>
                  </span>
                  <input
                    className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded-e-md py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    name="toDate"
                    value={filters.toDate}
                    onChange={handleChange}
                    type="date"
                  />
                </div>
              </div>

              <div className="">
                <label className="uppercase tracking-wide text-gray-700 text-sm font-bold block mb-2">
                  Notice Number
                </label>
                <input
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  name="noticeNo"
                  value={filters.noticeNo}
                  onChange={handleChange}
                  type="text"
                />
              </div>
            </div>
          </div>
          <footer className="flex space-x-2 items-center px-4 py-2 border-t justify-end border-gray-200 rounded-b">
            <button
              onClick={handleResetFilters}
              className="rounded-md bg-gray-600 text-white  hover:opacity-90 hover:ring-2 hover:ring-gray-600 transition duration-200 delay-300 hover:text-opacity-100 px-8 py-2 uppercase"
              type="button"
              disabled={props.isLoading}
            >
              Reset
            </button>
            <button
              onClick={props.submitHandler}
              className="rounded-md bg-blue-600 text-white   hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 px-8 py-2 uppercase"
              type="button"
              disabled={props.isLoading}
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
