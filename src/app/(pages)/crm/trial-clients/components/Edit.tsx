import React, { useEffect, useRef, useState } from 'react';

import { useSession } from 'next-auth/react';

import { YYYY_MM_DD_to_DD_MM_YY as convertToDDMMYYYY } from '@/utility/dateConversion';

interface PropsType {
  reportData: { [key: string]: any };
  isLoading: boolean;
  submitHandler: (
    reportId: string,
    isRecall: boolean,
    reportData: { [key: string]: any },
    editedData: { [key: string]: any },
    setEditedData: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>,
    setIsRecall: React.Dispatch<React.SetStateAction<boolean>>,
  ) => Promise<void>;
}

const EditButton: React.FC<PropsType> = props => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { data: session } = useSession();
  const [editedBy, setEditedBy] = useState<string>('');
  const [isRecall, setIsRecall] = useState<boolean>(false);
  const popupRef = useRef<HTMLElement>(null);

  const [editedData, setEditedData] = useState<{ [key: string]: any }>({
    ...props.reportData,
    updated_by: session?.user.real_name || '',
  });

  useEffect(() => {
    if (!isOpen) {
      setEditedData({
        ...props.reportData,
        updated_by: session?.user.real_name || '',
      });
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, type, value } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;

      if (name == 'followup_done') {
        setEditedData(prevData => ({
          ...prevData,
          followup_done: !checked, // to mark as pending, followup_done should be false when checked
        }));
      } else {
        setEditedData(prevData => ({
          ...prevData,
          [name]: checked,
        }));
      }

      if (!checked && name === 'is_prospected')
        setEditedData(prevData => ({
          ...prevData,
          prospect_status: '',
        }));
    } else {
      setEditedData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
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
        disabled={props.isLoading}
        onClick={() => {
          setIsOpen(true);
          setIsRecall(false);
          setEditedBy(props.reportData.updated_by || '');
        }}
        className="items-center gap-2 rounded-md bg-blue-600 hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
          <path
            fillRule="evenodd"
            d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
          />
        </svg>
      </button>

      <section
        onClick={handleClickOutside}
        className={`fixed z-50 inset-0 flex justify-center items-center transition-colors ${isOpen ? 'visible bg-black/20 disable-page-scroll' : 'invisible'} `}
      >
        <article
          ref={popupRef}
          onClick={e => e.stopPropagation()}
          className={`${isOpen ? 'scale-100 opacity-100' : 'scale-125 opacity-0'} bg-white rounded-lg shadow relative md:w-[60vw] lg:w-[40vw]  text-wrap`}
        >
          <header className="flex items-center align-middle justify-between px-4 py-2 border-b rounded-t">
            <h3 className="text-gray-900 text-lg lg:text-xl font-semibold dark:text-white uppercase">
              Edit Report
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-toggle="default-modal"
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
          <div className="overflow-x-hidden overflow-y-scroll max-h-[70vh] p-4 text-start">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4">
              <div>
                <label
                  className="uppercase tracking-wide text-gray-700 text-sm font-bold flex gap-2 mb-2"
                  htmlFor="grid-first-name"
                >
                  First Calling Date
                  <span className="cursor-pointer has-tooltip">
                    &#9432;
                    <span className="tooltip italic font-medium rounded-md text-xs shadow-lg p-1 px-2 bg-gray-100 ml-2">
                      Can&apos;t change
                    </span>
                  </span>
                </label>
                <input
                  disabled
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  value={editedData.calling_date}
                  type="date"
                  name="calling_date"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  className="uppercase tracking-wide text-gray-700 text-sm font-bold block mb-2"
                  htmlFor="grid-last-name"
                >
                  Followup Date
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  value={editedData.followup_date}
                  name="followup_date"
                  onChange={handleChange}
                  type="date"
                />
              </div>

              <div>
                <label
                  className="uppercase tracking-wide text-gray-700 text-sm font-bold block mb-2"
                  htmlFor="grid-password"
                >
                  Country
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  name="country"
                  value={editedData.country}
                  onChange={handleChange}
                  type="text"
                />
              </div>

              <div>
                <label
                  className="uppercase tracking-wide text-gray-700 text-sm font-bold flex gap-2 mb-2"
                  htmlFor="grid-password"
                >
                  Website
                  <span className="cursor-pointer has-tooltip">
                    &#9432;
                    <span className="tooltip italic font-medium rounded-md text-xs shadow-lg p-1 px-2 bg-gray-100 ml-2">
                      Separated by space
                    </span>
                  </span>
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  name="website"
                  value={editedData.website}
                  onChange={handleChange}
                  type="text"
                />
              </div>

              <div>
                <label
                  className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Category
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  name="category"
                  value={editedData.category}
                  onChange={handleChange}
                  type="text"
                />
              </div>

              <div>
                <label
                  className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Company
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  name="company_name"
                  value={editedData.company_name}
                  onChange={handleChange}
                  type="text"
                />
              </div>

              <div>
                <label
                  className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Contact Person
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  name="contact_person"
                  value={editedData.contact_person}
                  onChange={handleChange}
                  type="text"
                />
              </div>

              <div>
                <label
                  className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Contact Number
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  name="contact_number"
                  value={editedData.contact_number}
                  onChange={handleChange}
                  type="text"
                />
              </div>

              <div>
                <label
                  className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Designation
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  name="designation"
                  value={editedData.designation}
                  onChange={handleChange}
                  type="text"
                />
              </div>

              <div>
                <label
                  className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Email address
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  name="email_address"
                  value={editedData.email_address}
                  onChange={handleChange}
                  type="text"
                />
              </div>

              <div>
                <label
                  className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
                  htmlFor="grid-password"
                >
                  Status
                </label>
                <textarea
                  rows={5}
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  name="calling_status"
                  value={editedData.calling_status}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  className="uppercase tracking-wide text-gray-700 text-sm font-bold flex gap-2 mb-2"
                  htmlFor="grid-last-name"
                >
                  Calling Date History
                  <span className="cursor-pointer has-tooltip">
                    &#9432;
                    <span className="tooltip italic font-medium rounded-md text-xs shadow-lg p-1 px-2 bg-gray-100 ml-2">
                      Chan&apos;t change directly
                    </span>
                  </span>
                </label>
                <textarea
                  rows={5}
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  name="calling_date_history"
                  value={editedData.calling_date_history
                    ?.map((date: string) => `${convertToDDMMYYYY(date)}`)
                    .join('\n')}
                  // onChange={handleChange}
                  disabled
                />
              </div>

              <div>
                <label
                  className="uppercase tracking-wide text-gray-700 text-sm font-bold flex gap-2 mb-2"
                  htmlFor="grid-last-name"
                >
                  Test Given Date History
                  <span className="cursor-pointer has-tooltip">
                    &#9432;
                    <span className="tooltip italic font-medium rounded-md text-xs shadow-lg p-1 px-2 bg-gray-100 ml-2">
                      Chan&apos;t change directly
                    </span>
                  </span>
                </label>
                <textarea
                  rows={5}
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  name="test_given_date_history"
                  value={editedData.test_given_date_history
                    ?.map((date: string) => `${convertToDDMMYYYY(date)}`)
                    .join('\n')}
                  // onChange={handleChange}
                  disabled
                />
              </div>

              <div className="flex flex-col gap-2">
                <div>
                  <label
                    className="uppercase tracking-wide text-gray-700 text-sm font-bold flex gap-2 mb-2"
                    htmlFor="grid-password"
                  >
                    Linkedin
                    <span className="cursor-pointer has-tooltip">
                      &#9432;
                      <span className="tooltip italic font-medium rounded-md text-xs shadow-lg p-1 px-2 bg-gray-100 ml-2">
                        Separated by space
                      </span>
                    </span>
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    type="text"
                    name="linkedin"
                    value={editedData.linkedin}
                    onChange={handleChange}
                  />
                </div>

                {editedData.is_prospected && (
                  <div>
                    <label
                      className="uppercase tracking-wide text-gray-700 text-sm font-bold block mb-2"
                      htmlFor="grid-last-name"
                    >
                      Prospect Status
                    </label>
                    <select
                      value={editedData.prospect_status}
                      onChange={e =>
                        setEditedData(prevData => ({
                          ...prevData,
                          prospect_status: e.target.value,
                        }))
                      }
                      // defaultValue={''}
                      required
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    >
                      <option value={''} className="text-gray-400">
                        Select prospect status
                      </option>
                      <option value="high_interest">High Interest</option>
                      <option value="low_interest">Low Interest</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="checkboxes flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex gap-2 items-center">
                <input
                  name="is_test"
                  checked={editedData.is_test}
                  onChange={handleChange}
                  id="test-job-checkbox"
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="test-job-checkbox" className="uppercase ">
                  Test Job
                </label>
              </div>

              <div className="flex gap-2 items-center">
                <input
                  name="is_prospected"
                  checked={editedData.is_prospected}
                  onChange={handleChange}
                  id="prospecting-checkbox"
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="prospecting-checkbox" className="uppercase ">
                  Prospecting
                </label>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  name="followup_done"
                  checked={!editedData.followup_done}
                  onChange={handleChange}
                  id="followup-done-checkbox"
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="followup-done-checkbox" className="uppercase ">
                  Followup Pending
                </label>
              </div>

              <div className="flex gap-2 items-center">
                <input
                  name="regular_client"
                  checked={editedData.regular_client}
                  onChange={handleChange}
                  id="regular-client-checkbox"
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="regular-client-checkbox" className="uppercase ">
                  Regular Client
                </label>
              </div>

              <div className="flex gap-2 items-center">
                <input
                  name="is_recall"
                  checked={isRecall}
                  onChange={() => setIsRecall(!isRecall)}
                  id="recall-checkbox"
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="recall-checkbox" className="uppercase ">
                  Recall
                </label>
              </div>
            </div>
          </div>
          <footer className="flex items-center px-4 py-2 border-t justify-between gap-6 border-gray-200 rounded-b">
            <div className="text-md">
              {editedBy && (
                <p>
                  <span className="underline">Last updated by:</span>{' '}
                  <span className="">{editedBy}</span>
                </p>
              )}
            </div>
            <div className="buttons space-x-2 ">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md bg-gray-600 text-white  hover:opacity-90 hover:ring-2 hover:ring-gray-600 transition duration-200 delay-300 hover:text-opacity-100 px-8 py-2 uppercase"
                type="button"
              >
                Close
              </button>
              <button
                onClick={() => {
                  props.submitHandler(
                    props.reportData?._id,
                    isRecall,
                    props.reportData,
                    editedData,
                    setEditedData,
                    setIsRecall,
                  );
                  setIsOpen(false);
                }}
                className="rounded-md bg-blue-600 text-white  hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 px-8 py-2 uppercase"
                type="button"
              >
                Submit
              </button>
            </div>
          </footer>
        </article>
      </section>
    </>
  );
};

export default EditButton;
