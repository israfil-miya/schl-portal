'use client';

import { ReportDataType } from '@/models/Reports';
import { Trash2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useRef, useState } from 'react';

interface PropsType {
  reportData: ReportDataType;
  submitHandler: (reportData: ReportDataType) => Promise<void>;
}
const DeleteButton: React.FC<PropsType> = props => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { data: session } = useSession();
  const popupRef = useRef<HTMLElement>(null);

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      popupRef.current &&
      !popupRef.current.contains(e.target as Node) &&
      !popupRef.current.querySelector(
        'input:focus, textarea:focus, button:focus',
      )
    ) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-red-600 text-white hover:opacity-90 hover:ring-2 hover:ring-red-600 transition duration-200 delay-300 hover:text-opacity-100 px-2 py-1"
        type="button"
      >
        <Trash2 size={18} />
      </button>
      {isOpen && (
        <section
          onClick={handleClickOutside}
          className="fixed inset-0 flex justify-center items-center transition-colors bg-black/20 disable-page-scroll"
        >
          <article
            ref={popupRef}
            onClick={e => e.stopPropagation()}
            className="scale-100 opacity-100 bg-white rounded-lg shadow relative"
          >
            <header className="flex items-center align-middle justify-between px-4 py-2 border-b rounded-t">
              <h3 className="text-gray-900 text-lg lg:text-xl font-semibold  uppercase">
                Delete Report
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
              >
                <X size={18} />
              </button>
            </header>
            <div className="overflow-hidden max-h-[70vh] p-4">
              <p className="text-base">
                Are you sure, you want to delete this report?
              </p>
            </div>
            <footer className="flex space-x-2 items-center px-4 py-2 border-t justify-end border-gray-200 rounded-b">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md bg-gray-600 text-white  hover:opacity-90 hover:ring-2 hover:ring-gray-600 transition duration-200 delay-300 hover:text-opacity-100 px-4 py-1"
                type="button"
              >
                No
              </button>
              <button
                onClick={() => {
                  props.submitHandler(props.reportData);
                  setIsOpen(false);
                }}
                className="rounded-md bg-red-600 text-white  hover:opacity-90 hover:ring-2 hover:ring-red-600 transition duration-200 delay-300 hover:text-opacity-100 px-4 py-1"
                type="button"
              >
                Yes
              </button>
            </footer>
          </article>
        </section>
      )}
    </>
  );
};

export default DeleteButton;
