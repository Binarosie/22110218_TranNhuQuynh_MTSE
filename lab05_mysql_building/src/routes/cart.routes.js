const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// In-memory cart storage (sử dụng database trong production)
const carts = new Map();

/**
 * GET /api/cart
 * Get all cart items for current user
 */
router.get('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = carts.get(userId) || [];
    res.json({ items: cartItems });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to get cart items' });
  }
});

/**
 * POST /api/cart
 * Add item to cart
 */
router.post('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const item = {
      id: Date.now().toString(),
      ...req.body,
      selected: true,
      createdAt: new Date(),
    };
    
    const userCart = carts.get(userId) || [];
    
    // Check if apartment already in cart
    const exists = userCart.find(
      i => i.apartmentId === item.apartmentId && i.mode === item.mode
    );
    
    if (exists) {
      return res.status(400).json({ error: 'Apartment already in cart' });
    }
    
    userCart.push(item);
    carts.set(userId, userCart);
    
    res.json({ item });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

/**
 * PUT /api/cart/:id
 * Update cart item (e.g., change lease term)
 */
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const userCart = carts.get(userId) || [];
    
    const index = userCart.findIndex(item => item.id === id);
    if (index !== -1) {
      userCart[index] = { 
        ...userCart[index], 
        ...req.body,
        updatedAt: new Date(),
      };
      carts.set(userId, userCart);
      res.json({ item: userCart[index] });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

/**
 * DELETE /api/cart/:id
 * Remove specific item from cart
 */
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const userCart = carts.get(userId) || [];
    
    const filtered = userCart.filter(item => item.id !== id);
    carts.set(userId, filtered);
    res.json({ success: true });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

/**
 * DELETE /api/cart
 * Clear all items from cart
 */
router.delete('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    carts.set(userId, []);
    res.json({ success: true });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

/**
 * POST /api/cart/sync
 * Sync cart with server (optional endpoint)
 */
router.post('/sync', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;
    
    // Validate and store items
    const validItems = items.map(item => ({
      id: item.id || Date.now().toString() + Math.random(),
      ...item,
      selected: item.selected !== undefined ? item.selected : true,
    }));
    
    carts.set(userId, validItems);
    res.json({ items: validItems });
  } catch (error) {
    console.error('Sync cart error:', error);
    res.status(500).json({ error: 'Failed to sync cart' });
  }
});

module.exports = router;
