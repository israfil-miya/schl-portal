import moment from 'moment-timezone';
import React, { createContext, Dispatch } from 'react';

export type FiltersType = {
  fromDate: string;
  toDate: string;
  flowType: 'orders' | 'files';
};

export type FiltersContextType = {
  filters: FiltersType;
  setFilters: Dispatch<React.SetStateAction<FiltersType>>;
  updateFilters: (updatedFilters: Partial<FiltersType>) => void;
  resetFilters: () => void;
};

const FiltersContext = createContext<FiltersContextType | null>(null);

function FiltersContextProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = React.useState<FiltersType>({
    fromDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    toDate: moment().format('YYYY-MM-DD'),
    flowType: 'files',
  });

  const updateFilters = (updatedFilters: Partial<FiltersType>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...updatedFilters,
    }));
  };

  const resetFilters = () => {
    setFilters({
      fromDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
      toDate: moment().format('YYYY-MM-DD'),
      flowType: 'files',
    });
  };

  return (
    <FiltersContext.Provider
      value={{
        filters,
        setFilters,
        updateFilters,
        resetFilters,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
}

export { FiltersContext, FiltersContextProvider };
