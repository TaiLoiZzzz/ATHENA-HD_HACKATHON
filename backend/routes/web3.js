const express = require('express');
const Joi = require('joi');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const blockchainService = require('../services/blockchainService');

const router = express.Router();

// Validation schemas
const createWalletSchema = Joi.object({
  walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  walletType: Joi.string().valid('metamask', 'walletconnect', 'coinbase').required()
});

const stakeTokensSchema = Joi.object({
  amount: Joi.number().positive().required(),
  duration: Joi.number().valid(30, 90, 180, 365).required() // days
});

const createNFTSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  attributes: Joi.object().required(),
  image: Joi.string().uri().required()
});

// Connect Web3 Wallet
router.post('/wallet/connect', async (req, res, next) => {
  try {
    const { error, value } = createWalletSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.details[0].message 
      });
    }

    const { walletAddress, walletType } = value;
    const userId = req.user.id;

    // Check if wallet already connected
    const existingWallet = await db.query(
      'SELECT id FROM user_wallets WHERE wallet_address = $1 OR user_id = $2',
      [walletAddress, userId]
    );

    if (existingWallet.rows.length > 0) {
      return res.status(400).json({ error: 'Wallet already connected' });
    }

    // Generate wallet signature for verification
    const nonce = crypto.randomBytes(32).toString('hex');
    
    const walletResult = await db.query(`
      INSERT INTO user_wallets (
        id, user_id, wallet_address, wallet_type, nonce, connected_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `, [uuidv4(), userId, walletAddress, walletType, nonce]);

    // Create initial Web3 profile
    await db.query(`
      INSERT INTO web3_profiles (
        id, user_id, wallet_id, profile_nft_id, reputation_score, 
        governance_power, total_staked, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `, [
      uuidv4(), 
      userId, 
      walletResult.rows[0].id, 
      null, // Will be generated later
      100, // Initial reputation
      0, // Initial governance power
      0 // Initial staked amount
    ]);

    res.status(201).json({
      message: 'Wallet connected successfully',
      wallet: walletResult.rows[0],
      nonce: nonce
    });

  } catch (error) {
    next(error);
  }
});

// Get Web3 Profile
router.get('/profile', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profileResult = await db.query(`
      SELECT 
        wp.*,
        uw.wallet_address,
        uw.wallet_type,
        u.full_name,
        u.email,
        COALESCE(tb.balance, 0) as token_balance,
        (
          SELECT COUNT(*) 
          FROM nft_collections nc 
          WHERE nc.owner_id = wp.user_id
        ) as nft_count,
        (
          SELECT COUNT(*) 
          FROM marketplace_orders mo 
          WHERE mo.seller_id = wp.user_id AND mo.status = 'completed'
        ) as completed_trades
      FROM web3_profiles wp
      LEFT JOIN user_wallets uw ON wp.wallet_id = uw.id
      LEFT JOIN users u ON wp.user_id = u.id
      LEFT JOIN token_balances tb ON wp.user_id = tb.user_id
      WHERE wp.user_id = $1
    `, [userId]);

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Web3 profile not found' });
    }

    const profile = profileResult.rows[0];

    // Get staking history
    const stakingResult = await db.query(`
      SELECT 
        amount,
        duration_days,
        apy_rate,
        start_date,
        end_date,
        status,
        rewards_earned
      FROM token_staking 
      WHERE user_id = $1 
      ORDER BY start_date DESC 
      LIMIT 10
    `, [userId]);

    // Get NFT collections
    const nftResult = await db.query(`
      SELECT 
        id,
        name,
        description,
        image_url,
        attributes,
        rarity_score,
        created_at
      FROM nft_collections 
      WHERE owner_id = $1 
      ORDER BY created_at DESC 
      LIMIT 5
    `, [userId]);

    res.json({
      profile: {
        ...profile,
        staking_history: stakingResult.rows,
        nft_collections: nftResult.rows
      }
    });

  } catch (error) {
    next(error);
  }
});

// Stake SOV Tokens
router.post('/stake', async (req, res, next) => {
  try {
    const { error, value } = stakeTokensSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.details[0].message 
      });
    }

    const { amount, duration } = value;
    const userId = req.user.id;

    // Check user balance
    const balanceResult = await db.query(
      'SELECT balance FROM token_balances WHERE user_id = $1',
      [userId]
    );

    if (balanceResult.rows.length === 0 || parseFloat(balanceResult.rows[0].balance) < amount) {
      return res.status(400).json({ error: 'Insufficient token balance' });
    }

    // Calculate APY based on duration
    const apyRates = {
      30: 5.0,   // 5% APY for 30 days
      90: 8.0,   // 8% APY for 90 days
      180: 12.0, // 12% APY for 180 days
      365: 18.0  // 18% APY for 1 year
    };

    const apyRate = apyRates[duration];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    // Start transaction
    await db.query('BEGIN');

    try {
      // Deduct tokens from balance
      await db.query(
        'UPDATE token_balances SET balance = balance - $1 WHERE user_id = $2',
        [amount, userId]
      );

      // Create staking record
      const stakingResult = await db.query(`
        INSERT INTO token_staking (
          id, user_id, amount, duration_days, apy_rate, 
          start_date, end_date, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, 'active', NOW())
        RETURNING *
      `, [uuidv4(), userId, amount, duration, apyRate, endDate]);

      // Update Web3 profile staked amount
      await db.query(
        'UPDATE web3_profiles SET total_staked = total_staked + $1 WHERE user_id = $2',
        [amount, userId]
      );

      // Add governance power (1 token = 1 governance power)
      await db.query(
        'UPDATE web3_profiles SET governance_power = governance_power + $1 WHERE user_id = $2',
        [amount, userId]
      );

      await db.query('COMMIT');

      res.status(201).json({
        message: 'Tokens staked successfully',
        staking: stakingResult.rows[0]
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    next(error);
  }
});

// Unstake SOV Tokens
router.post('/unstake/:stakingId', async (req, res, next) => {
  try {
    const { stakingId } = req.params;
    const userId = req.user.id;

    // Get staking details
    const stakingResult = await db.query(
      'SELECT * FROM token_staking WHERE id = $1 AND user_id = $2 AND status = $3',
      [stakingId, userId, 'active']
    );

    if (stakingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Active staking not found' });
    }

    const staking = stakingResult.rows[0];
    const now = new Date();
    const endDate = new Date(staking.end_date);

    // Check if staking period is complete
    if (now < endDate) {
      // Early unstaking penalty (10% of staked amount)
      const penalty = parseFloat(staking.amount) * 0.1;
      const returnAmount = parseFloat(staking.amount) - penalty;

      await db.query('BEGIN');

      try {
        // Return tokens minus penalty
        await db.query(
          'UPDATE token_balances SET balance = balance + $1 WHERE user_id = $2',
          [returnAmount, userId]
        );

        // Update staking status
        await db.query(
          'UPDATE token_staking SET status = $1, actual_end_date = NOW(), penalty_amount = $2 WHERE id = $3',
          ['early_unstaked', penalty, stakingId]
        );

        // Update Web3 profile
        await db.query(
          'UPDATE web3_profiles SET total_staked = total_staked - $1, governance_power = governance_power - $2 WHERE user_id = $3',
          [staking.amount, staking.amount, userId]
        );

        await db.query('COMMIT');

        res.json({
          message: 'Tokens unstaked early with penalty',
          returned_amount: returnAmount,
          penalty_amount: penalty
        });

      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }

    } else {
      // Normal unstaking with rewards
      const stakingDays = Math.floor((endDate - new Date(staking.start_date)) / (1000 * 60 * 60 * 24));
      const rewards = (parseFloat(staking.amount) * parseFloat(staking.apy_rate) / 100) * (stakingDays / 365);
      const totalReturn = parseFloat(staking.amount) + rewards;

      await db.query('BEGIN');

      try {
        // Return tokens with rewards
        await db.query(
          'UPDATE token_balances SET balance = balance + $1 WHERE user_id = $2',
          [totalReturn, userId]
        );

        // Update staking status
        await db.query(
          'UPDATE token_staking SET status = $1, actual_end_date = NOW(), rewards_earned = $2 WHERE id = $3',
          ['completed', rewards, stakingId]
        );

        // Update Web3 profile
        await db.query(
          'UPDATE web3_profiles SET total_staked = total_staked - $1 WHERE user_id = $2',
          [staking.amount, userId]
        );

        // Keep governance power for completed stakings
        await db.query('COMMIT');

        res.json({
          message: 'Tokens unstaked successfully with rewards',
          returned_amount: totalReturn,
          rewards_earned: rewards
        });

      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    }

  } catch (error) {
    next(error);
  }
});

// Create Profile NFT
router.post('/nft/profile', async (req, res, next) => {
  try {
    const { error, value } = createNFTSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.details[0].message 
      });
    }

    const { name, description, attributes, image } = value;
    const userId = req.user.id;

    // Calculate rarity score based on attributes
    const rarityScore = calculateRarityScore(attributes);

    // Create NFT
    const nftResult = await db.query(`
      INSERT INTO nft_collections (
        id, owner_id, name, description, image_url, 
        attributes, rarity_score, nft_type, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'profile', NOW())
      RETURNING *
    `, [uuidv4(), userId, name, description, image, JSON.stringify(attributes), rarityScore]);

    // Update Web3 profile with NFT
    await db.query(
      'UPDATE web3_profiles SET profile_nft_id = $1 WHERE user_id = $2',
      [nftResult.rows[0].id, userId]
    );

    res.status(201).json({
      message: 'Profile NFT created successfully',
      nft: nftResult.rows[0]
    });

  } catch (error) {
    next(error);
  }
});

// Get Governance Proposals
router.get('/governance', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user's governance power
    const powerResult = await db.query(
      'SELECT governance_power FROM web3_profiles WHERE user_id = $1',
      [userId]
    );

    const governancePower = powerResult.rows[0]?.governance_power || 0;

    // Get active proposals
    const proposalsResult = await db.query(`
      SELECT 
        gp.*,
        u.full_name as proposer_name,
        COALESCE(votes_for.count, 0) as votes_for,
        COALESCE(votes_against.count, 0) as votes_against,
        uv.vote as user_vote
      FROM governance_proposals gp
      LEFT JOIN users u ON gp.proposer_id = u.id
      LEFT JOIN (
        SELECT proposal_id, COUNT(*) as count 
        FROM governance_votes 
        WHERE vote = 'for' 
        GROUP BY proposal_id
      ) votes_for ON gp.id = votes_for.proposal_id
      LEFT JOIN (
        SELECT proposal_id, COUNT(*) as count 
        FROM governance_votes 
        WHERE vote = 'against' 
        GROUP BY proposal_id
      ) votes_against ON gp.id = votes_against.proposal_id
      LEFT JOIN governance_votes uv ON gp.id = uv.proposal_id AND uv.user_id = $1
      WHERE gp.status = 'active'
      ORDER BY gp.created_at DESC
    `, [userId]);

    res.json({
      governance_power: governancePower,
      proposals: proposalsResult.rows
    });

  } catch (error) {
    next(error);
  }
});

// Vote on Governance Proposal
router.post('/governance/:proposalId/vote', async (req, res, next) => {
  try {
    const { proposalId } = req.params;
    const { vote } = req.body; // 'for' or 'against'
    const userId = req.user.id;

    if (!['for', 'against'].includes(vote)) {
      return res.status(400).json({ error: 'Invalid vote. Must be "for" or "against"' });
    }

    // Check governance power
    const powerResult = await db.query(
      'SELECT governance_power FROM web3_profiles WHERE user_id = $1',
      [userId]
    );

    const governancePower = powerResult.rows[0]?.governance_power || 0;
    if (governancePower === 0) {
      return res.status(400).json({ error: 'No governance power. Stake tokens to participate' });
    }

    // Check if already voted
    const existingVote = await db.query(
      'SELECT id FROM governance_votes WHERE proposal_id = $1 AND user_id = $2',
      [proposalId, userId]
    );

    if (existingVote.rows.length > 0) {
      return res.status(400).json({ error: 'Already voted on this proposal' });
    }

    // Cast vote
    await db.query(`
      INSERT INTO governance_votes (
        id, proposal_id, user_id, vote, voting_power, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `, [uuidv4(), proposalId, userId, vote, governancePower]);

    res.json({
      message: 'Vote cast successfully',
      vote: vote,
      voting_power: governancePower
    });

  } catch (error) {
    next(error);
  }
});

// Helper function to calculate NFT rarity score
function calculateRarityScore(attributes) {
  let score = 0;
  
  // Base score
  score += Object.keys(attributes).length * 10;
  
  // Bonus for rare attributes
  if (attributes.background === 'legendary') score += 100;
  if (attributes.eyes === 'laser') score += 80;
  if (attributes.accessories === 'crown') score += 90;
  
  return Math.min(score, 1000); // Max score 1000
}

module.exports = router;

