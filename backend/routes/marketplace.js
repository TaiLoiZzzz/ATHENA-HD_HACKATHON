const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const blockchainService = require('../services/blockchainService');

const router = express.Router();

// Validation schemas
const createOrderSchema = Joi.object({
  orderType: Joi.string().valid('buy', 'sell').required(),
  amount: Joi.number().positive().required(),
  pricePerToken: Joi.number().positive().required(),
  expiresInHours: Joi.number().positive().max(168).optional() // Max 7 days
});

// Get marketplace overview
router.get('/overview', async (req, res, next) => {
  try {
    // Get active orders statistics
    const ordersStats = await db.query(`
      SELECT 
        order_type,
        COUNT(*) as count,
        SUM(amount - filled_amount) as total_amount,
        AVG(price_per_token) as avg_price,
        MIN(price_per_token) as min_price,
        MAX(price_per_token) as max_price
      FROM marketplace_orders 
      WHERE status = 'active' AND (expires_at IS NULL OR expires_at > NOW())
      GROUP BY order_type
    `);

    // Get recent trades
    const recentTrades = await db.query(`
      SELECT 
        amount,
        price_per_token,
        total_value,
        platform_fee,
        created_at
      FROM marketplace_trades 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    // Get 24h trading volume
    const volumeResult = await db.query(`
      SELECT 
        COUNT(*) as trade_count,
        SUM(amount) as total_tokens_traded,
        SUM(total_value) as total_value_traded,
        SUM(platform_fee) as total_fees
      FROM marketplace_trades 
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `);

    const volume24h = volumeResult.rows[0];
    
    // Organize order statistics
    const orderStats = {
      buy: { count: 0, totalAmount: 0, avgPrice: 0, minPrice: 0, maxPrice: 0 },
      sell: { count: 0, totalAmount: 0, avgPrice: 0, minPrice: 0, maxPrice: 0 }
    };

    ordersStats.rows.forEach(stat => {
      orderStats[stat.order_type] = {
        count: parseInt(stat.count),
        totalAmount: parseFloat(stat.total_amount) || 0,
        avgPrice: parseFloat(stat.avg_price) || 0,
        minPrice: parseFloat(stat.min_price) || 0,
        maxPrice: parseFloat(stat.max_price) || 0
      };
    });

    res.json({
      orderBook: orderStats,
      recentTrades: recentTrades.rows.map(trade => ({
        amount: parseFloat(trade.amount),
        pricePerToken: parseFloat(trade.price_per_token),
        totalValue: parseFloat(trade.total_value),
        platformFee: parseFloat(trade.platform_fee),
        timestamp: trade.created_at
      })),
      volume24h: {
        tradeCount: parseInt(volume24h.trade_count) || 0,
        totalTokensTraded: parseFloat(volume24h.total_tokens_traded) || 0,
        totalValueTraded: parseFloat(volume24h.total_value_traded) || 0,
        totalFees: parseFloat(volume24h.total_fees) || 0
      },
      marketplaceFeePercent: 1.5 // 1.5% platform fee
    });
  } catch (error) {
    next(error);
  }
});

// Get order book (buy and sell orders)
router.get('/orderbook', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Get active buy orders (highest price first)
    const buyOrders = await db.query(`
      SELECT 
        id,
        user_id,
        amount - filled_amount as available_amount,
        price_per_token,
        (amount - filled_amount) * price_per_token as total_value,
        created_at
      FROM marketplace_orders 
      WHERE order_type = 'buy' 
        AND status = 'active' 
        AND amount > filled_amount
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY price_per_token DESC, created_at ASC
      LIMIT $1
    `, [limit]);

    // Get active sell orders (lowest price first)
    const sellOrders = await db.query(`
      SELECT 
        id,
        user_id,
        amount - filled_amount as available_amount,
        price_per_token,
        (amount - filled_amount) * price_per_token as total_value,
        created_at
      FROM marketplace_orders 
      WHERE order_type = 'sell' 
        AND status = 'active' 
        AND amount > filled_amount
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY price_per_token ASC, created_at ASC
      LIMIT $1
    `, [limit]);

    res.json({
      buyOrders: buyOrders.rows.map(order => ({
        id: order.id,
        userId: order.user_id,
        amount: parseFloat(order.available_amount),
        pricePerToken: parseFloat(order.price_per_token),
        totalValue: parseFloat(order.total_value),
        timestamp: order.created_at
      })),
      sellOrders: sellOrders.rows.map(order => ({
        id: order.id,
        userId: order.user_id,
        amount: parseFloat(order.available_amount),
        pricePerToken: parseFloat(order.price_per_token),
        totalValue: parseFloat(order.total_value),
        timestamp: order.created_at
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Create a new marketplace order
router.post('/orders', async (req, res, next) => {
  try {
    const { error, value } = createOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { orderType, amount, pricePerToken, expiresInHours } = value;
    const userId = req.user.id;

    // Calculate expiration time if provided
    let expiresAt = null;
    if (expiresInHours) {
      expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    }

    // For sell orders, check if user has sufficient token balance
    if (orderType === 'sell') {
      const balanceResult = await db.query(
        'SELECT balance FROM token_balances WHERE user_id = $1',
        [userId]
      );

      const currentBalance = parseFloat(balanceResult.rows[0]?.balance) || 0;
      if (currentBalance < amount) {
        return res.status(400).json({ error: 'Insufficient token balance' });
      }
    }

    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Create the order
      const orderResult = await client.query(`
        INSERT INTO marketplace_orders (
          user_id, order_type, amount, price_per_token, 
          total_value, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at
      `, [
        userId, orderType, amount, pricePerToken, 
        amount * pricePerToken, expiresAt
      ]);

      const orderId = orderResult.rows[0].id;
      const createdAt = orderResult.rows[0].created_at;

      // For sell orders, lock the tokens
      if (orderType === 'sell') {
        await client.query(`
          UPDATE token_balances 
          SET 
            balance = balance - $2,
            locked_balance = locked_balance + $2,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
        `, [userId, amount]);
      }

      await client.query('COMMIT');

      // Try to match orders immediately
      setTimeout(() => {
        matchOrders().catch(error => 
          console.error('Order matching failed:', error)
        );
      }, 100);

      // Emit real-time update
      const io = req.app.get('socketio');
      if (io) {
        io.emit('new_marketplace_order', {
          id: orderId,
          orderType,
          amount,
          pricePerToken,
          userId,
          timestamp: createdAt
        });
      }

      res.status(201).json({
        success: true,
        orderId,
        orderType,
        amount,
        pricePerToken,
        totalValue: amount * pricePerToken,
        expiresAt,
        createdAt
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

// Get user's orders
router.get('/my-orders', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const status = req.query.status || 'active';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let statusCondition = '';
    if (status === 'active') {
      statusCondition = "AND status = 'active' AND amount > filled_amount AND (expires_at IS NULL OR expires_at > NOW())";
    } else if (status === 'completed') {
      statusCondition = "AND (status = 'filled' OR amount = filled_amount)";
    } else if (status === 'cancelled') {
      statusCondition = "AND status = 'cancelled'";
    }

    const ordersResult = await db.query(`
      SELECT 
        id,
        order_type,
        amount,
        filled_amount,
        price_per_token,
        total_value,
        status,
        expires_at,
        created_at,
        updated_at
      FROM marketplace_orders 
      WHERE user_id = $1 ${statusCondition}
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) 
      FROM marketplace_orders 
      WHERE user_id = $1 ${statusCondition}
    `, [userId]);

    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      orders: ordersResult.rows.map(order => ({
        id: order.id,
        orderType: order.order_type,
        amount: parseFloat(order.amount),
        filledAmount: parseFloat(order.filled_amount),
        remainingAmount: parseFloat(order.amount) - parseFloat(order.filled_amount),
        pricePerToken: parseFloat(order.price_per_token),
        totalValue: parseFloat(order.total_value),
        status: order.status,
        expiresAt: order.expires_at,
        createdAt: order.created_at,
        updatedAt: order.updated_at
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

// Cancel an order
router.delete('/orders/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Get order details
    const orderResult = await db.query(`
      SELECT 
        id, user_id, order_type, amount, filled_amount, 
        price_per_token, status
      FROM marketplace_orders 
      WHERE id = $1 AND user_id = $2
    `, [orderId, userId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    if (order.status !== 'active') {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Cancel the order
      await client.query(`
        UPDATE marketplace_orders 
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [orderId]);

      // If it's a sell order, unlock the remaining tokens
      if (order.order_type === 'sell') {
        const remainingAmount = parseFloat(order.amount) - parseFloat(order.filled_amount);
        
        await client.query(`
          UPDATE token_balances 
          SET 
            balance = balance + $2,
            locked_balance = locked_balance - $2,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
        `, [userId, remainingAmount]);
      }

      await client.query('COMMIT');

      // Emit real-time update
      const io = req.app.get('socketio');
      if (io) {
        io.emit('order_cancelled', { orderId, userId });
      }

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        orderId
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

// Get trading history
router.get('/trades', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const tradesResult = await db.query(`
      SELECT 
        t.*,
        bo.user_id as buyer_id,
        so.user_id as seller_id,
        CASE 
          WHEN bo.user_id = $1 THEN 'buy'
          WHEN so.user_id = $1 THEN 'sell'
        END as user_side
      FROM marketplace_trades t
      LEFT JOIN marketplace_orders bo ON t.buy_order_id = bo.id
      LEFT JOIN marketplace_orders so ON t.sell_order_id = so.id
      WHERE bo.user_id = $1 OR so.user_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) 
      FROM marketplace_trades t
      LEFT JOIN marketplace_orders bo ON t.buy_order_id = bo.id
      LEFT JOIN marketplace_orders so ON t.sell_order_id = so.id
      WHERE bo.user_id = $1 OR so.user_id = $1
    `, [userId]);

    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      trades: tradesResult.rows.map(trade => ({
        id: trade.id,
        amount: parseFloat(trade.amount),
        pricePerToken: parseFloat(trade.price_per_token),
        totalValue: parseFloat(trade.total_value),
        platformFee: parseFloat(trade.platform_fee),
        userSide: trade.user_side,
        timestamp: trade.created_at
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

// Order matching function (called periodically or after new orders)
async function matchOrders() {
  try {
    // Get best buy order (highest price)
    const bestBuyResult = await db.query(`
      SELECT id, user_id, amount - filled_amount as remaining, price_per_token
      FROM marketplace_orders 
      WHERE order_type = 'buy' 
        AND status = 'active' 
        AND amount > filled_amount
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY price_per_token DESC, created_at ASC
      LIMIT 1
    `);

    // Get best sell order (lowest price)
    const bestSellResult = await db.query(`
      SELECT id, user_id, amount - filled_amount as remaining, price_per_token
      FROM marketplace_orders 
      WHERE order_type = 'sell' 
        AND status = 'active' 
        AND amount > filled_amount
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY price_per_token ASC, created_at ASC
      LIMIT 1
    `);

    if (bestBuyResult.rows.length === 0 || bestSellResult.rows.length === 0) {
      return; // No matching possible
    }

    const buyOrder = bestBuyResult.rows[0];
    const sellOrder = bestSellResult.rows[0];

    // Check if prices can match (buy price >= sell price)
    if (parseFloat(buyOrder.price_per_token) < parseFloat(sellOrder.price_per_token)) {
      return; // No match possible
    }

    // Calculate trade amount (minimum of remaining amounts)
    const tradeAmount = Math.min(
      parseFloat(buyOrder.remaining),
      parseFloat(sellOrder.remaining)
    );

    // Use sell order price for the trade
    const tradePrice = parseFloat(sellOrder.price_per_token);
    const tradeValue = tradeAmount * tradePrice;
    const platformFee = tradeValue * 0.015; // 1.5% fee
    const sellerReceives = tradeValue - platformFee;

    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Create trade record
      await client.query(`
        INSERT INTO marketplace_trades (
          buy_order_id, sell_order_id, buyer_id, seller_id,
          amount, price_per_token, total_value, platform_fee
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        buyOrder.id, sellOrder.id, buyOrder.user_id, sellOrder.user_id,
        tradeAmount, tradePrice, tradeValue, platformFee
      ]);

      // Update buy order
      await client.query(`
        UPDATE marketplace_orders 
        SET 
          filled_amount = filled_amount + $2,
          status = CASE 
            WHEN filled_amount + $2 >= amount THEN 'filled'
            ELSE 'partially_filled'
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [buyOrder.id, tradeAmount]);

      // Update sell order
      await client.query(`
        UPDATE marketplace_orders 
        SET 
          filled_amount = filled_amount + $2,
          status = CASE 
            WHEN filled_amount + $2 >= amount THEN 'filled'
            ELSE 'partially_filled'
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [sellOrder.id, tradeAmount]);

      // Transfer tokens from seller's locked balance to buyer
      await client.query(`
        UPDATE token_balances 
        SET 
          locked_balance = locked_balance - $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `, [sellOrder.user_id, tradeAmount]);

      await client.query(`
        UPDATE token_balances 
        SET 
          balance = balance + $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `, [buyOrder.user_id, tradeAmount]);

      // Record platform fee earnings (simplified - in real system would go to platform wallet)
      await client.query(`
        INSERT INTO transactions (
          user_id, type, amount, description, status
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        sellOrder.user_id, 'marketplace_sell', sellerReceives,
        'Tokens sold on marketplace', 'completed'
      ]);

      await client.query(`
        INSERT INTO transactions (
          user_id, type, amount, description, status
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        buyOrder.user_id, 'marketplace_buy', tradeAmount,
        'Tokens bought on marketplace', 'completed'
      ]);

      await client.query('COMMIT');

      console.log(`Trade executed: ${tradeAmount} tokens at ${tradePrice} per token`);
      
      // Continue matching if there are more orders
      setTimeout(() => matchOrders().catch(console.error), 100);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Order matching error:', error);
  }
}

module.exports = router;

