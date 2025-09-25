const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Validation schemas
const addToCartSchema = Joi.object({
  serviceType: Joi.string().valid('vietjet', 'hdbank', 'resort', 'insurance').required(),
  serviceItemId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
  price: Joi.number().positive().required(),
  metadata: Joi.object().optional()
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required()
});

// Get user's shopping cart
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const cartResult = await db.query(`
      SELECT 
        id,
        service_type,
        service_item_id,
        quantity,
        price,
        quantity * price as subtotal,
        metadata,
        created_at
      FROM shopping_cart 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    // Calculate cart totals
    let totalItems = 0;
    let totalAmount = 0;
    let estimatedTokens = 0;

    const cartItems = cartResult.rows.map(item => {
      const subtotal = parseFloat(item.subtotal);
      totalItems += parseInt(item.quantity);
      totalAmount += subtotal;
      
      // Calculate estimated tokens (1 token per 10,000 VND)
      const itemTokens = Math.floor(subtotal / 10000);
      estimatedTokens += itemTokens;

      return {
        id: item.id,
        serviceType: item.service_type,
        serviceItemId: item.service_item_id,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        subtotal,
        metadata: item.metadata,
        estimatedTokens: itemTokens,
        addedAt: item.created_at
      };
    });

    // Check if user has ATHENA Prime for bonus calculation
    const userResult = await db.query(
      'SELECT athena_prime FROM users WHERE id = $1',
      [userId]
    );
    
    const isAthenaPrime = userResult.rows[0]?.athena_prime || false;
    if (isAthenaPrime) {
      estimatedTokens = Math.floor(estimatedTokens * 1.5); // 1.5x multiplier
    }

    res.json({
      items: cartItems,
      summary: {
        totalItems,
        totalAmount,
        estimatedTokens,
        isAthenaPrime,
        currency: 'VND'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Add item to cart
router.post('/items', async (req, res, next) => {
  try {
    const { error, value } = addToCartSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { serviceType, serviceItemId, quantity, price, metadata } = value;
    const userId = req.user.id;

    // Check if item already exists in cart
    const existingItem = await db.query(`
      SELECT id, quantity FROM shopping_cart 
      WHERE user_id = $1 AND service_type = $2 AND service_item_id = $3
    `, [userId, serviceType, serviceItemId]);

    if (existingItem.rows.length > 0) {
      // Update existing item quantity
      const newQuantity = existingItem.rows[0].quantity + quantity;
      
      const updateResult = await db.query(`
        UPDATE shopping_cart 
        SET quantity = $1, price = $2, metadata = $3
        WHERE id = $4
        RETURNING *
      `, [newQuantity, price, JSON.stringify(metadata || {}), existingItem.rows[0].id]);

      const updatedItem = updateResult.rows[0];
      
      res.json({
        success: true,
        message: 'Item quantity updated in cart',
        item: {
          id: updatedItem.id,
          serviceType: updatedItem.service_type,
          serviceItemId: updatedItem.service_item_id,
          quantity: parseInt(updatedItem.quantity),
          price: parseFloat(updatedItem.price),
          subtotal: parseInt(updatedItem.quantity) * parseFloat(updatedItem.price),
          metadata: updatedItem.metadata
        }
      });
    } else {
      // Add new item to cart
      const insertResult = await db.query(`
        INSERT INTO shopping_cart (
          user_id, service_type, service_item_id, 
          quantity, price, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [userId, serviceType, serviceItemId, quantity, price, JSON.stringify(metadata || {})]);

      const newItem = insertResult.rows[0];
      
      res.status(201).json({
        success: true,
        message: 'Item added to cart',
        item: {
          id: newItem.id,
          serviceType: newItem.service_type,
          serviceItemId: newItem.service_item_id,
          quantity: parseInt(newItem.quantity),
          price: parseFloat(newItem.price),
          subtotal: parseInt(newItem.quantity) * parseFloat(newItem.price),
          metadata: newItem.metadata
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// Update cart item quantity
router.put('/items/:itemId', async (req, res, next) => {
  try {
    const { error, value } = updateCartItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { itemId } = req.params;
    const { quantity } = value;
    const userId = req.user.id;

    const updateResult = await db.query(`
      UPDATE shopping_cart 
      SET quantity = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `, [quantity, itemId, userId]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const updatedItem = updateResult.rows[0];

    res.json({
      success: true,
      message: 'Cart item updated',
      item: {
        id: updatedItem.id,
        serviceType: updatedItem.service_type,
        serviceItemId: updatedItem.service_item_id,
        quantity: parseInt(updatedItem.quantity),
        price: parseFloat(updatedItem.price),
        subtotal: parseInt(updatedItem.quantity) * parseFloat(updatedItem.price),
        metadata: updatedItem.metadata
      }
    });
  } catch (error) {
    next(error);
  }
});

// Remove item from cart
router.delete('/items/:itemId', async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const deleteResult = await db.query(`
      DELETE FROM shopping_cart 
      WHERE id = $1 AND user_id = $2
      RETURNING service_type, service_item_id
    `, [itemId, userId]);

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({
      success: true,
      message: 'Item removed from cart',
      removedItem: deleteResult.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Clear entire cart
router.delete('/', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const deleteResult = await db.query(`
      DELETE FROM shopping_cart WHERE user_id = $1
      RETURNING COUNT(*) as deleted_count
    `, [userId]);

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      deletedItems: parseInt(deleteResult.rows[0]?.deleted_count) || 0
    });
  } catch (error) {
    next(error);
  }
});

// Checkout cart (unified purchase)
router.post('/checkout', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { paymentMethod, billingAddress } = req.body;

    // Get cart items
    const cartResult = await db.query(`
      SELECT * FROM shopping_cart WHERE user_id = $1
    `, [userId]);

    if (cartResult.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate totals
    let totalAmount = 0;
    const cartItems = cartResult.rows.map(item => {
      const subtotal = parseInt(item.quantity) * parseFloat(item.price);
      totalAmount += subtotal;
      return {
        ...item,
        subtotal
      };
    });

    // Calculate tokens to be earned
    const baseTokens = Math.floor(totalAmount / 10000);
    
    const userResult = await db.query(
      'SELECT athena_prime FROM users WHERE id = $1',
      [userId]
    );
    
    const isAthenaPrime = userResult.rows[0]?.athena_prime || false;
    const tokensEarned = Math.floor(baseTokens * (isAthenaPrime ? 1.5 : 1.0));

    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Create service bookings for each cart item
      const bookingIds = [];
      
      for (const item of cartItems) {
        const bookingReference = `ATH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        const bookingResult = await client.query(`
          INSERT INTO service_bookings (
            user_id, service_type, booking_reference, 
            total_amount, tokens_earned, booking_details
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `, [
          userId, item.service_type, bookingReference,
          item.subtotal, 0, // Tokens will be awarded separately
          JSON.stringify({
            serviceItemId: item.service_item_id,
            quantity: item.quantity,
            price: item.price,
            metadata: item.metadata,
            paymentMethod,
            billingAddress
          })
        ]);
        
        bookingIds.push({
          bookingId: bookingResult.rows[0].id,
          bookingReference,
          serviceType: item.service_type,
          amount: item.subtotal
        });
      }

      // Award tokens if any earned
      if (tokensEarned > 0) {
        // Create transaction record
        await client.query(`
          INSERT INTO transactions (
            user_id, type, amount, description, service_type, status
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          userId, 'earn', tokensEarned,
          'Tokens earned from unified cart checkout',
          'unified_purchase', 'completed'
        ]);

        // Update token balance
        await client.query(`
          INSERT INTO token_balances (user_id, balance, total_earned)
          VALUES ($1, $2, $2)
          ON CONFLICT (user_id) 
          DO UPDATE SET 
            balance = token_balances.balance + $2,
            total_earned = token_balances.total_earned + $2,
            updated_at = CURRENT_TIMESTAMP
        `, [userId, tokensEarned]);
      }

      // Clear the cart
      await client.query('DELETE FROM shopping_cart WHERE user_id = $1', [userId]);

      await client.query('COMMIT');

      // Emit real-time update
      const io = req.app.get('socketio');
      if (io) {
        io.to(`user_${userId}`).emit('checkout_completed', {
          totalAmount,
          tokensEarned,
          bookings: bookingIds
        });
      }

      res.json({
        success: true,
        message: 'Checkout completed successfully',
        checkout: {
          totalAmount,
          tokensEarned,
          isAthenaPrime,
          bookings: bookingIds,
          checkoutId: uuidv4(),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

// Get checkout history
router.get('/history', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const bookingsResult = await db.query(`
      SELECT 
        id,
        service_type,
        booking_reference,
        total_amount,
        tokens_earned,
        status,
        booking_details,
        created_at
      FROM service_bookings 
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) FROM service_bookings WHERE user_id = $1',
      [userId]
    );
    
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      bookings: bookingsResult.rows.map(booking => ({
        id: booking.id,
        serviceType: booking.service_type,
        bookingReference: booking.booking_reference,
        totalAmount: parseFloat(booking.total_amount),
        tokensEarned: parseFloat(booking.tokens_earned),
        status: booking.status,
        bookingDetails: booking.booking_details,
        createdAt: booking.created_at
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

