const express = require('express');
const Joi = require('joi');
const db = require('../config/database');

const router = express.Router();

// Mock data for services
const mockVietjetFlights = [
  {
    id: 'VJ001',
    from: 'HAN',
    to: 'SGN',
    fromCity: 'Hanoi',
    toCity: 'Ho Chi Minh City',
    departureTime: '2024-01-15T08:00:00Z',
    arrivalTime: '2024-01-15T10:15:00Z',
    price: 1500000,
    currency: 'VND',
    aircraft: 'A321',
    availableSeats: 45,
    duration: '2h 15m'
  },
  {
    id: 'VJ002',
    from: 'SGN',
    to: 'HAN',
    fromCity: 'Ho Chi Minh City',
    toCity: 'Hanoi',
    departureTime: '2024-01-15T14:30:00Z',
    arrivalTime: '2024-01-15T16:45:00Z',
    price: 1650000,
    currency: 'VND',
    aircraft: 'A321',
    availableSeats: 32,
    duration: '2h 15m'
  },
  {
    id: 'VJ003',
    from: 'HAN',
    to: 'DAD',
    fromCity: 'Hanoi',
    toCity: 'Da Nang',
    departureTime: '2024-01-16T09:15:00Z',
    arrivalTime: '2024-01-16T10:30:00Z',
    price: 1200000,
    currency: 'VND',
    aircraft: 'A320',
    availableSeats: 28,
    duration: '1h 15m'
  }
];

const mockHDBankProducts = [
  {
    id: 'HDB001',
    type: 'savings_account',
    name: 'HD Savings Plus',
    description: 'High-interest savings account with flexible terms',
    interestRate: 6.5,
    minimumBalance: 1000000,
    currency: 'VND',
    features: ['Online banking', 'Mobile app', 'ATM access', 'No monthly fees'],
    tokensBonus: 1.2 // 20% bonus tokens
  },
  {
    id: 'HDB002',
    type: 'credit_card',
    name: 'HD Platinum Card',
    description: 'Premium credit card with rewards and benefits',
    annualFee: 500000,
    creditLimit: 50000000,
    currency: 'VND',
    features: ['Cashback rewards', 'Travel insurance', 'Airport lounge access', 'Concierge service'],
    tokensBonus: 1.5 // 50% bonus tokens
  },
  {
    id: 'HDB003',
    type: 'investment',
    name: 'HD Smart Investment',
    description: 'Diversified investment portfolio management',
    minimumInvestment: 10000000,
    expectedReturn: 8.5,
    currency: 'VND',
    features: ['Professional management', 'Quarterly reports', 'Risk assessment', 'Online tracking'],
    tokensBonus: 1.3 // 30% bonus tokens
  }
];

const mockResorts = [
  {
    id: 'RST001',
    name: 'Sunrise Beach Resort',
    location: 'Phu Quoc Island',
    rating: 4.5,
    pricePerNight: 2500000,
    currency: 'VND',
    amenities: ['Private beach', 'Spa', 'Pool', 'Restaurant', 'Gym'],
    images: ['/images/resort1.jpg'],
    description: 'Luxury beachfront resort with stunning ocean views',
    tokensBonus: 1.2 // 20% bonus tokens
  },
  {
    id: 'RST002',
    name: 'Mountain View Lodge',
    location: 'Sapa',
    rating: 4.2,
    pricePerNight: 1800000,
    currency: 'VND',
    amenities: ['Mountain views', 'Fireplace', 'Restaurant', 'Trekking guides'],
    images: ['/images/resort2.jpg'],
    description: 'Cozy mountain retreat perfect for nature lovers',
    tokensBonus: 1.1 // 10% bonus tokens
  },
  {
    id: 'RST003',
    name: 'City Center Hotel',
    location: 'Ho Chi Minh City',
    rating: 4.0,
    pricePerNight: 2200000,
    currency: 'VND',
    amenities: ['City center location', 'Business center', 'Pool', 'Restaurant'],
    images: ['/images/resort3.jpg'],
    description: 'Modern hotel in the heart of the city',
    tokensBonus: 1.0 // Standard rate
  }
];

const mockInsuranceProducts = [
  {
    id: 'INS001',
    type: 'travel_insurance',
    name: 'Travel Protection Plus',
    description: 'Comprehensive travel insurance for domestic and international trips',
    coverage: 100000000,
    premium: 250000,
    currency: 'VND',
    benefits: ['Medical coverage', 'Trip cancellation', 'Baggage protection', 'Emergency assistance'],
    tokensBonus: 1.1 // 10% bonus tokens
  },
  {
    id: 'INS002',
    type: 'health_insurance',
    name: 'Health Guard Premium',
    description: 'Premium health insurance with extensive coverage',
    coverage: 500000000,
    premium: 1200000,
    currency: 'VND',
    benefits: ['Hospitalization', 'Outpatient care', 'Dental coverage', 'Vision care'],
    tokensBonus: 1.3 // 30% bonus tokens
  }
];

// Vietjet flight search
router.get('/vietjet/flights', async (req, res, next) => {
  try {
    const { from, to, date, passengers } = req.query;
    
    let flights = [...mockVietjetFlights];
    
    // Filter by route if specified
    if (from && to) {
      flights = flights.filter(flight => 
        flight.from === from.toUpperCase() && flight.to === to.toUpperCase()
      );
    }
    
    // Simulate date filtering (in real implementation, would filter by actual date)
    if (date) {
      // For demo, just return flights
    }
    
    // Calculate estimated tokens for each flight
    flights = flights.map(flight => ({
      ...flight,
      estimatedTokens: Math.floor(flight.price / 10000),
      estimatedTokensPrime: Math.floor((flight.price / 10000) * 1.5)
    }));
    
    res.json({
      flights,
      searchCriteria: { from, to, date, passengers: parseInt(passengers) || 1 },
      totalResults: flights.length
    });
  } catch (error) {
    next(error);
  }
});

// Book Vietjet flight
router.post('/vietjet/book', async (req, res, next) => {
  try {
    const { flightId, passengers, contactInfo } = req.body;
    const userId = req.user.id;
    
    if (!flightId || !passengers || !contactInfo) {
      return res.status(400).json({ error: 'Missing required booking information' });
    }
    
    const flight = mockVietjetFlights.find(f => f.id === flightId);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    
    const totalPrice = flight.price * passengers.length;
    const bookingReference = `VJ-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Create booking record
    const bookingResult = await db.query(`
      INSERT INTO service_bookings (
        user_id, service_type, booking_reference, 
        total_amount, booking_details
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `, [
      userId, 'vietjet', bookingReference, totalPrice,
      JSON.stringify({
        flight,
        passengers,
        contactInfo,
        bookingDate: new Date().toISOString()
      })
    ]);
    
    res.json({
      success: true,
      booking: {
        id: bookingResult.rows[0].id,
        bookingReference,
        flight,
        passengers,
        totalPrice,
        currency: 'VND',
        status: 'confirmed',
        createdAt: bookingResult.rows[0].created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// HDBank products
router.get('/hdbank/products', async (req, res, next) => {
  try {
    const { type } = req.query;
    
    let products = [...mockHDBankProducts];
    
    if (type) {
      products = products.filter(product => product.type === type);
    }
    
    // Calculate estimated tokens for each product
    products = products.map(product => {
      let baseAmount = 0;
      if (product.type === 'savings_account') {
        baseAmount = product.minimumBalance;
      } else if (product.type === 'credit_card') {
        baseAmount = product.annualFee;
      } else if (product.type === 'investment') {
        baseAmount = product.minimumInvestment;
      }
      
      const baseTokens = Math.floor(baseAmount / 10000);
      
      return {
        ...product,
        estimatedTokens: Math.floor(baseTokens * (product.tokensBonus || 1.0)),
        estimatedTokensPrime: Math.floor(baseTokens * (product.tokensBonus || 1.0) * 1.5)
      };
    });
    
    res.json({
      products,
      totalResults: products.length
    });
  } catch (error) {
    next(error);
  }
});

// Apply for HDBank product
router.post('/hdbank/apply', async (req, res, next) => {
  try {
    const { productId, applicationDetails } = req.body;
    const userId = req.user.id;
    
    if (!productId || !applicationDetails) {
      return res.status(400).json({ error: 'Missing required application information' });
    }
    
    const product = mockHDBankProducts.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    let applicationAmount = 0;
    if (product.type === 'savings_account') {
      applicationAmount = applicationDetails.initialDeposit || product.minimumBalance;
    } else if (product.type === 'credit_card') {
      applicationAmount = product.annualFee;
    } else if (product.type === 'investment') {
      applicationAmount = applicationDetails.investmentAmount || product.minimumInvestment;
    }
    
    const applicationReference = `HDB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Create application record
    const applicationResult = await db.query(`
      INSERT INTO service_bookings (
        user_id, service_type, booking_reference, 
        total_amount, booking_details, status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at
    `, [
      userId, 'hdbank', applicationReference, applicationAmount,
      JSON.stringify({
        product,
        applicationDetails,
        applicationDate: new Date().toISOString()
      }),
      'pending_approval'
    ]);
    
    res.json({
      success: true,
      application: {
        id: applicationResult.rows[0].id,
        applicationReference,
        product,
        applicationAmount,
        currency: 'VND',
        status: 'pending_approval',
        createdAt: applicationResult.rows[0].created_at,
        estimatedProcessingTime: '3-5 business days'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Resort search
router.get('/resorts', async (req, res, next) => {
  try {
    const { location, checkIn, checkOut, guests } = req.query;
    
    let resorts = [...mockResorts];
    
    // Filter by location if specified
    if (location) {
      resorts = resorts.filter(resort => 
        resort.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Calculate total price and estimated tokens
    const nights = checkIn && checkOut ? 
      Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) : 1;
    
    resorts = resorts.map(resort => {
      const totalPrice = resort.pricePerNight * nights;
      const baseTokens = Math.floor(totalPrice / 10000);
      
      return {
        ...resort,
        nights,
        totalPrice,
        estimatedTokens: Math.floor(baseTokens * (resort.tokensBonus || 1.0)),
        estimatedTokensPrime: Math.floor(baseTokens * (resort.tokensBonus || 1.0) * 1.5)
      };
    });
    
    res.json({
      resorts,
      searchCriteria: { location, checkIn, checkOut, guests: parseInt(guests) || 2 },
      totalResults: resorts.length
    });
  } catch (error) {
    next(error);
  }
});

// Book resort
router.post('/resorts/book', async (req, res, next) => {
  try {
    const { resortId, checkIn, checkOut, guests, specialRequests } = req.body;
    const userId = req.user.id;
    
    if (!resortId || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'Missing required booking information' });
    }
    
    const resort = mockResorts.find(r => r.id === resortId);
    if (!resort) {
      return res.status(404).json({ error: 'Resort not found' });
    }
    
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalPrice = resort.pricePerNight * nights;
    const bookingReference = `RST-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Create booking record
    const bookingResult = await db.query(`
      INSERT INTO service_bookings (
        user_id, service_type, booking_reference, 
        total_amount, booking_details
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `, [
      userId, 'resort', bookingReference, totalPrice,
      JSON.stringify({
        resort,
        checkIn,
        checkOut,
        nights,
        guests: parseInt(guests) || 2,
        specialRequests,
        bookingDate: new Date().toISOString()
      })
    ]);
    
    res.json({
      success: true,
      booking: {
        id: bookingResult.rows[0].id,
        bookingReference,
        resort,
        checkIn,
        checkOut,
        nights,
        guests,
        totalPrice,
        currency: 'VND',
        status: 'confirmed',
        createdAt: bookingResult.rows[0].created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Insurance products
router.get('/insurance', async (req, res, next) => {
  try {
    const { type } = req.query;
    
    let products = [...mockInsuranceProducts];
    
    if (type) {
      products = products.filter(product => product.type === type);
    }
    
    // Calculate estimated tokens for each product
    products = products.map(product => {
      const baseTokens = Math.floor(product.premium / 10000);
      
      return {
        ...product,
        estimatedTokens: Math.floor(baseTokens * (product.tokensBonus || 1.0)),
        estimatedTokensPrime: Math.floor(baseTokens * (product.tokensBonus || 1.0) * 1.5)
      };
    });
    
    res.json({
      products,
      totalResults: products.length
    });
  } catch (error) {
    next(error);
  }
});

// Purchase insurance
router.post('/insurance/purchase', async (req, res, next) => {
  try {
    const { productId, policyDetails, beneficiaries } = req.body;
    const userId = req.user.id;
    
    if (!productId || !policyDetails) {
      return res.status(400).json({ error: 'Missing required policy information' });
    }
    
    const product = mockInsuranceProducts.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: 'Insurance product not found' });
    }
    
    const policyReference = `INS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Create policy record
    const policyResult = await db.query(`
      INSERT INTO service_bookings (
        user_id, service_type, booking_reference, 
        total_amount, booking_details
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `, [
      userId, 'insurance', policyReference, product.premium,
      JSON.stringify({
        product,
        policyDetails,
        beneficiaries,
        policyDate: new Date().toISOString(),
        policyPeriod: '1 year'
      })
    ]);
    
    res.json({
      success: true,
      policy: {
        id: policyResult.rows[0].id,
        policyReference,
        product,
        premium: product.premium,
        coverage: product.coverage,
        currency: 'VND',
        status: 'active',
        createdAt: policyResult.rows[0].created_at,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all user bookings across services
router.get('/bookings', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const serviceType = req.query.service_type;

    let query = `
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
    `;
    
    const params = [userId];
    
    if (serviceType) {
      query += ` AND service_type = $${params.length + 1}`;
      params.push(serviceType);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const bookingsResult = await db.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM service_bookings WHERE user_id = $1';
    const countParams = [userId];
    
    if (serviceType) {
      countQuery += ' AND service_type = $2';
      countParams.push(serviceType);
    }
    
    const countResult = await db.query(countQuery, countParams);
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

