const express = require('express');
const Joi = require('joi');
const db = require('../config/database');

const router = express.Router();

// Real flight data for Vietnam routes
const FLIGHT_ROUTES = {
  'HAN-SGN': { distance: 1160, basePrice: 1500000 }, // Hanoi to Ho Chi Minh
  'SGN-HAN': { distance: 1160, basePrice: 1500000 },
  'HAN-DAD': { distance: 763, basePrice: 1200000 }, // Hanoi to Da Nang
  'DAD-HAN': { distance: 763, basePrice: 1200000 },
  'SGN-DAD': { distance: 608, basePrice: 1000000 }, // Ho Chi Minh to Da Nang
  'DAD-SGN': { distance: 608, basePrice: 1000000 },
  'HAN-PQC': { distance: 1050, basePrice: 1800000 }, // Hanoi to Phu Quoc
  'PQC-HAN': { distance: 1050, basePrice: 1800000 },
  'SGN-PQC': { distance: 320, basePrice: 900000 }, // Ho Chi Minh to Phu Quoc
  'PQC-SGN': { distance: 320, basePrice: 900000 },
  'HAN-NHA': { distance: 650, basePrice: 1100000 }, // Hanoi to Nha Trang
  'NHA-HAN': { distance: 650, basePrice: 1100000 },
  'SGN-NHA': { distance: 448, basePrice: 800000 }, // Ho Chi Minh to Nha Trang
  'NHA-SGN': { distance: 448, basePrice: 800000 },
  'HAN-HUI': { distance: 658, basePrice: 1150000 }, // Hanoi to Hue
  'HUI-HAN': { distance: 658, basePrice: 1150000 },
  'SGN-BMV': { distance: 245, basePrice: 700000 }, // Ho Chi Minh to Buon Ma Thuot
  'BMV-SGN': { distance: 245, basePrice: 700000 },
  'HAN-VII': { distance: 1750, basePrice: 2200000 }, // Hanoi to Vinh
  'VII-HAN': { distance: 1750, basePrice: 2200000 },
};

const AIRPORTS = {
  'HAN': { code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam' },
  'SGN': { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam' },
  'DAD': { code: 'DAD', name: 'Da Nang International Airport', city: 'Da Nang', country: 'Vietnam' },
  'PQC': { code: 'PQC', name: 'Phu Quoc International Airport', city: 'Phu Quoc', country: 'Vietnam' },
  'NHA': { code: 'NHA', name: 'Cam Ranh International Airport', city: 'Nha Trang', country: 'Vietnam' },
  'HUI': { code: 'HUI', name: 'Phu Bai Airport', city: 'Hue', country: 'Vietnam' },
  'BMV': { code: 'BMV', name: 'Buon Ma Thuot Airport', city: 'Buon Ma Thuot', country: 'Vietnam' },
  'VII': { code: 'VII', name: 'Vinh Airport', city: 'Vinh', country: 'Vietnam' },
};

// Real aircraft types used by VietJet
const AIRCRAFT_TYPES = [
  { model: 'Airbus A320', capacity: 180, fuelConsumption: 3.5 },
  { model: 'Airbus A321', capacity: 230, fuelConsumption: 4.2 },
  { model: 'Boeing 737-800', capacity: 189, fuelConsumption: 3.8 }
];

// Dynamic pricing factors
const PRICING_FACTORS = {
  timeOfDay: {
    morning: 1.0,    // 06:00-11:59
    afternoon: 1.1,  // 12:00-17:59
    evening: 1.2,    // 18:00-23:59
    night: 0.9       // 00:00-05:59
  },
  dayOfWeek: {
    monday: 0.9,
    tuesday: 0.9,
    wednesday: 0.9,
    thursday: 1.0,
    friday: 1.2,
    saturday: 1.3,
    sunday: 1.1
  },
  seasonality: {
    low: 0.8,     // Jan-Mar, Nov
    medium: 1.0,  // Apr-Jun, Sep-Oct
    high: 1.4     // Jul-Aug, Dec
  },
  advanceBooking: {
    sameDay: 1.5,
    threeDays: 1.3,
    oneWeek: 1.1,
    twoWeeks: 1.0,
    oneMonth: 0.9,
    twoMonths: 0.8
  }
};

// Get airports list
router.get('/airports', async (req, res, next) => {
  try {
    const airports = Object.values(AIRPORTS);
    res.json({
      success: true,
      airports
    });
  } catch (error) {
    next(error);
  }
});

// Search flights with dynamic pricing
router.get('/search', async (req, res, next) => {
  try {
    const { from, to, departDate, returnDate, passengers = 1, cabin = 'economy' } = req.query;

    if (!from || !to || !departDate) {
      return res.status(400).json({ error: 'Missing required parameters: from, to, departDate' });
    }

    const routeKey = `${from}-${to}`;
    const route = FLIGHT_ROUTES[routeKey];

    if (!route) {
      return res.status(404).json({ error: 'Route not available' });
    }

    const departDateObj = new Date(departDate);
    const flights = generateFlights(from, to, departDateObj, route, parseInt(passengers), cabin);

    let result = { outbound: flights };

    // If return date provided, generate return flights
    if (returnDate) {
      const returnDateObj = new Date(returnDate);
      const returnRouteKey = `${to}-${from}`;
      const returnRoute = FLIGHT_ROUTES[returnRouteKey];
      
      if (returnRoute) {
        const returnFlights = generateFlights(to, from, returnDateObj, returnRoute, parseInt(passengers), cabin);
        result.return = returnFlights;
      }
    }

    res.json({
      success: true,
      searchParams: { from, to, departDate, returnDate, passengers, cabin },
      ...result
    });
  } catch (error) {
    next(error);
  }
});

function generateFlights(from, to, date, route, passengers, cabin) {
  const flights = [];
  const aircraft = AIRCRAFT_TYPES[Math.floor(Math.random() * AIRCRAFT_TYPES.length)];
  
  // Generate 4-6 flights per day
  const flightCount = 4 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < flightCount; i++) {
    const departureTime = generateDepartureTime(i, flightCount);
    const flightDuration = Math.floor(route.distance / 8) + Math.floor(Math.random() * 30); // roughly 8km/min
    const arrivalTime = new Date(date.getTime() + departureTime.getTime() + (flightDuration * 60000));
    
    const basePrice = route.basePrice;
    const dynamicPrice = calculateDynamicPrice(basePrice, date, departureTime, cabin);
    const finalPrice = Math.round(dynamicPrice * passengers);
    
    // Calculate SOV tokens earned (1 token per 10,000 VND)
    const sovTokensEarned = Math.floor(finalPrice / 10000);
    const primeMultiplier = 1.5; // For ATHENA Prime users
    const sovTokensPrime = Math.floor(sovTokensEarned * primeMultiplier);
    
    flights.push({
      flightNumber: `VJ${String(Math.floor(Math.random() * 899) + 100)}`,
      airline: 'VietJet Air',
      aircraft: aircraft.model,
      departure: {
        airport: AIRPORTS[from],
        time: formatTime(departureTime),
        date: date.toISOString().split('T')[0]
      },
      arrival: {
        airport: AIRPORTS[to],
        time: formatTime(arrivalTime),
        date: date.toISOString().split('T')[0]
      },
      duration: `${Math.floor(flightDuration / 60)}h ${flightDuration % 60}m`,
      price: {
        base: finalPrice,
        currency: 'VND',
        breakdown: {
          baseFare: Math.round(finalPrice * 0.7),
          taxes: Math.round(finalPrice * 0.2),
          fees: Math.round(finalPrice * 0.1)
        }
      },
      sovTokens: {
        standard: sovTokensEarned,
        prime: sovTokensPrime
      },
      cabin,
      availableSeats: Math.floor(Math.random() * 50) + 10,
      baggage: {
        carry: cabin === 'business' ? '10kg' : '7kg',
        checked: cabin === 'business' ? '30kg' : '20kg'
      },
      amenities: cabin === 'business' 
        ? ['Priority boarding', 'Lounge access', 'Extra legroom', 'Premium meal']
        : ['In-flight entertainment', 'Snacks available'],
      cancellationPolicy: 'Free cancellation up to 24 hours before departure',
      bookingReference: null
    });
  }
  
  return flights.sort((a, b) => a.departure.time.localeCompare(b.departure.time));
}

function generateDepartureTime(index, total) {
  // Distribute flights throughout the day
  const hoursInDay = 18; // 6 AM to 12 AM
  const interval = hoursInDay / total;
  const baseHour = 6 + (index * interval);
  const hour = Math.floor(baseHour);
  const minute = Math.floor((baseHour % 1) * 60);
  
  const time = new Date();
  time.setHours(hour, minute, 0, 0);
  return time;
}

function formatTime(date) {
  return date.toTimeString().slice(0, 5);
}

function calculateDynamicPrice(basePrice, date, departureTime, cabin) {
  let price = basePrice;
  
  // Cabin class multiplier
  const cabinMultiplier = cabin === 'business' ? 2.5 : 1.0;
  price *= cabinMultiplier;
  
  // Time of day factor
  const hour = departureTime.getHours();
  let timeOfDayFactor;
  if (hour >= 6 && hour < 12) timeOfDayFactor = PRICING_FACTORS.timeOfDay.morning;
  else if (hour >= 12 && hour < 18) timeOfDayFactor = PRICING_FACTORS.timeOfDay.afternoon;
  else if (hour >= 18 && hour < 24) timeOfDayFactor = PRICING_FACTORS.timeOfDay.evening;
  else timeOfDayFactor = PRICING_FACTORS.timeOfDay.night;
  
  price *= timeOfDayFactor;
  
  // Day of week factor
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayOfWeekFactor = PRICING_FACTORS.dayOfWeek[dayNames[date.getDay()]];
  price *= dayOfWeekFactor;
  
  // Seasonality factor
  const month = date.getMonth() + 1;
  let seasonFactor;
  if ([1, 2, 3, 11].includes(month)) seasonFactor = PRICING_FACTORS.seasonality.low;
  else if ([7, 8, 12].includes(month)) seasonFactor = PRICING_FACTORS.seasonality.high;
  else seasonFactor = PRICING_FACTORS.seasonality.medium;
  
  price *= seasonFactor;
  
  // Advance booking factor
  const today = new Date();
  const daysAhead = Math.floor((date - today) / (1000 * 60 * 60 * 24));
  let advanceBookingFactor;
  if (daysAhead <= 1) advanceBookingFactor = PRICING_FACTORS.advanceBooking.sameDay;
  else if (daysAhead <= 3) advanceBookingFactor = PRICING_FACTORS.advanceBooking.threeDays;
  else if (daysAhead <= 7) advanceBookingFactor = PRICING_FACTORS.advanceBooking.oneWeek;
  else if (daysAhead <= 14) advanceBookingFactor = PRICING_FACTORS.advanceBooking.twoWeeks;
  else if (daysAhead <= 30) advanceBookingFactor = PRICING_FACTORS.advanceBooking.oneMonth;
  else advanceBookingFactor = PRICING_FACTORS.advanceBooking.twoMonths;
  
  price *= advanceBookingFactor;
  
  // Random demand factor (± 20%)
  const demandFactor = 0.8 + (Math.random() * 0.4);
  price *= demandFactor;
  
  return Math.round(price);
}

// Get flight details
router.get('/flight/:flightNumber', async (req, res, next) => {
  try {
    const { flightNumber } = req.params;
    
    // In a real system, this would fetch from database
    // For now, we'll return mock detailed data
    
    res.json({
      success: true,
      flight: {
        flightNumber,
        airline: 'VietJet Air',
        aircraft: 'Airbus A320',
        route: 'HAN-SGN',
        schedule: {
          departure: { time: '08:30', airport: 'HAN', terminal: 'T1' },
          arrival: { time: '10:45', airport: 'SGN', terminal: 'T2' }
        },
        status: 'On Time',
        gate: 'A12',
        seatMap: generateSeatMap(),
        services: ['Wifi', 'Entertainment', 'Meals available'],
        crew: {
          captain: 'Nguyen Van A',
          firstOfficer: 'Tran Thi B',
          cabinChief: 'Le Van C'
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

function generateSeatMap() {
  const rows = 30;
  const seatsPerRow = 6;
  const seatMap = [];
  
  for (let row = 1; row <= rows; row++) {
    const rowSeats = [];
    for (let seat = 0; seat < seatsPerRow; seat++) {
      const seatLetter = String.fromCharCode(65 + seat); // A, B, C, D, E, F
      const isAvailable = Math.random() > 0.3; // 70% availability
      
      rowSeats.push({
        number: `${row}${seatLetter}`,
        type: row <= 3 ? 'business' : 'economy',
        available: isAvailable,
        price: row <= 3 ? 500000 : (seat === 0 || seat === 5 ? 200000 : 100000) // Window/aisle premium
      });
    }
    seatMap.push({ row, seats: rowSeats });
  }
  
  return seatMap;
}

// Book flight
router.post('/book', async (req, res, next) => {
  try {
    const {
      flightDetails,
      passengers,
      paymentMethod,
      contactInfo,
      sovTokenAmount,
      fiatAmount,
      bonusTokenPercentage = 0
    } = req.body;

    const userId = req.user.id;
    
    // Validate payment method
    const validPaymentMethods = ['sov_token', 'fiat', 'hybrid'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    const totalAmount = flightDetails.price.base;
    const baseTokensEarned = Math.floor(totalAmount / 10000);
    
    // Apply bonus token percentage
    const bonusTokens = Math.floor(baseTokensEarned * (bonusTokenPercentage / 100));
    const totalTokensEarned = baseTokensEarned + bonusTokens;

    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Process payment
      if (paymentMethod === 'sov_token') {
        const tokenAmount = Math.floor(totalAmount / 1000); // 1 token = 1000 VND for payment
        
        // Check user balance
        const balanceResult = await client.query(
          'SELECT balance FROM token_balances WHERE user_id = $1',
          [userId]
        );
        
        if (!balanceResult.rows[0] || parseFloat(balanceResult.rows[0].balance) < tokenAmount) {
          throw new Error('Insufficient SOV token balance');
        }
        
        // Deduct tokens
        await client.query(
          'UPDATE token_balances SET balance = balance - $1, total_spent = total_spent + $1 WHERE user_id = $2',
          [tokenAmount, userId]
        );
        
        // Record transaction
        await client.query(`
          INSERT INTO transactions (user_id, type, amount, description, service_type, status)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [userId, 'spend', tokenAmount, `Flight booking - ${flightDetails.flightNumber}`, 'vietjet', 'completed']);
        
      } else if (paymentMethod === 'fiat') {
        // Process fiat payment (in real system, integrate with payment gateway)
        // For now, we'll just record the transaction
      } else if (paymentMethod === 'hybrid') {
        // Process hybrid payment
        const tokenAmount = sovTokenAmount || 0;
        const fiatAmountActual = fiatAmount || 0;
        
        if (tokenAmount > 0) {
          // Check and deduct tokens
          const balanceResult = await client.query(
            'SELECT balance FROM token_balances WHERE user_id = $1',
            [userId]
          );
          
          if (!balanceResult.rows[0] || parseFloat(balanceResult.rows[0].balance) < tokenAmount) {
            throw new Error('Insufficient SOV token balance');
          }
          
          await client.query(
            'UPDATE token_balances SET balance = balance - $1, total_spent = total_spent + $1 WHERE user_id = $2',
            [tokenAmount, userId]
          );
        }
      }

      // Generate booking reference
      const bookingReference = `VJ${Date.now().toString().slice(-8)}`;
      
      // Create booking record
      const bookingResult = await client.query(`
        INSERT INTO service_bookings (
          user_id, service_type, booking_reference, total_amount, 
          tokens_earned, status, booking_details
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [
        userId, 
        'vietjet', 
        bookingReference, 
        totalAmount,
        totalTokensEarned,
        'confirmed',
        JSON.stringify({
          flight: flightDetails,
          passengers,
          contactInfo,
          paymentMethod,
          bonusTokenPercentage
        })
      ]);

      // Award tokens
      await client.query(
        'UPDATE token_balances SET balance = balance + $1, total_earned = total_earned + $1 WHERE user_id = $2',
        [totalTokensEarned, userId]
      );
      
      // Record token earning transaction
      await client.query(`
        INSERT INTO transactions (user_id, type, amount, description, service_type, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [userId, 'earn', totalTokensEarned, `Tokens earned from flight booking - ${bookingReference}`, 'vietjet', 'completed']);

      await client.query('COMMIT');

      // Emit real-time notification
      const io = req.app.get('socketio');
      if (io) {
        io.to(`user_${userId}`).emit('booking_confirmed', {
          bookingReference,
          tokensEarned: totalTokensEarned,
          message: 'Flight booking confirmed successfully!',
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        message: 'Flight booked successfully',
        booking: {
          id: bookingResult.rows[0].id,
          bookingReference,
          totalAmount,
          tokensEarned: totalTokensEarned,
          bonusTokensEarned: bonusTokens,
          status: 'confirmed'
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

module.exports = router;

