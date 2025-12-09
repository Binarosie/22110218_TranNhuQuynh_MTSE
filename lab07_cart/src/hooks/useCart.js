import { useState, useEffect, useCallback, useMemo } from "react";
import { createCartAdapter } from "../adapters/cart.adapter";
import { validateCartItem } from "../utils/cart.validate";
import { calculateCartTotals } from "../utils/cart.calculate";

/**
 * useCart - Core hook for cart management
 *
 * @param {Object} config
 * @param {string} config.mode - 'rest' or 'graphql'
 * @param {string} config.baseURL - Base URL for API
 * @param {function} config.getToken - Function to retrieve JWT token
 * @param {boolean} config.autoSync - Auto sync with backend (default: true)
 * @param {number} config.syncInterval - Sync interval in ms (default: 30000)
 *
 * @returns {Object} Cart state and operations
 */
export const useCart = (config = {}) => {
  const {
    mode = "rest",
    baseURL = "http://localhost:3000",
    getToken,
    autoSync = true,
    syncInterval = 30000, // 30 seconds
    enabled = true, // Only fetch cart when enabled (e.g., user is logged in)
  } = config;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const adapter = useMemo(() => {
    return createCartAdapter({ mode, baseURL, getToken });
  }, [mode, baseURL, getToken]);

  /**
   * Load cart from backend
   */
  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cartItems = await adapter.getCart();
      setItems(cartItems);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load cart:", err);
    } finally {
      setLoading(false);
    }
  }, [adapter]);

  /**
   * Add item to cart
   */
  const addItem = useCallback(
    async (item) => {
      setError(null);

      // Validate item
      const validation = validateCartItem(item);
      if (!validation.isValid) {
        setError(validation.error);
        return false;
      }

      // Check if item already exists
      const existingItem = items.find(
        (i) => i.apartmentId === item.apartmentId && i.mode === item.mode
      );

      if (existingItem) {
        setError("Căn hộ này đã có trong giỏ hàng");
        return false;
      }

      try {
        const newItem = await adapter.addItem(item);
        setItems((prev) => [...prev, { ...item, ...newItem, selected: true }]);
        return true;
      } catch (err) {
        setError(err.message);
        console.error("Failed to add item:", err);
        return false;
      }
    },
    [adapter, items]
  );

  /**
   * Update item in cart
   */
  const updateItem = useCallback(
    async (itemId, updates) => {
      setError(null);
      try {
        const updatedItem = await adapter.updateItem(itemId, updates);
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, ...updates, ...updatedItem } : item
          )
        );
        return true;
      } catch (err) {
        setError(err.message);
        console.error("Failed to update item:", err);
        return false;
      }
    },
    [adapter]
  );

  /**
   * Remove item from cart
   */
  const removeItem = useCallback(
    async (itemId) => {
      setError(null);
      try {
        await adapter.removeItem(itemId);
        setItems((prev) => prev.filter((item) => item.id !== itemId));
        return true;
      } catch (err) {
        setError(err.message);
        console.error("Failed to remove item:", err);
        return false;
      }
    },
    [adapter]
  );

  /**
   * Toggle item selection
   */
  const toggleSelect = useCallback((itemId) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  }, []);

  /**
   * Select all items
   */
  const selectAll = useCallback((selected = true) => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        selected,
      }))
    );
  }, []);

  /**
   * Clear cart
   */
  const clearCart = useCallback(async () => {
    setError(null);
    try {
      await adapter.clearCart();
      setItems([]);
      return true;
    } catch (err) {
      setError(err.message);
      console.error("Failed to clear cart:", err);
      return false;
    }
  }, [adapter]);

  /**
   * Update lease term for rent items
   */
  const updateMonths = useCallback(
    async (itemId, months) => {
      return updateItem(itemId, { months });
    },
    [updateItem]
  );

  /**
   * Sync with backend
   */
  const syncWithBackend = useCallback(async () => {
    if (syncing) return;

    setSyncing(true);
    setError(null);
    try {
      const syncedItems = await adapter.syncCart(items);
      setItems(syncedItems);
    } catch (err) {
      console.error("Failed to sync cart:", err);
      // Don't set error for sync failures to avoid disrupting UX
    } finally {
      setSyncing(false);
    }
  }, [adapter, items, syncing]);

  /**
   * Calculate totals
   */
  const totals = calculateCartTotals(items);

  /**
   * Get selected items
   */
  const selectedItems = items.filter((item) => item.selected);

  /**
   * Load cart on mount
   */
  useEffect(() => {
    if (!enabled) return;
    loadCart();
  }, [enabled, loadCart]);

  /**
   * Auto sync with backend
   */
  useEffect(() => {
    if (!autoSync || !enabled) return;

    const intervalId = setInterval(() => {
      syncWithBackend();
    }, syncInterval);

    return () => clearInterval(intervalId);
  }, [autoSync, enabled, syncInterval, syncWithBackend]);

  return {
    // State
    items,
    selectedItems,
    totals,
    loading,
    error,
    syncing,

    // Operations
    addItem,
    updateItem,
    removeItem,
    updateMonths,
    toggleSelect,
    selectAll,
    clearCart,
    syncWithBackend,
    loadCart,
  };
};

export default useCart;
