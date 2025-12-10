const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Apartment = require('../models/Apartment');
const Floor = require('../models/Floor');
const Block = require('../models/Block');
const Building = require('../models/Building');

// In-memory cart storage (sử dụng database trong production)
const carts = new Map();

/**
 * GET /api/cart
 * Get all cart items for current user with full apartment details
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = carts.get(userId) || [];
    
    // Fetch full apartment details for each cart item
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        if (item.apartmentId) {
          const apartment = await Apartment.findByPk(item.apartmentId, {
            include: [{
              model: Floor,
              as: 'floor',
              required: false,
              include: [{
                model: Block,
                as: 'block',
                required: false,
                include: [{
                  model: Building,
                  as: 'building',
                  required: false
                }]
              }]
            }]
          });
          
          return {
            ...item,
            apartment: apartment ? apartment.toJSON() : null
          };
        }
        return item;
      })
    );
    
    res.json({ items: itemsWithDetails });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to get cart items' });
  }
});

/**
 * POST /api/cart
 * Add item to cart (with validation for apartment status)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { apartmentId } = req.body;
    
    // Validate apartment exists and is available
    if (apartmentId) {
      const apartment = await Apartment.findByPk(apartmentId);
      
      if (!apartment) {
        return res.status(404).json({ error: 'Apartment not found' });
      }
      
      if (apartment.status === 'occupied') {
        return res.status(400).json({ 
          error: 'Căn hộ này đã được thuê, không thể thêm vào giỏ hàng' 
        });
      }
      
      if (apartment.status === 'maintenance') {
        return res.status(400).json({ 
          error: 'Căn hộ đang bảo trì, không thể thêm vào giỏ hàng' 
        });
      }
    }
    
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
      return res.status(400).json({ error: 'Căn hộ đã có trong giỏ hàng' });
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

/**
 * POST /api/cart/rent/:id
 * Rent an apartment from cart
 */
router.post('/rent/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { leaseStartDate, leaseEndDate } = req.body;
    
    const userCart = carts.get(userId) || [];
    const cartItem = userCart.find(item => item.id === id);
    
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    const apartment = await Apartment.findByPk(cartItem.apartmentId);
    
    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }
    
    if (apartment.status === 'occupied') {
      return res.status(400).json({ error: 'Căn hộ đã được thuê' });
    }
    
    // Update apartment to occupied status
    await apartment.update({
      status: 'occupied',
      tenantId: userId,
      leaseStartDate: leaseStartDate || new Date(),
      leaseEndDate: leaseEndDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Default 1 year
    });
    
    // Remove from cart
    const filtered = userCart.filter(item => item.id !== id);
    carts.set(userId, filtered);
    
    res.json({ 
      success: true, 
      message: 'Thuê căn hộ thành công',
      apartment: apartment.toJSON()
    });
  } catch (error) {
    console.error('Rent apartment error:', error);
    res.status(500).json({ error: 'Failed to rent apartment' });
  }
});

module.exports = router;
