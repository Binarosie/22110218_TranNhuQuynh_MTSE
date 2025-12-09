/**
 * REST adapter for cart operations
 * Integrates with lab05_mysql_building REST API
 */

/**
 * Create REST adapter for cart
 * @param {string} baseURL - Base URL for API (e.g., http://localhost:3000)
 * @param {function} getToken - Function to retrieve JWT token
 */
export const cartRestAdapter = (baseURL, getToken) => {
  const apiURL = `${baseURL}/api/cart`;

  /**
   * Make authenticated request
   */
  const fetchWithAuth = async (url, options = {}) => {
    const token = getToken ? getToken() : null;

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || "API request failed");
    }

    return response.json();
  };

  return {
    /**
     * Get all cart items
     */
    async getCart() {
      const data = await fetchWithAuth(apiURL);
      return data.items || [];
    },

    /**
     * Add item to cart
     */
    async addItem(item) {
      const data = await fetchWithAuth(apiURL, {
        method: "POST",
        body: JSON.stringify(item),
      });
      return data.item;
    },

    /**
     * Update cart item
     */
    async updateItem(itemId, updates) {
      const data = await fetchWithAuth(`${apiURL}/${itemId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      return data.item;
    },

    /**
     * Remove item from cart
     */
    async removeItem(itemId) {
      await fetchWithAuth(`${apiURL}/${itemId}`, {
        method: "DELETE",
      });
    },

    /**
     * Clear all cart items
     */
    async clearCart() {
      await fetchWithAuth(apiURL, {
        method: "DELETE",
      });
    },

    /**
     * Sync local cart with server
     */
    async syncCart(items) {
      const data = await fetchWithAuth(`${apiURL}/sync`, {
        method: "POST",
        body: JSON.stringify({ items }),
      });
      return data.items || [];
    },
  };
};
