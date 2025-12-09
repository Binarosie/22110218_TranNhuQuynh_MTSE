/**
 * GraphQL adapter for cart operations
 * Integrates with lab05_mysql_building GraphQL API
 */

/**
 * Create GraphQL adapter for cart
 * @param {string} baseURL - Base URL for GraphQL endpoint
 * @param {function} getToken - Function to retrieve JWT token
 */
export const cartGraphQLAdapter = (baseURL, getToken) => {
  const graphqlURL = `${baseURL}/graphql`;

  /**
   * Make GraphQL request
   */
  const graphqlRequest = async (query, variables = {}) => {
    const token = getToken ? getToken() : null;

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(graphqlURL, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data;
  };

  return {
    /**
     * Get all cart items
     */
    async getCart() {
      const query = `
        query GetCart {
          cart {
            id
            apartmentId
            code
            title
            type
            area
            price
            mode
            months
            status
            block
            building
            floor
            bedrooms
            bathrooms
            balconies
            parkingSlots
            amenities
            maintenanceFee
            deposit
            minLeaseTerm
            maxLeaseTerm
            selected
          }
        }
      `;

      const data = await graphqlRequest(query);
      return data.cart || [];
    },

    /**
     * Add item to cart
     */
    async addItem(item) {
      const mutation = `
        mutation AddToCart($input: CartItemInput!) {
          addToCart(input: $input) {
            id
            apartmentId
            code
            title
            mode
            months
            price
            selected
          }
        }
      `;

      const data = await graphqlRequest(mutation, { input: item });
      return data.addToCart;
    },

    /**
     * Update cart item
     */
    async updateItem(itemId, updates) {
      const mutation = `
        mutation UpdateCartItem($id: ID!, $input: CartItemUpdateInput!) {
          updateCartItem(id: $id, input: $input) {
            id
            months
            mode
            price
            selected
          }
        }
      `;

      const data = await graphqlRequest(mutation, {
        id: itemId,
        input: updates,
      });
      return data.updateCartItem;
    },

    /**
     * Remove item from cart
     */
    async removeItem(itemId) {
      const mutation = `
        mutation RemoveFromCart($id: ID!) {
          removeFromCart(id: $id)
        }
      `;

      await graphqlRequest(mutation, { id: itemId });
    },

    /**
     * Clear all cart items
     */
    async clearCart() {
      const mutation = `
        mutation ClearCart {
          clearCart
        }
      `;

      await graphqlRequest(mutation);
    },

    /**
     * Sync local cart with server
     */
    async syncCart(items) {
      const mutation = `
        mutation SyncCart($items: [CartItemInput!]!) {
          syncCart(items: $items) {
            id
            apartmentId
            code
            title
            mode
            months
            price
            selected
          }
        }
      `;

      const data = await graphqlRequest(mutation, { items });
      return data.syncCart || [];
    },
  };
};
