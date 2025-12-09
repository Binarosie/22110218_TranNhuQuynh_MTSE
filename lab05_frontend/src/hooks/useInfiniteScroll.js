import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for infinite scroll
 * @param {Function} fetchMore - Function to fetch more data
 * @param {object} options - Configuration options
 * @returns {object} Infinite scroll state and handlers
 */
export const useInfiniteScroll = (fetchMore, options = {}) => {
  const {
    threshold = 100, // Distance from bottom to trigger load
    initialPage = 1,
    pageSize = 20,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Load more data
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchMore(page, pageSize);
      // Handle both response.data.data and response.data formats
      const newData = response.data?.data || response.data || [];
      const pagination = response.data?.pagination || response.pagination || {};

      setData((prevData) => [...prevData, ...newData]);
      setHasMore(pagination.hasMore || false);
      setPage((prevPage) => prevPage + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load more data');
      console.error('Infinite scroll error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, loading, hasMore, fetchMore]);

  // Initial load
  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData([]);
    setPage(initialPage);
    setHasMore(true);

    try {
      const response = await fetchMore(initialPage, pageSize);
      // Handle both response.data.data and response.data formats
      const newData = response.data?.data || response.data || [];
      const pagination = response.data?.pagination || response.pagination || {};

      setData(newData);
      setHasMore(pagination.hasMore || false);
      setPage(initialPage + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
      console.error('Initial load error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchMore, initialPage, pageSize]);

  // Setup intersection observer
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        loadMore();
      }
    }, options);

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observerRef.current.observe(currentLoadMoreRef);
    }

    return () => {
      if (observerRef.current && currentLoadMoreRef) {
        observerRef.current.unobserve(currentLoadMoreRef);
      }
    };
  }, [hasMore, loading, loadMore, threshold]);
  // Reset function - now automatically fetches first page
  const reset = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData([]);
    setPage(initialPage);
    setHasMore(true);

    try {
      const response = await fetchMore(initialPage, pageSize);
      // Handle both response.data.data and response.data formats
      const newData = response.data?.data || response.data || [];
      const pagination = response.data?.pagination || response.pagination || {};

      setData(newData);
      setHasMore(pagination.hasMore || false);
      setPage(initialPage + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
      console.error('Reset/initial load error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchMore, initialPage, pageSize]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    loadInitial,
    reset,
    loadMoreRef,
  };
};

export default useInfiniteScroll;
