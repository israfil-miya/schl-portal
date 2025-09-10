import { X } from 'lucide-react';
import React from 'react';

interface PropsType {
  children: React.ReactNode | string | undefined;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string | undefined;
  id?: string;
}

const Drawer: React.FC<PropsType> = ({
  children,
  isOpen,
  setIsOpen,
  title,
  id,
}) => {
  return (
    <main
      id={id}
      aria-hidden={isOpen ? 'false' : 'true'}
      tabIndex={isOpen ? 0 : -1}
      role="dialog"
      aria-modal="true"
      onClick={() => setIsOpen(false)}
      className={
        'fixed overflow-hidden z-10  bg-opacity-25 inset-0 transform ease-in-out ' +
        (isOpen
          ? 'transition-opacity opacity-100 duration-500 translate-x-0 disable-page-scroll'
          : 'transition-all delay-500 opacity-0 translate-x-full')
      }
    >
      <section
        onClick={e => e.stopPropagation()}
        className={
          'w-56 right-0 absolute bg-white h-full shadow-2xl delay-400 duration-500 ease-in-out transition-all transform  ' +
          (isOpen ? ' translate-x-0 ' : ' translate-x-full ')
        }
      >
        <article className={`relative w-56 flex flex-col space-y-2 h-full`}>
          <header className="pt-3 px-4 font-bold text-lg">
            <div className="flex justify-between">
              <h1 className="text-gray-500">{title}</h1>
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
              >
                <X size={18} />
              </button>
            </div>
          </header>
          {children}
        </article>
      </section>
    </main>
  );
};

export default Drawer;
