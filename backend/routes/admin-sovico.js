const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const { adminAuthMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const serviceSchema = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().valid('resort', 'insurance', 'travel', 'lifestyle', 'financial').required(),
  description: Joi.string().required(),
  price: Joi.object({
    amount: Joi.number().min(0).required(),
    currency: Joi.string().valid('VND', 'USD').default('VND'),
    sovTokenPrice: Joi.number().min(0).optional(),
    sovTokenDiscount: Joi.number().min(0).max(100).optional()
  }).required(),
  features: Joi.array().items(Joi.string()).required(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  location: Joi.object({
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    country: Joi.string().optional(),
    coordinates: Joi.object({
      lat: Joi.number(),
      lng: Joi.number()
    }).optional()
  }).optional(),
  availability: Joi.object({
    available: Joi.boolean().default(true),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    capacity: Joi.number().min(0).optional(),
    booked: Joi.number().min(0).default(0)
  }).optional(),
  policies: Joi.object({
    cancellation: Joi.string().optional(),
    refund: Joi.string().optional(),
    terms: Joi.string().optional()
  }).optional(),
  ratings: Joi.object({
    average: Joi.number().min(0).max(5).default(0),
    count: Joi.number().min(0).default(0)
  }).optional(),
  isActive: Joi.boolean().default(true),
  isFeatured: Joi.boolean().default(false)
});

const packageSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  services: Joi.array().items(Joi.string()).required(), // Array of service IDs
  price: Joi.object({
    originalPrice: Joi.number().min(0).required(),
    packagePrice: Joi.number().min(0).required(),
    savings: Joi.number().min(0).required(),
    sovTokenDiscount: Joi.number().min(0).max(100).optional()
  }).required(),
  duration: Joi.string().optional(),
  highlights: Joi.array().items(Joi.string()).required(),
  isActive: Joi.boolean().default(true)
});

// Apply admin middleware
router.use(adminAuthMiddleware);

// Get all services
router.get('/services', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category = null, 
      isActive = null,
      isFeatured = null,
      search = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build WHERE clause
    let whereClause = '1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    if (isActive !== null) {
      whereClause += ` AND is_active = $${paramIndex}`;
      queryParams.push(isActive === 'true');
      paramIndex++;
    }

    if (isFeatured !== null) {
      whereClause += ` AND is_featured = $${paramIndex}`;
      queryParams.push(isFeatured === 'true');
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex + 1})`;
      queryParams.push(`%${search}%`, `%${search}%`);
      paramIndex += 2;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM sovico_services WHERE ${whereClause}`;
    const countResult = await db.query(countQuery, queryParams);
    const totalServices = parseInt(countResult.rows[0].count);

    // Get services
    const servicesQuery = `
      SELECT * FROM sovico_services 
      WHERE ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(parseInt(limit), offset);
    const servicesResult = await db.query(servicesQuery, queryParams);

    // Get statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_services,
        COUNT(CASE WHEN category = 'resort' THEN 1 END) as resort_count,
        COUNT(CASE WHEN category = 'insurance' THEN 1 END) as insurance_count,
        COUNT(CASE WHEN category = 'travel' THEN 1 END) as travel_count,
        COUNT(CASE WHEN category = 'lifestyle' THEN 1 END) as lifestyle_count,
        COUNT(CASE WHEN category = 'financial' THEN 1 END) as financial_count,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_services,
        COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_services,
        AVG((price->>'amount')::numeric) as avg_price
      FROM sovico_services
    `;
    const statsResult = await db.query(statsQuery);

    res.json({
      services: servicesResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalServices,
        totalPages: Math.ceil(totalServices / limit)
      },
      statistics: statsResult.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Get service by ID
router.get('/services/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const serviceResult = await db.query('SELECT * FROM sovico_services WHERE id = $1', [id]);
    
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Get booking statistics for this service
    const bookingsQuery = `
      SELECT 
        COUNT(*) as total_bookings,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_booking_value,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as bookings_30d
      FROM transactions 
      WHERE service_type = 'sovico' 
      AND service_reference_id = $1
    `;
    const bookingsResult = await db.query(bookingsQuery, [id]);

    // Get recent reviews/ratings
    const reviewsQuery = `
      SELECT 
        u.full_name,
        t.metadata->>'rating' as rating,
        t.metadata->>'review' as review,
        t.created_at
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.service_type = 'sovico' 
      AND t.service_reference_id = $1
      AND t.metadata->>'rating' IS NOT NULL
      ORDER BY t.created_at DESC
      LIMIT 10
    `;
    const reviewsResult = await db.query(reviewsQuery, [id]);

    res.json({
      service: serviceResult.rows[0],
      bookings: bookingsResult.rows[0],
      recentReviews: reviewsResult.rows
    });
  } catch (error) {
    next(error);
  }
});

// Create new service
router.post('/services', async (req, res, next) => {
  try {
    const { error, value } = serviceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const insertQuery = `
      INSERT INTO sovico_services (
        name, category, description, price, features, images, location,
        availability, policies, ratings, is_active, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await db.query(insertQuery, [
      value.name,
      value.category,
      value.description,
      JSON.stringify(value.price),
      JSON.stringify(value.features),
      JSON.stringify(value.images || []),
      JSON.stringify(value.location || {}),
      JSON.stringify(value.availability || {}),
      JSON.stringify(value.policies || {}),
      JSON.stringify(value.ratings || { average: 0, count: 0 }),
      value.isActive,
      value.isFeatured
    ]);

    res.status(201).json({
      message: 'Service created successfully',
      service: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Update service
router.put('/services/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = serviceSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if service exists
    const existingService = await db.query('SELECT id FROM sovico_services WHERE id = $1', [id]);
    if (existingService.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const updateQuery = `
      UPDATE sovico_services SET
        name = $1, category = $2, description = $3, price = $4, features = $5,
        images = $6, location = $7, availability = $8, policies = $9,
        ratings = $10, is_active = $11, is_featured = $12, updated_at = NOW()
      WHERE id = $13
      RETURNING *
    `;

    const result = await db.query(updateQuery, [
      value.name,
      value.category,
      value.description,
      JSON.stringify(value.price),
      JSON.stringify(value.features),
      JSON.stringify(value.images || []),
      JSON.stringify(value.location || {}),
      JSON.stringify(value.availability || {}),
      JSON.stringify(value.policies || {}),
      JSON.stringify(value.ratings || { average: 0, count: 0 }),
      value.isActive,
      value.isFeatured,
      id
    ]);

    res.json({
      message: 'Service updated successfully',
      service: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Delete service
router.delete('/services/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if service exists
    const existingService = await db.query('SELECT id FROM sovico_services WHERE id = $1', [id]);
    if (existingService.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Soft delete
    await db.query('UPDATE sovico_services SET is_active = false, updated_at = NOW() WHERE id = $1', [id]);

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get packages
router.get('/packages', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isActive = null } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (isActive !== null) {
      whereClause += ` AND is_active = $${paramIndex}`;
      queryParams.push(isActive === 'true');
      paramIndex++;
    }

    const packagesQuery = `
      SELECT 
        p.*,
        array_agg(s.name) as service_names
      FROM sovico_packages p
      LEFT JOIN sovico_services s ON s.id = ANY(string_to_array(p.services::text, ',')::uuid[])
      WHERE ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(parseInt(limit), offset);
    const packagesResult = await db.query(packagesQuery, queryParams);

    res.json({
      packages: packagesResult.rows
    });
  } catch (error) {
    next(error);
  }
});

// Create package
router.post('/packages', async (req, res, next) => {
  try {
    const { error, value } = packageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const insertQuery = `
      INSERT INTO sovico_packages (
        name, description, services, price, duration, highlights, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await db.query(insertQuery, [
      value.name,
      value.description,
      JSON.stringify(value.services),
      JSON.stringify(value.price),
      value.duration,
      JSON.stringify(value.highlights),
      value.isActive
    ]);

    res.status(201).json({
      message: 'Package created successfully',
      package: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Toggle service featured status
router.patch('/services/:id/featured', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      UPDATE sovico_services 
      SET is_featured = NOT is_featured, updated_at = NOW() 
      WHERE id = $1 
      RETURNING is_featured
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({
      message: 'Featured status updated successfully',
      isFeatured: result.rows[0].is_featured
    });
  } catch (error) {
    next(error);
  }
});

// Get service bookings
router.get('/services/:id/bookings', async (req, res, next) => {
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
      WHERE t.service_type = 'sovico' 
      AND t.service_reference_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const bookingsResult = await db.query(bookingsQuery, [id, limit, offset]);

    res.json({
      bookings: bookingsResult.rows
    });
  } catch (error) {
    next(error);
  }
});

// Get sales report
router.get('/sales-report', async (req, res, next) => {
  try {
    const { startDate, endDate, category, groupBy = 'day' } = req.query;

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

    if (category) {
      dateFilter += ` AND s.category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    const salesQuery = `
      SELECT 
        DATE_TRUNC('${groupBy}', t.created_at) as period,
        s.category,
        COUNT(*) as bookings_count,
        SUM(t.amount) as total_revenue,
        AVG(t.amount) as avg_booking_value
      FROM transactions t
      JOIN sovico_services s ON t.service_reference_id = s.id
      WHERE t.service_type = 'sovico'
      ${dateFilter}
      GROUP BY DATE_TRUNC('${groupBy}', t.created_at), s.category
      ORDER BY period DESC, total_revenue DESC
    `;

    const salesResult = await db.query(salesQuery, queryParams);

    res.json({
      sales: salesResult.rows
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


