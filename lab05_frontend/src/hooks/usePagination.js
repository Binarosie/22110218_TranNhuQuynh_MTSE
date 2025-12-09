import { useState, useCallback } from 'react';

/**
 * Custom hook for pagination
 * @param {number} initialPageSize - Initial page size
 * @returns {object} Pagination state and handlers
 */
export const usePagination = (initialPageSize = 10) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const updatePagination = useCallback((pagination) => {
    if (!pagination) return;

    // ⚠️ Chỉ update totalItems và totalPages, KHÔNG update page/pageSize
    // để tránh infinite loop với useEffect
    setTotalItems(pagination.totalItems ?? 0);
    setTotalPages(pagination.totalPages ?? 1);
  }, []);

  const goToPage = useCallback((targetPage) => {
    setPage((prev) => {
      if (targetPage < 1) return 1;
      if (totalPages && targetPage > totalPages) return totalPages;
      return targetPage;
    });
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToFirstPage = useCallback(() => {
    setPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setPage(totalPages);
  }, [totalPages]);

  const changePageSize = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  }, []);

  const reset = useCallback(() => {
    setPage(1);
    setPageSize(initialPageSize);
    setTotalItems(0);
    setTotalPages(1);
  }, [initialPageSize]);

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    updatePagination,
    reset,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export default usePagination;
