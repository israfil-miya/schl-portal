import React from 'react';

interface PropsType {
  children: React.ReactNode | string | undefined;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string | undefined;
}

const Drawer: React.FC<PropsType> = ({
  children,
  isOpen,
  setIsOpen,
  title,
}) => {
  return (
    <main
      onClick={() => setIsOpen(false)}
      className={
        'fixed overflow-hidden z-10  bg-opacity-25 inset-0 transform ease-in-out ' +
        (isOpen
          ? 'transition-opacity opacity-100 duration-500 translate-x-0 disable-page-scroll'
          : 'transition-all delay-500 opacity-0 translate-x-full')
      }
    >
      <section
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
            </div>
          </header>
          {children}
        </article>
      </section>
    </main>
  );
};

export default Drawer;
