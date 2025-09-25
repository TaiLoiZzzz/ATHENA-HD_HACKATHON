const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const { adminAuthMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const flightSchema = Joi.object({
  flightNumber: Joi.string().required(),
  airline: Joi.string().default('Vietjet Air'),
  departure: Joi.object({
    airport: Joi.string().required(),
    city: Joi.string().required(),
    time: Joi.string().required(),
    terminal: Joi.string().optional()
  }).required(),
  arrival: Joi.object({
    airport: Joi.string().required(),
    city: Joi.string().required(),
    time: Joi.string().required(),
    terminal: Joi.string().optional()
  }).required(),
  aircraft: Joi.string().optional(),
  duration: Joi.string().required(),
  price: Joi.object({
    economy: Joi.number().min(0).required(),
    business: Joi.number().min(0).optional(),
    sovTokenDiscount: Joi.number().min(0).max(100).optional()
  }).required(),
  availability: Joi.object({
    economy: Joi.number().min(0).required(),
    business: Joi.number().min(0).optional()
  }).required(),
  baggage: Joi.object({
    checkedIncluded: Joi.number().min(0).default(20),
    handCarryIncluded: Joi.number().min(0).default(7)
  }).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  isActive: Joi.boolean().default(true),
  departureDate: Joi.date().required()
});

const routeSchema = Joi.object({
  from: Joi.string().required(),
  to: Joi.string().required(),
  fromCity: Joi.string().required(),
  toCity: Joi.string().required(),
  distance: Joi.number().min(0).optional(),
  duration: Joi.string().required(),
  isActive: Joi.boolean().default(true)
});

// Apply admin middleware
router.use(adminAuthMiddleware);

// Get all flights
router.get('/flights', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      from = null, 
      to = null,
      departureDate = null,
      isActive = null,
      sortBy = 'departure_date',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build WHERE clause
    let whereClause = '1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (from) {
      whereClause += ` AND departure->>'airport' = $${paramIndex}`;
      queryParams.push(from);
      paramIndex++;
    }

    if (to) {
      whereClause += ` AND arrival->>'airport' = $${paramIndex}`;
      queryParams.push(to);
      paramIndex++;
    }

    if (departureDate) {
      whereClause += ` AND DATE(departure_date) = $${paramIndex}`;
      queryParams.push(departureDate);
      paramIndex++;
    }

    if (isActive !== null) {
      whereClause += ` AND is_active = $${paramIndex}`;
      queryParams.push(isActive === 'true');
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM vietjet_flights WHERE ${whereClause}`;
    const countResult = await db.query(countQuery, queryParams);
    const totalFlights = parseInt(countResult.rows[0].count);

    // Get flights
    const flightsQuery = `
      SELECT * FROM vietjet_flights 
      WHERE ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(parseInt(limit), offset);
    const flightsResult = await db.query(flightsQuery, queryParams);

    // Get statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_flights,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_flights,
        COUNT(CASE WHEN departure_date >= CURRENT_DATE THEN 1 END) as upcoming_flights,
        AVG((price->>'economy')::numeric) as avg_price,
        COUNT(DISTINCT departure->>'airport') as departure_airports,
        COUNT(DISTINCT arrival->>'airport') as arrival_airports
      FROM vietjet_flights
    `;
    const statsResult = await db.query(statsQuery);

    res.json({
      flights: flightsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalFlights,
        totalPages: Math.ceil(totalFlights / limit)
      },
      statistics: statsResult.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Get flight by ID
router.get('/flights/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const flightResult = await db.query('SELECT * FROM vietjet_flights WHERE id = $1', [id]);
    
    if (flightResult.rows.length === 0) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    // Get booking statistics for this flight
    const bookingsQuery = `
      SELECT 
        COUNT(*) as total_bookings,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_booking_value,
        COUNT(CASE WHEN metadata->>'class' = 'economy' THEN 1 END) as economy_bookings,
        COUNT(CASE WHEN metadata->>'class' = 'business' THEN 1 END) as business_bookings
      FROM transactions 
      WHERE service_type = 'vietjet' 
      AND service_reference_id = $1
    `;
    const bookingsResult = await db.query(bookingsQuery, [id]);

    res.json({
      flight: flightResult.rows[0],
      bookings: bookingsResult.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Create new flight
router.post('/flights', async (req, res, next) => {
  try {
    const { error, value } = flightSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const insertQuery = `
      INSERT INTO vietjet_flights (
        flight_number, airline, departure, arrival, aircraft, duration,
        price, availability, baggage, amenities, is_active, departure_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await db.query(insertQuery, [
      value.flightNumber,
      value.airline,
      JSON.stringify(value.departure),
      JSON.stringify(value.arrival),
      value.aircraft,
      value.duration,
      JSON.stringify(value.price),
      JSON.stringify(value.availability),
      JSON.stringify(value.baggage),
      JSON.stringify(value.amenities || []),
      value.isActive,
      value.departureDate
    ]);

    res.status(201).json({
      message: 'Flight created successfully',
      flight: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Update flight
router.put('/flights/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = flightSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if flight exists
    const existingFlight = await db.query('SELECT id FROM vietjet_flights WHERE id = $1', [id]);
    if (existingFlight.rows.length === 0) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    const updateQuery = `
      UPDATE vietjet_flights SET
        flight_number = $1, airline = $2, departure = $3, arrival = $4,
        aircraft = $5, duration = $6, price = $7, availability = $8,
        baggage = $9, amenities = $10, is_active = $11, departure_date = $12,
        updated_at = NOW()
      WHERE id = $13
      RETURNING *
    `;

    const result = await db.query(updateQuery, [
      value.flightNumber,
      value.airline,
      JSON.stringify(value.departure),
      JSON.stringify(value.arrival),
      value.aircraft,
      value.duration,
      JSON.stringify(value.price),
      JSON.stringify(value.availability),
      JSON.stringify(value.baggage),
      JSON.stringify(value.amenities || []),
      value.isActive,
      value.departureDate,
      id
    ]);

    res.json({
      message: 'Flight updated successfully',
      flight: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Delete flight
router.delete('/flights/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if flight exists
    const existingFlight = await db.query('SELECT id FROM vietjet_flights WHERE id = $1', [id]);
    if (existingFlight.rows.length === 0) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    // Soft delete
    await db.query('UPDATE vietjet_flights SET is_active = false, updated_at = NOW() WHERE id = $1', [id]);

    res.json({ message: 'Flight deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get routes management
router.get('/routes', async (req, res, next) => {
  try {
    const routesQuery = `
      SELECT 
        departure->>'airport' as from_airport,
        departure->>'city' as from_city,
        arrival->>'airport' as to_airport,
        arrival->>'city' as to_city,
        COUNT(*) as flight_count,
        AVG((price->>'economy')::numeric) as avg_price,
        MIN(departure_date) as earliest_departure,
        MAX(departure_date) as latest_departure
      FROM vietjet_flights
      WHERE is_active = true
      GROUP BY departure->>'airport', departure->>'city', arrival->>'airport', arrival->>'city'
      ORDER BY flight_count DESC
    `;

    const routesResult = await db.query(routesQuery);

    res.json({
      routes: routesResult.rows
    });
  } catch (error) {
    next(error);
  }
});

// Get flight bookings
router.get('/flights/:id/bookings', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const bookingsQuery = `
      SELECT 
        t.*,
        u.full_name,
        u.email
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.service_type = 'vietjet' 
      AND t.service_reference_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const bookingsResult = await db.query(bookingsQuery, [id, limit, offset]);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) FROM transactions 
      WHERE service_type = 'vietjet' AND service_reference_id = $1
    `;
    const countResult = await db.query(countQuery, [id]);

    res.json({
      bookings: bookingsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update flight availability
router.patch('/flights/:id/availability', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { economy, business } = req.body;

    const updateQuery = `
      UPDATE vietjet_flights 
      SET availability = jsonb_set(
        jsonb_set(availability, '{economy}', $1::text::jsonb),
        '{business}', $2::text::jsonb
      ),
      updated_at = NOW()
      WHERE id = $3
      RETURNING availability
    `;

    const result = await db.query(updateQuery, [economy || 0, business || 0, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    res.json({
      message: 'Availability updated successfully',
      availability: result.rows[0].availability
    });
  } catch (error) {
    next(error);
  }
});

// Get sales report
router.get('/sales-report', async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    let dateFilter = '';
    const queryParams = [];
    let paramIndex = 1;

    if (startDate) {
      dateFilter += ` AND t.created_at >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      dateFilter += ` AND t.created_at <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    const salesQuery = `
      SELECT 
        DATE_TRUNC('${groupBy}', t.created_at) as period,
        COUNT(*) as bookings_count,
        SUM(t.amount) as total_revenue,
        AVG(t.amount) as avg_booking_value,
        f.departure->>'city' as departure_city,
        f.arrival->>'city' as arrival_city
      FROM transactions t
      JOIN vietjet_flights f ON t.service_reference_id = f.id
      WHERE t.service_type = 'vietjet'
      ${dateFilter}
      GROUP BY DATE_TRUNC('${groupBy}', t.created_at), f.departure->>'city', f.arrival->>'city'
      ORDER BY period DESC, total_revenue DESC
    `;

    const salesResult = await db.query(salesQuery, queryParams);

    // Get summary
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_bookings,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_booking_value
      FROM transactions 
      WHERE service_type = 'vietjet'
      ${dateFilter}
    `;

    const summaryResult = await db.query(summaryQuery, queryParams);

    res.json({
      sales: salesResult.rows,
      summary: summaryResult.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


