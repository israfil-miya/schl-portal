'use client';

import cn from '@/utility/cn';
import React, { useRef, useState } from 'react';

interface PropsType {
  className?: string;
  submitHandler: () => void;
  filters: {
    country: string;
    companyName: string;
    category: string;
    fromDate: string;
    toDate: string;
    test: boolean;
    generalSearchString: string;
    show: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  loading: boolean;
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
      country: '',
      companyName: '',
      category: '',
      fromDate: '',
      toDate: '',
      test: false,
      generalSearchString: '',
      show: 'all',
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
        </svg>
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
            <h3 className="text-gray-900 text-lg lg:text-xl font-semibold dark:text-white uppercase">
              Filter Clients
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </header>
          <div className="overflow-y-scroll max-h-[70vh] p-4">
            <div className="regular-search">
              <div className="grid grid-cols-1 gap-x-3 gap-y-4">
                <div className="">
                  <label className="uppercase tracking-wide text-gray-700 text-sm font-bold flex gap-2 mb-2">
                    Date Picker
                  </label>

                  <div className="inline-flex w-full" role="group">
                    <input
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded-s-md py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      name="fromDate"
                      value={filters.fromDate}
                      onChange={handleChange}
                      type="date"
                    />
                    <span className="inline-flex items-center px-4 py-2 m-0 text-sm font-medium border">
                      <b>to</b>
                    </span>
                    <input
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded-e-md py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      name="toDate"
                      value={filters.toDate}
                      onChange={handleChange}
                      type="date"
                    />
                  </div>
                </div>

                <div className="">
                  <label className="uppercase tracking-wide text-gray-700 text-sm font-bold block mb-2">
                    Country Name
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    name="country"
                    value={filters.country}
                    onChange={handleChange}
                    type="text"
                  />
                </div>
                <div className="">
                  <label className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2">
                    Category
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    name="category"
                    value={filters.category}
                    onChange={handleChange}
                    type="text"
                  />
                </div>
                <div className="">
                  <label className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2">
                    Company Name
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    name="companyName"
                    value={filters.companyName}
                    onChange={handleChange}
                    type="text"
                  />
                </div>
              </div>
              <div className="checkboxes flex flex-col sm:flex-row gap-4 my-4">
                <div className="flex gap-2 items-center">
                  <input
                    name="test"
                    checked={filters.test}
                    onChange={handleChange}
                    id="test-checkbox"
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="test-checkbox" className="uppercase ">
                    Test Job
                  </label>
                </div>
              </div>

              <div className="w-full">
                <label className="uppercase tracking-wide text-gray-700 text-sm font-bold flex gap-2 mb-2">
                  String Search
                </label>

                <input
                  placeholder="Search for any text"
                  name="generalSearchString"
                  value={filters.generalSearchString}
                  onChange={handleChange}
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                />
              </div>
            </div>
          </div>
          <footer className="flex space-x-2 items-center px-4 py-2 border-t justify-end border-gray-200 rounded-b">
            <button
              onClick={handleResetFilters}
              className="rounded-md bg-gray-600 text-white  hover:opacity-90 hover:ring-2 hover:ring-gray-600 transition duration-200 delay-300 hover:text-opacity-100 px-8 py-2 uppercase"
              type="button"
              disabled={props.loading}
            >
              Reset
            </button>
            <button
              onClick={props.submitHandler}
              className="rounded-md bg-blue-600 text-white   hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 px-8 py-2 uppercase"
              type="button"
              disabled={props.loading}
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
