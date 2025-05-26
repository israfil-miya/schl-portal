import {
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUp,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { cn, getInlinePages } from '../lib/utils';

type PaginationProps = {
  page: number;
  pageCount: number;
  isLoading: boolean;
  setPage: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  page,
  pageCount,
  isLoading,
  setPage,
}) => {
  const [showAllPages, setShowAllPages] = useState(false);
  const ellipsisRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ellipsisRef.current &&
        !ellipsisRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowAllPages(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderCompactPagination = () => {
    const inlinePages = getInlinePages(page, pageCount);

    return (
      <div className="inline-flex items-center" role="group">
        {inlinePages.map(pg => (
          <button
            key={pg}
            onClick={() => {
              setPage(pg);
              setShowAllPages(false);
            }}
            className={cn(
              `px-4 py-2 text-sm border-y border-r border-gray-200 transition-colors duration-150 ${
                pg === page
                  ? 'bg-blue-500 border-blue-500 text-white hover:bg-blue-600 hover:border-blue-600'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`,
            )}
            aria-label={`Go to page ${pg}`}
          >
            {pg}
          </button>
        ))}
        {pageCount > 3 && (
          <div className="relative text-sm">
            <button
              onClick={() => setShowAllPages(prev => !prev)}
              className="px-4 py-2 border-y border-gray-200 bg-gray-50 text-gray-700 flex items-center gap-1 transition-colors duration-150 hover:bg-gray-100"
              aria-label="Toggle page dropdown"
              aria-expanded={showAllPages}
              ref={ellipsisRef}
            >
              Jump
              {showAllPages ? (
                <ChevronsUp size={16} className="stroke-slate-400" />
              ) : (
                <ChevronsDown size={16} className="stroke-slate-400" />
              )}
            </button>
            {showAllPages && (
              <div
                className="absolute z-50 mt-2 bg-white border border-gray-200 shadow-md max-h-60 overflow-y-auto"
                style={{ width: '5rem' }}
                ref={dropdownRef}
              >
                {Array.from({ length: pageCount }, (_, i) => i + 1).map(pg => (
                  <button
                    key={pg}
                    onClick={() => {
                      setPage(pg);
                      setShowAllPages(false);
                    }}
                    className={`block w-full text-left px-3 py-1 transition-colors duration-150 hover:bg-blue-100 ${
                      pg === page ? 'bg-blue-200 font-bold' : ''
                    }`}
                    aria-label={`Go to page ${pg}`}
                  >
                    {pg}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="inline-flex items-center" role="group">
      <button
        onClick={() => setPage(1)}
        disabled={page === 1 || pageCount === 0 || isLoading}
        className="hidden md:inline-flex gap-2 items-center px-4 py-2 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-l-md 
          focus:outline-none hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-150"
        aria-label="Go to first page"
      >
        <ChevronsLeft size={16} className="stroke-slate-400" />
        <span>First</span>
      </button>

      {renderCompactPagination()}

      <button
        onClick={() => setPage(pageCount)}
        disabled={page === pageCount || pageCount === 0 || isLoading}
        className="hidden md:inline-flex gap-2 items-center px-4 py-2 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-r-md 
          focus:outline-none hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-150"
        aria-label="Go to last page"
      >
        <span>Last</span>
        <ChevronsRight size={16} className="stroke-slate-400" />
      </button>
    </div>
  );
};

export default Pagination;
