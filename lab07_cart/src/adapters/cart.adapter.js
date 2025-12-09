/**
 * Backend adapter for cart operations
 * Switches between REST and GraphQL based on configuration
 */

import { cartRestAdapter } from "./cart.rest";
import { cartGraphQLAdapter } from "./cart.graphql";

/**
 * Create cart adapter
 * @param {Object} config
 * @param {string} config.mode - 'rest' or 'graphql'
 * @param {string} config.baseURL - Base URL for API
 * @param {function} config.getToken - Function to retrieve JWT token
 */
export const createCartAdapter = (config = {}) => {
  const { mode = "rest", baseURL, getToken } = config;

  if (mode === "graphql") {
    return cartGraphQLAdapter(baseURL, getToken);
  }

  return cartRestAdapter(baseURL, getToken);
};

/**
 * Cart adapter interface
 * Both REST and GraphQL adapters implement these methods:
 *
 * - getCart(): Promise<Array> - Fetch all cart items
 * - addItem(item): Promise<Object> - Add item to cart
 * - updateItem(itemId, updates): Promise<Object> - Update cart item
 * - removeItem(itemId): Promise<void> - Remove item from cart
 * - clearCart(): Promise<void> - Clear all items
 * - syncCart(items): Promise<Array> - Sync local cart with server
 */
