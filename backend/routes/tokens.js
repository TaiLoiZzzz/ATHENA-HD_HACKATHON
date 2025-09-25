const express = require('express');
const db = require('../config/database');
const blockchainService = require('../services/blockchainService');
const web3Service = require('../services/web3Service');

const router = express.Router();

// Get user's token balance and statistics
router.get('/balance', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const balanceResult = await db.query(`
      SELECT 
        balance,
        locked_balance,
        total_earned,
        total_spent,
        (total_earned - total_spent) as net_tokens
      FROM token_balances 
      WHERE user_id = $1
    `, [userId]);

    if (balanceResult.rows.length === 0) {
      // Create initial balance record if it doesn't exist
      await db.query(
        'INSERT INTO token_balances (user_id, balance) VALUES ($1, $2)',
        [userId, 0]
      );
      
      return res.json({
        balance: 0,
        lockedBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
        netTokens: 0,
        blockchainBalance: '0'
      });
    }

    const balance = balanceResult.rows[0];
    
    // Get blockchain balance if wallet is connected
    let blockchainBalance = '0';
    try {
      const walletResult = await db.query(
        'SELECT wallet_address FROM user_wallets WHERE user_id = $1',
        [userId]
      );
      
      if (walletResult.rows.length > 0) {
        blockchainBalance = await web3Service.getWalletBalance(walletResult.rows[0].wallet_address);
      }
    } catch (web3Error) {
      console.error('Failed to get blockchain balance:', web3Error);
    }
    
    res.json({
      balance: parseFloat(balance.balance),
      lockedBalance: parseFloat(balance.locked_balance),
      totalEarned: parseFloat(balance.total_earned),
      totalSpent: parseFloat(balance.total_spent),
      netTokens: parseFloat(balance.net_tokens),
      blockchainBalance
    });
  } catch (error) {
    next(error);
  }
});

// Get user's transaction history
router.get('/transactions', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const type = req.query.type; // Optional filter by transaction type

    let query = `
      SELECT 
        id,
        type,
        amount,
        description,
        service_type,
        service_reference_id,
        status,
        metadata,
        created_at
      FROM transactions 
      WHERE user_id = $1
    `;
    
    const params = [userId];
    
    if (type) {
      query += ` AND type = $${params.length + 1}`;
      params.push(type);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const transactionsResult = await db.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM transactions WHERE user_id = $1';
    const countParams = [userId];
    
    if (type) {
      countQuery += ' AND type = $2';
      countParams.push(type);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      transactions: transactionsResult.rows.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: parseFloat(tx.amount),
        description: tx.description,
        serviceType: tx.service_type,
        serviceReferenceId: tx.service_reference_id,
        status: tx.status,
        metadata: tx.metadata,
        createdAt: tx.created_at
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

// Calculate tokens earned for a purchase amount
router.post('/calculate-earning', async (req, res, next) => {
  try {
    const { vndAmount, serviceType } = req.body;
    const userId = req.user.id;
    
    if (!vndAmount || vndAmount <= 0) {
      return res.status(400).json({ error: 'Invalid VND amount' });
    }

    // Base rate: 1 SOV-Token per 10,000 VND
    const baseTokens = Math.floor(vndAmount / 10000);
    
    // Check if user has ATHENA Prime (1.5x multiplier)
    const userResult = await db.query(
      'SELECT athena_prime FROM users WHERE id = $1',
      [userId]
    );
    
    const isAthenaPrime = userResult.rows[0]?.athena_prime || false;
    const multiplier = isAthenaPrime ? 1.5 : 1.0;
    const tokensEarned = Math.floor(baseTokens * multiplier);

    res.json({
      vndAmount,
      serviceType,
      baseTokens,
      multiplier,
      tokensEarned,
      isAthenaPrime
    });
  } catch (error) {
    next(error);
  }
});

// Award tokens for a completed purchase (internal API)
router.post('/award', async (req, res, next) => {
  try {
    const { vndAmount, serviceType, serviceReferenceId, description } = req.body;
    const userId = req.user.id;
    
    if (!vndAmount || vndAmount <= 0) {
      return res.status(400).json({ error: 'Invalid VND amount' });
    }

    // Calculate tokens to award
    const baseTokens = Math.floor(vndAmount / 10000);
    
    const userResult = await db.query(
      'SELECT athena_prime FROM users WHERE id = $1',
      [userId]
    );
    
    const isAthenaPrime = userResult.rows[0]?.athena_prime || false;
    const multiplier = isAthenaPrime ? 1.5 : 1.0;
    const tokensEarned = Math.floor(baseTokens * multiplier);

    if (tokensEarned === 0) {
      return res.status(400).json({ error: 'Purchase amount too small to earn tokens' });
    }

    // Start database transaction
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Create transaction record
      const transactionResult = await client.query(`
        INSERT INTO transactions (
          user_id, type, amount, description, service_type, 
          service_reference_id, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [
        userId, 'earn', tokensEarned, 
        description || `Earned from ${serviceType} purchase`,
        serviceType, serviceReferenceId, 'completed'
      ]);

      const transactionId = transactionResult.rows[0].id;

      // Update user's token balance
      await client.query(`
        INSERT INTO token_balances (user_id, balance, total_earned)
        VALUES ($1, $2, $2)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          balance = token_balances.balance + $2,
          total_earned = token_balances.total_earned + $2,
          updated_at = CURRENT_TIMESTAMP
      `, [userId, tokensEarned]);

      await client.query('COMMIT');
      
      // Get user's wallet address for blockchain interaction
      const walletResult = await db.query(
        'SELECT wallet_address FROM user_wallets WHERE user_id = $1',
        [userId]
      );

      let blockchainResult = null;
      if (walletResult.rows.length > 0) {
        // Interact with Web3 service for blockchain recording
        const web3Service = require('../services/web3Service');
        try {
          blockchainResult = await web3Service.awardTokens(
            userId, 
            walletResult.rows[0].wallet_address, 
            vndAmount, 
            serviceType, 
            transactionId
          );
        } catch (web3Error) {
          console.error('Web3 service failed:', web3Error);
          // Continue even if blockchain interaction fails
        }
      }

      // Emit real-time update
      const io = req.app.get('socketio');
      if (io) {
        io.to(`user_${userId}`).emit('tokens_earned', {
          transactionId,
          amount: tokensEarned,
          serviceType,
          description,
          blockchainTx: blockchainResult?.transactionHash
        });
      }

      res.json({
        success: true,
        transactionId,
        tokensEarned,
        serviceType,
        vndAmount,
        isAthenaPrime,
        blockchain: blockchainResult
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

// Redeem tokens for vouchers/rewards
router.post('/redeem', async (req, res, next) => {
  try {
    const { amount, redeemType, redeemDetails } = req.body;
    const userId = req.user.id;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid token amount' });
    }

    if (!redeemType) {
      return res.status(400).json({ error: 'Redeem type is required' });
    }

    // Check user's balance
    const balanceResult = await db.query(
      'SELECT balance FROM token_balances WHERE user_id = $1',
      [userId]
    );

    if (balanceResult.rows.length === 0 || parseFloat(balanceResult.rows[0].balance) < amount) {
      return res.status(400).json({ error: 'Insufficient token balance' });
    }

    // Start database transaction
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Create transaction record
      const transactionResult = await client.query(`
        INSERT INTO transactions (
          user_id, type, amount, description, status, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [
        userId, 'spend', amount, 
        `Redeemed for ${redeemType}`,
        'completed',
        JSON.stringify(redeemDetails || {})
      ]);

      const transactionId = transactionResult.rows[0].id;

      // Update user's token balance
      await client.query(`
        UPDATE token_balances 
        SET 
          balance = balance - $2,
          total_spent = total_spent + $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `, [userId, amount]);

      await client.query('COMMIT');
      
      // Get user's wallet address for Web3 interaction
      const walletResult = await db.query(
        'SELECT wallet_address FROM user_wallets WHERE user_id = $1',
        [userId]
      );

      let blockchainResult = null;
      if (walletResult.rows.length > 0) {
        // Interact with Web3 service for blockchain recording
        try {
          blockchainResult = await web3Service.redeemTokens(
            userId, 
            walletResult.rows[0].wallet_address, 
            amount, 
            redeemType, 
            transactionId
          );
        } catch (web3Error) {
          console.error('Web3 service failed:', web3Error);
          // Continue even if blockchain interaction fails
        }
      }

      // Emit real-time update
      const io = req.app.get('socketio');
      if (io) {
        io.to(`user_${userId}`).emit('tokens_redeemed', {
          transactionId,
          amount,
          redeemType,
          blockchainTx: blockchainResult?.transactionHash
        });
      }

      res.json({
        success: true,
        transactionId,
        tokensRedeemed: amount,
        redeemType,
        remainingBalance: parseFloat(balanceResult.rows[0].balance) - amount,
        blockchain: blockchainResult
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

// Get token earning rates and information
router.get('/rates', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user's ATHENA Prime status
    const userResult = await db.query(
      'SELECT athena_prime FROM users WHERE id = $1',
      [userId]
    );
    
    const isAthenaPrime = userResult.rows[0]?.athena_prime || false;

    res.json({
      baseRate: {
        vndPerToken: 10000,
        description: '1 SOV-Token per 10,000 VND spent'
      },
      userMultiplier: isAthenaPrime ? 1.5 : 1.0,
      isAthenaPrime,
      primeMultiplier: 1.5,
      serviceBonuses: {
        vietjet: 1.0,
        hdbank: 1.0,
        resort: 1.2, // 20% bonus for resort bookings
        insurance: 1.1 // 10% bonus for insurance
      }
    });
  } catch (error) {
    next(error);
  }
});

// Sync tokens with blockchain
router.post('/sync-blockchain', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user's wallet address
    const walletResult = await db.query(
      'SELECT wallet_address FROM user_wallets WHERE user_id = $1',
      [userId]
    );

    if (walletResult.rows.length === 0) {
      return res.status(400).json({ error: 'No wallet connected' });
    }

    const walletAddress = walletResult.rows[0].wallet_address;
    
    // Get blockchain balance
    const blockchainBalance = await web3Service.getWalletBalance(walletAddress);
    
    // Get database balance
    const dbBalanceResult = await db.query(
      'SELECT balance FROM token_balances WHERE user_id = $1',
      [userId]
    );
    
    const dbBalance = dbBalanceResult.rows[0]?.balance || 0;

    res.json({
      success: true,
      walletAddress,
      blockchainBalance,
      databaseBalance: parseFloat(dbBalance),
      synced: Math.abs(parseFloat(blockchainBalance) - parseFloat(dbBalance)) < 0.001
    });
  } catch (error) {
    next(error);
  }
});

// Get blockchain transaction history integrated with local transactions
router.get('/blockchain-history', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Get Web3 transaction history
    const web3Result = await web3Service.getUserTransactionHistory(userId, page, limit);
    
    // Get local transaction history
    const offset = (page - 1) * limit;
    const localResult = await db.query(`
      SELECT 
        id, type, amount, description, service_type, 
        service_reference_id, status, metadata, created_at
      FROM transactions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    // Merge and sort transactions
    const allTransactions = [
      ...web3Result.transactions.map(tx => ({
        ...tx,
        source: 'blockchain',
        display_type: 'Blockchain Transaction'
      })),
      ...localResult.rows.map(tx => ({
        ...tx,
        source: 'database',
        display_type: 'Local Transaction'
      }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      transactions: allTransactions.slice(0, limit),
      pagination: web3Result.pagination,
      summary: {
        blockchainTransactions: web3Result.transactions.length,
        localTransactions: localResult.rows.length,
        totalShown: Math.min(allTransactions.length, limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create marketplace order via smart contract
router.post('/marketplace/create-order', async (req, res, next) => {
  try {
    const { orderType, amount, pricePerToken, ethAmount } = req.body;
    const userId = req.user.id;

    if (!['buy', 'sell'].includes(orderType)) {
      return res.status(400).json({ error: 'Invalid order type. Must be "buy" or "sell"' });
    }

    if (!amount || !pricePerToken) {
      return res.status(400).json({ error: 'Amount and price per token are required' });
    }

    // Get user's wallet address
    const walletResult = await db.query(
      'SELECT wallet_address FROM user_wallets WHERE user_id = $1',
      [userId]
    );

    if (walletResult.rows.length === 0) {
      return res.status(400).json({ error: 'No wallet connected' });
    }

    const walletAddress = walletResult.rows[0].wallet_address;
    let result;

    if (orderType === 'buy') {
      if (!ethAmount) {
        return res.status(400).json({ error: 'ETH amount required for buy orders' });
      }
      result = await web3Service.createBuyOrder(userId, walletAddress, amount, pricePerToken, ethAmount);
    } else {
      // For sell orders, check if user has enough tokens
      const balanceResult = await db.query(
        'SELECT balance FROM token_balances WHERE user_id = $1',
        [userId]
      );
      
      if (balanceResult.rows.length === 0 || parseFloat(balanceResult.rows[0].balance) < amount) {
        return res.status(400).json({ error: 'Insufficient token balance' });
      }
      
      result = await web3Service.createSellOrder(userId, walletAddress, amount, pricePerToken);
    }

    res.json({
      success: true,
      message: `${orderType} order created successfully`,
      orderType,
      amount,
      pricePerToken,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

// Get smart contract information
router.get('/contract-info', async (req, res, next) => {
  try {
    const contractInfo = web3Service.getContractInfo();
    
    res.json({
      success: true,
      contract: contractInfo
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

