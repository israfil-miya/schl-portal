'use client';

import { cn } from '@/lib/utils';
import { UserDataType } from '@/models/Users';
import { Trash2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';

interface PropsType {
  userData: UserDataType;
  submitHandler: (userData: UserDataType) => Promise<void>;
}
const DeleteButton: React.FC<PropsType> = props => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { data: session } = useSession();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'rounded-md bg-destructive hover:opacity-90 hover:ring-2 hover:ring-destructive transition duration-200 delay-300 hover:text-opacity-100 text-destructive-foreground p-2 items-center',
          session?.user.role === 'admin' &&
            (props.userData.role === 'admin' ||
              props.userData.role === 'super') &&
            'hidden',
        )}
      >
        <Trash2 size={18} />
      </button>

      <section
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 flex justify-center items-center transition-colors ${isOpen ? 'visible bg-black/20 disable-page-scroll' : 'invisible'} `}
      >
        <article
          onClick={e => e.stopPropagation()}
          className={`${isOpen ? 'scale-100 opacity-100' : 'scale-125 opacity-0'} bg-white rounded-lg shadow relative`}
        >
          <header className="flex items-center align-middle justify-between px-4 py-2 border-b rounded-t">
            <h3 className="text-gray-900 text-base lg:text-lg font-semibold  uppercase">
              Delete User
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center "
            >
              <X size={18} />
            </button>
          </header>
          <div className="overflow-hidden max-h-[70vh] p-4">
            <p className="text-base">
              Are you sure, you want to delete this user?
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
                props.submitHandler(props.userData);
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
    </>
  );
};

export default DeleteButton;
