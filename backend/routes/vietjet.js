 const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const blockchainService = require('../services/blockchainService');

const router = express.Router();

// Validation schemas
const flightSearchSchema = Joi.object({
  origin: Joi.string().length(3).required(), // Airport code
  destination: Joi.string().length(3).required(),
  departureDate: Joi.date().min('now').required(),
  returnDate: Joi.date().min(Joi.ref('departureDate')).optional(),
  passengers: Joi.object({
    adults: Joi.number().min(1).max(9).required(),
    children: Joi.number().min(0).max(8).default(0),
    infants: Joi.number().min(0).max(2).default(0)
  }).required(),
  class: Joi.string().valid('economy', 'business').default('economy')
});

const bookingSchema = Joi.object({
  flightId: Joi.string().uuid().required(),
  passengers: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('adult', 'child', 'infant').required(),
      title: Joi.string().valid('Mr', 'Mrs', 'Ms').required(),
      firstName: Joi.string().min(1).required(),
      lastName: Joi.string().min(1).required(),
      dateOfBirth: Joi.date().required(),
      nationality: Joi.string().length(2).required(),
      passportNumber: Joi.string().optional(),
      passportExpiry: Joi.date().optional()
    })
  ).min(1).required(),
  contactInfo: Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required()
  }).required(),
  paymentMethod: Joi.string().valid('sov_token', 'fiat', 'hybrid').required(),
  paymentDetails: Joi.object({
    sovTokenAmount: Joi.number().min(0).when('paymentMethod', {
      is: Joi.valid('sov_token', 'hybrid'),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    fiatAmount: Joi.number().min(0).when('paymentMethod', {
      is: Joi.valid('fiat', 'hybrid'),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    currency: Joi.string().valid('VND', 'USD').default('VND')
  }).required(),
  addOns: Joi.object({
    baggage: Joi.array().items(Joi.object({
      passengerIndex: Joi.number().required(),
      weight: Joi.number().valid(20, 25, 30).required(),
      price: Joi.number().required()
    })).default([]),
    meals: Joi.array().items(Joi.object({
      passengerIndex: Joi.number().required(),
      mealType: Joi.string().required(),
      price: Joi.number().required()
    })).default([]),
    seats: Joi.array().items(Joi.object({
      passengerIndex: Joi.number().required(),
      seatNumber: Joi.string().required(),
      price: Joi.number().required()
    })).default([])
  }).default({})
});

// Mock flight data - In production, this would come from Vietjet API
const mockFlights = [
  {
    id: uuidv4(),
    flightNumber: 'VJ123',
    origin: 'SGN',
    destination: 'HAN',
    departure: '2024-01-15T06:00:00Z',
    arrival: '2024-01-15T08:15:00Z',
    duration: 135,
    aircraft: 'Airbus A321',
    prices: {
      economy: { vnd: 1500000, usd: 62, sovToken: 150 },
      business: { vnd: 3000000, usd: 125, sovToken: 300 }
    },
    availability: {
      economy: 45,
      business: 8
    }
  },
  {
    id: uuidv4(),
    flightNumber: 'VJ456',
    origin: 'SGN',
    destination: 'DAD',
    departure: '2024-01-15T09:30:00Z',
    arrival: '2024-01-15T10:45:00Z',
    duration: 75,
    aircraft: 'Airbus A320',
    prices: {
      economy: { vnd: 1200000, usd: 50, sovToken: 120 },
      business: { vnd: 2400000, usd: 100, sovToken: 240 }
    },
    availability: {
      economy: 32,
      business: 4
    }
  }
];

// Search flights
router.get('/flights/search', async (req, res, next) => {
  try {
    const { error, value } = flightSearchSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ 
        error: 'Invalid search parameters', 
        details: error.details[0].message 
      });
    }

    const { origin, destination, departureDate, returnDate, passengers, class: flightClass } = value;

    // Mock flight search - In production, integrate with Vietjet API
    let availableFlights = mockFlights.filter(flight => 
      flight.origin === origin.toUpperCase() && 
      flight.destination === destination.toUpperCase() &&
      flight.availability[flightClass] >= passengers.adults + passengers.children
    );

    // Add dynamic pricing based on demand and SOV token rates
    const userId = req.user?.id;
    let sovTokenDiscount = 1.0;
    
    if (userId) {
      // Check if user is ATHENA Prime for additional discount
      const userResult = await db.query(
        'SELECT athena_prime FROM users WHERE id = $1',
        [userId]
      );
      
      if (userResult.rows[0]?.athena_prime) {
        sovTokenDiscount = 0.85; // 15% discount for Prime users
      }

      // Check user's token balance for payment options
      const balanceResult = await db.query(
        'SELECT balance FROM token_balances WHERE user_id = $1',
        [userId]
      );

      const tokenBalance = parseFloat(balanceResult.rows[0]?.balance || 0);

      availableFlights = availableFlights.map(flight => ({
        ...flight,
        prices: {
          ...flight.prices,
          [flightClass]: {
            ...flight.prices[flightClass],
            sovToken: Math.round(flight.prices[flightClass].sovToken * sovTokenDiscount)
          }
        },
        paymentOptions: {
          canPayWithTokens: tokenBalance >= flight.prices[flightClass].sovToken * sovTokenDiscount,
          canPayHybrid: tokenBalance >= flight.prices[flightClass].sovToken * sovTokenDiscount * 0.5,
          userTokenBalance: tokenBalance,
          requiredTokens: flight.prices[flightClass].sovToken * sovTokenDiscount
        }
      }));
    }

    res.json({
      flights: availableFlights,
      searchParams: value,
      totalResults: availableFlights.length
    });

  } catch (error) {
    next(error);
  }
});

// Get flight details
router.get('/flights/:flightId', async (req, res, next) => {
  try {
    const { flightId } = req.params;
    
    const flight = mockFlights.find(f => f.id === flightId);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    // Get additional flight details
    const flightDetails = {
      ...flight,
      seatMap: generateSeatMap(flight.aircraft),
      meals: [
        { id: 1, name: 'Vietnamese Pho', price: { vnd: 150000, usd: 6, sovToken: 15 } },
        { id: 2, name: 'Chicken Rice', price: { vnd: 120000, usd: 5, sovToken: 12 } },
        { id: 3, name: 'Vegetarian Option', price: { vnd: 100000, usd: 4, sovToken: 10 } }
      ],
      baggage: [
        { weight: 20, price: { vnd: 300000, usd: 12, sovToken: 30 } },
        { weight: 25, price: { vnd: 450000, usd: 18, sovToken: 45 } },
        { weight: 30, price: { vnd: 600000, usd: 25, sovToken: 60 } }
      ]
    };

    res.json(flightDetails);

  } catch (error) {
    next(error);
  }
});

// Create booking
router.post('/bookings', async (req, res, next) => {
  try {
    const { error, value } = bookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Invalid booking data', 
        details: error.details[0].message 
      });
    }

    const userId = req.user.id;
    const { flightId, passengers, contactInfo, paymentMethod, paymentDetails, addOns } = value;

    // Get flight details
    const flight = mockFlights.find(f => f.id === flightId);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    // Calculate total price
    const basePrice = flight.prices.economy; // Assuming economy for now
    let totalFiat = basePrice.vnd * passengers.length;
    let totalTokens = basePrice.sovToken * passengers.length;

    // Add add-ons pricing
    addOns.baggage?.forEach(bag => totalFiat += bag.price);
    addOns.meals?.forEach(meal => totalFiat += meal.price);
    addOns.seats?.forEach(seat => totalFiat += seat.price);

    // Convert add-ons to token equivalent (1 USD = 10 SOV tokens approximately)
    const addOnTokens = (totalFiat - (basePrice.vnd * passengers.length)) / 10000; // Rough conversion
    totalTokens += addOnTokens;

    await db.query('BEGIN');

    try {
      // Process payment based on method
      let paymentResult = null;

      if (paymentMethod === 'sov_token') {
        // Full token payment
        const userBalance = await db.query(
          'SELECT balance FROM token_balances WHERE user_id = $1',
          [userId]
        );

        if (parseFloat(userBalance.rows[0]?.balance || 0) < totalTokens) {
          throw new Error('Insufficient SOV token balance');
        }

        // Deduct tokens
        await db.query(
          'UPDATE token_balances SET balance = balance - $1 WHERE user_id = $2',
          [totalTokens, userId]
        );

        // Record token transaction
        await db.query(`
          INSERT INTO transactions (
            id, user_id, type, amount, description, 
            transaction_hash, status, created_at
          ) VALUES ($1, $2, 'debit', $3, $4, $5, 'completed', NOW())
        `, [
          uuidv4(), 
          userId, 
          totalTokens, 
          `Flight booking payment - ${flight.flightNumber}`,
          `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        ]);

        paymentResult = {
          method: 'sov_token',
          tokenAmount: totalTokens,
          fiatAmount: 0
        };

      } else if (paymentMethod === 'fiat') {
        // Fiat payment - integrate with payment gateway
        paymentResult = await processFiatPayment(paymentDetails, totalFiat);

      } else if (paymentMethod === 'hybrid') {
        // Hybrid payment
        const tokenAmount = paymentDetails.sovTokenAmount;
        const fiatAmount = paymentDetails.fiatAmount;

        // Validate token balance
        const userBalance = await db.query(
          'SELECT balance FROM token_balances WHERE user_id = $1',
          [userId]
        );

        if (parseFloat(userBalance.rows[0]?.balance || 0) < tokenAmount) {
          throw new Error('Insufficient SOV token balance');
        }

        // Deduct tokens
        await db.query(
          'UPDATE token_balances SET balance = balance - $1 WHERE user_id = $2',
          [tokenAmount, userId]
        );

        // Process fiat payment
        const fiatPaymentResult = await processFiatPayment(paymentDetails, fiatAmount);

        paymentResult = {
          method: 'hybrid',
          tokenAmount: tokenAmount,
          fiatAmount: fiatAmount,
          fiatPaymentId: fiatPaymentResult.paymentId
        };
      }

      // Create booking record
      const bookingResult = await db.query(`
        INSERT INTO vietjet_bookings (
          id, user_id, flight_id, flight_number, booking_reference,
          origin, destination, departure_time, arrival_time,
          passengers, contact_info, payment_method, payment_details,
          add_ons, total_amount, total_tokens, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
        RETURNING *
      `, [
        uuidv4(),
        userId,
        flightId,
        flight.flightNumber,
        generateBookingReference(),
        flight.origin,
        flight.destination,
        flight.departure,
        flight.arrival,
        JSON.stringify(passengers),
        JSON.stringify(contactInfo),
        paymentMethod,
        JSON.stringify(paymentResult),
        JSON.stringify(addOns),
        paymentMethod === 'sov_token' ? 0 : (paymentMethod === 'fiat' ? totalFiat : paymentDetails.fiatAmount),
        paymentMethod === 'fiat' ? 0 : (paymentMethod === 'sov_token' ? totalTokens : paymentDetails.sovTokenAmount),
        'confirmed'
      ]);

      // Award SOV tokens for booking (loyalty rewards)
      const rewardTokens = Math.floor(totalFiat / 100000); // 1 token per 100,000 VND spent
      if (rewardTokens > 0) {
        await db.query(
          'UPDATE token_balances SET balance = balance + $1 WHERE user_id = $2',
          [rewardTokens, userId]
        );

        // Record reward transaction
        await db.query(`
          INSERT INTO transactions (
            id, user_id, type, amount, description, 
            transaction_hash, status, created_at
          ) VALUES ($1, $2, 'credit', $3, $4, $5, 'completed', NOW())
        `, [
          uuidv4(), 
          userId, 
          rewardTokens, 
          `Loyalty rewards for flight booking - ${flight.flightNumber}`,
          `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        ]);
      }

      await db.query('COMMIT');

      res.status(201).json({
        message: 'Booking created successfully',
        booking: bookingResult.rows[0],
        loyaltyRewards: rewardTokens
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    next(error);
  }
});

// Get user bookings
router.get('/bookings', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, limit = 10, offset = 0 } = req.query;

    let whereClause = 'WHERE user_id = $1';
    let params = [userId];

    if (status) {
      whereClause += ' AND status = $2';
      params.push(status);
    }

    const bookingsResult = await db.query(`
      SELECT 
        vb.*,
        CASE 
          WHEN vb.departure_time > NOW() THEN 'upcoming'
          WHEN vb.departure_time <= NOW() AND vb.arrival_time > NOW() THEN 'in_progress'
          ELSE 'completed'
        END as flight_status
      FROM vietjet_bookings vb
      ${whereClause}
      ORDER BY vb.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]);

    res.json({
      bookings: bookingsResult.rows,
      total: bookingsResult.rows.length
    });

  } catch (error) {
    next(error);
  }
});

// Get booking details
router.get('/bookings/:bookingId', async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const bookingResult = await db.query(
      'SELECT * FROM vietjet_bookings WHERE id = $1 AND user_id = $2',
      [bookingId, userId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Get related transactions
    const transactionsResult = await db.query(`
      SELECT * FROM transactions 
      WHERE user_id = $1 AND description LIKE $2
      ORDER BY created_at DESC
    `, [userId, `%${booking.flight_number}%`]);

    res.json({
      booking: booking,
      transactions: transactionsResult.rows
    });

  } catch (error) {
    next(error);
  }
});

// Cancel booking
router.post('/bookings/:bookingId/cancel', async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const bookingResult = await db.query(
      'SELECT * FROM vietjet_bookings WHERE id = $1 AND user_id = $2 AND status != $3',
      [bookingId, userId, 'cancelled']
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or already cancelled' });
    }

    const booking = bookingResult.rows[0];
    const departureTime = new Date(booking.departure_time);
    const now = new Date();
    const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);

    // Calculate refund based on cancellation policy
    let refundPercentage = 0;
    if (hoursUntilDeparture > 24) {
      refundPercentage = 0.8; // 80% refund
    } else if (hoursUntilDeparture > 2) {
      refundPercentage = 0.5; // 50% refund
    } // No refund within 2 hours

    await db.query('BEGIN');

    try {
      // Process refund
      if (refundPercentage > 0) {
        const refundTokens = parseFloat(booking.total_tokens) * refundPercentage;
        const refundFiat = parseFloat(booking.total_amount) * refundPercentage;

        if (refundTokens > 0) {
          // Refund tokens
          await db.query(
            'UPDATE token_balances SET balance = balance + $1 WHERE user_id = $2',
            [refundTokens, userId]
          );

          // Record refund transaction
          await db.query(`
            INSERT INTO transactions (
              id, user_id, type, amount, description, 
              transaction_hash, status, created_at
            ) VALUES ($1, $2, 'credit', $3, $4, $5, 'completed', NOW())
          `, [
            uuidv4(), 
            userId, 
            refundTokens, 
            `Refund for cancelled booking - ${booking.flight_number}`,
            `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          ]);
        }

        if (refundFiat > 0) {
          // Process fiat refund (integrate with payment gateway)
          await processFiatRefund(booking.payment_details, refundFiat);
        }
      }

      // Update booking status
      await db.query(
        'UPDATE vietjet_bookings SET status = $1, cancelled_at = NOW() WHERE id = $2',
        ['cancelled', bookingId]
      );

      await db.query('COMMIT');

      res.json({
        message: 'Booking cancelled successfully',
        refund: {
          tokens: parseFloat(booking.total_tokens) * refundPercentage,
          fiat: parseFloat(booking.total_amount) * refundPercentage,
          percentage: refundPercentage * 100
        }
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    next(error);
  }
});

// Helper functions
function generateBookingReference() {
  return 'VJ' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
}

function generateSeatMap(aircraft) {
  // Mock seat map generation
  const rows = aircraft === 'Airbus A321' ? 32 : 28;
  const seatMap = [];
  
  for (let row = 1; row <= rows; row++) {
    const seats = ['A', 'B', 'C', 'D', 'E', 'F'].map(letter => ({
      number: `${row}${letter}`,
      available: Math.random() > 0.3, // 70% availability
      price: row <= 3 ? { vnd: 200000, sovToken: 20 } : { vnd: 100000, sovToken: 10 }
    }));
    seatMap.push({ row, seats });
  }
  
  return seatMap;
}

async function processFiatPayment(paymentDetails, amount) {
  // Mock fiat payment processing
  // In production, integrate with payment gateways like VNPay, Momo, etc.
  return {
    paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'completed',
    amount: amount,
    currency: paymentDetails.currency
  };
}

async function processFiatRefund(paymentDetails, amount) {
  // Mock fiat refund processing
  // In production, integrate with payment gateway refund APIs
  return {
    refundId: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'completed',
    amount: amount
  };
}

module.exports = router;

