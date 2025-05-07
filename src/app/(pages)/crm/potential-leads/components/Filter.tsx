'use client';

import { cn } from '@/lib/utils';
import {
  setCalculatedZIndex,
  setClassNameAndIsDisabled,
  setMenuPortalTarget,
} from '@/utility/selectHelpers';
import { Filter, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import Select from 'react-select';

const baseZIndex = 50;

interface PropsType {
  className?: string;
  submitHandler: () => void;
  marketerNames: string[];
  filters: {
    marketerName: string;
    country: string;
    companyName: string;
    category: string;
    fromDate: string;
    toDate: string;
    test: boolean;
    prospectStatus: string;
    generalSearchString: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  loading: boolean;
}

const FilterButton: React.FC<PropsType> = props => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { filters, setFilters } = props;
  const popupRef = useRef<HTMLElement>(null);

  const marketerOptions = (props.marketerNames || []).map(name => ({
    label: name,
    value: name,
  }));

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
      marketerName: '',
      country: '',
      companyName: '',
      category: '',
      fromDate: '',
      toDate: '',
      test: false,
      prospectStatus: '',
      generalSearchString: '',
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
        className={`fixed z-${baseZIndex} inset-0 flex justify-center items-center transition-colors ${isOpen ? 'visible bg-black/20 disable-page-scroll' : 'invisible'} `}
      >
        <article
          ref={popupRef}
          onClick={e => e.stopPropagation()}
          className={`${isOpen ? 'scale-100 opacity-100' : 'scale-125 opacity-0'} bg-white rounded-lg lg:w-[35vw] md:w-[70vw] sm:w-[80vw] shadow relative`}
        >
          <header className="flex items-center align-middle justify-between px-4 py-2 border-b rounded-t">
            <h3 className="text-gray-900 text-lg lg:text-xl font-semibold  uppercase">
              Filter Reports
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            >
              <X size={18} />
            </button>
          </header>
          <div className="overflow-y-scroll max-h-[70vh] p-4">
            <div className="regular-search">
              <div className="grid grid-cols-1 gap-x-3 gap-y-4">
                <div>
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

                <div>
                  <label className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2">
                    Marketer
                  </label>
                  <Select
                    {...setClassNameAndIsDisabled(isOpen)}
                    options={marketerOptions}
                    closeMenuOnSelect={true}
                    classNamePrefix="react-select"
                    menuPortalTarget={setMenuPortalTarget}
                    menuPlacement="auto"
                    menuPosition="fixed" // Prevent clipping by parent containers
                    styles={setCalculatedZIndex(baseZIndex)}
                    value={
                      marketerOptions.find(
                        option => option.value === filters.marketerName,
                      ) || null
                    }
                    onChange={selectedOption =>
                      setFilters((prevFilters: PropsType['filters']) => ({
                        ...prevFilters,
                        marketerName: selectedOption?.value || '',
                      }))
                    }
                    placeholder="Select marketer"
                  />
                </div>

                <div>
                  <label className="uppercase tracking-wide text-gray-700 text-sm font-bold block mb-2">
                    Country Name
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    name="country"
                    value={filters.country}
                    onChange={handleChange}
                    type="text"
                    placeholder="Search by country name"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2">
                    Category
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    name="category"
                    value={filters.category}
                    onChange={handleChange}
                    type="text"
                    placeholder="Search by category"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2">
                    Company Name
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    name="companyName"
                    value={filters.companyName}
                    onChange={handleChange}
                    type="text"
                    placeholder="Search by company name"
                  />
                </div>
                <div>
                  <label
                    className="uppercase tracking-wide text-gray-700 text-sm font-bold block mb-2"
                    htmlFor="grid-last-name"
                  >
                    Prospect Status
                  </label>
                  <select
                    name="prospectStatus"
                    value={filters.prospectStatus}
                    onChange={handleChange}
                    // defaultValue={''}
                    required
                    className="appearance-none cursor-pointer block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  >
                    <option value={''} className="text-gray-400">
                      Select prospect status
                    </option>
                    <option value="high_interest">High Interest</option>
                    <option value="low_interest">Low Interest</option>
                  </select>
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
                    className="w-5 h-5 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
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
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                />
              </div>
            </div>
          </div>
          <footer className="flex space-x-2 items-center px-4 py-2 border-t justify-end border-gray-200 rounded-b">
            <button
              onClick={handleResetFilters}
              className="rounded-md bg-gray-600 text-white  hover:opacity-90 hover:ring-2 hover:ring-gray-600 transition duration-200 delay-300 hover:text-opacity-100 px-4 py-1"
              type="button"
              disabled={props.loading}
            >
              Reset
            </button>
            <button
              onClick={props.submitHandler}
              className="rounded-md bg-blue-600 text-white   hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 px-4 py-1"
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
