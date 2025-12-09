import { useState, useCallback } from 'react';

/**
 * Custom hook for managing filters
 * @param {object} initialFilters - Initial filter values
 * @returns {object} Filter state and handlers
 */
export const useFilter = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const resetFilter = useCallback((key) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const resetAllFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const removeEmptyFilters = useCallback(() => {
    const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
    return cleanedFilters;
  }, [filters]);

  const hasActiveFilters = useCallback(() => {
    return Object.keys(filters).some(key => 
      filters[key] !== '' && filters[key] !== null && filters[key] !== undefined
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilter,
    resetAllFilters,
    removeEmptyFilters,
    hasActiveFilters,
  };
};

export default useFilter;
