const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const { adminAuthMiddleware } = require('../middleware/auth');

// Mock data for when database is not available
const mockProducts = [
  {
    id: '1',
    name: 'HDBank Platinum Credit Card',
    type: 'cards',
    description: 'Thẻ tín dụng cao cấp với nhiều ưu đãi',
    features: ['Cashback 2%', 'Miễn phí rút tiền ATM', 'Bảo hiểm du lịch', 'Ưu đãi dining'],
    annual_fee: { fiat: 2000000, sovToken: 200 },
    credit_limit: { min: 50000000, max: 500000000 },
    applicable_cashback: 2.0,
    applicable_rewards: 100,
    is_active: true,
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'HDBank Home Loan',
    type: 'loans',
    description: 'Vay mua nhà với lãi suất ưu đãi',
    features: ['Lãi suất thả nổi', 'Thời hạn vay linh hoạt', 'Không cần thế chấp bổ sung'],
    interest_rate: { min: 8.5, max: 12.0 },
    loan_amount: { min: 500000000, max: 10000000000 },
    term: { min: 120, max: 300 },
    is_active: true,
    created_at: '2024-01-10T00:00:00Z'
  },
  {
    id: '3',
    name: 'HDBank Savings Plus',
    type: 'savings',
    description: 'Tiết kiệm với lãi suất cao',
    features: ['Lãi suất cạnh tranh', 'Gửi góp linh hoạt', 'Tặng SOV token'],
    expected_returns: { low: 6.5, high: 8.5 },
    min_investment: 10000000,
    is_active: true,
    created_at: '2024-01-05T00:00:00Z'
  }
];

const router = express.Router();

// In-memory storage for CRUD operations when database is not available
let inMemoryProducts = [...mockProducts];
let nextId = 4;

// Validation schemas
const productSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid('cards', 'loans', 'savings', 'insurance').required(),
  description: Joi.string().required(),
  features: Joi.array().items(Joi.string()).required(),
  isActive: Joi.boolean().optional().default(true),
  
  // Card specific fields
  annualFee: Joi.object({
    fiat: Joi.number().min(0),
    sovToken: Joi.number().min(0)
  }).optional(),
  creditLimit: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(0)
  }).optional(),
  applicableCashback: Joi.number().min(0).max(100).optional(),
  applicableRewards: Joi.number().min(0).optional(),
  
  // Loan specific fields
  interestRate: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(0)
  }).optional(),
  loanAmount: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(0)
  }).optional(),
  term: Joi.object({
    min: Joi.number().min(1),
    max: Joi.number().min(1)
  }).optional(),
  
  // Investment specific fields
  minInvestment: Joi.number().min(0).optional(),
  expectedReturns: Joi.object({
    low: Joi.number().min(0),
    high: Joi.number().min(0)
  }).optional(),
  riskLevel: Joi.string().valid('low', 'medium', 'high').optional(),
  
  // Insurance specific fields
  coverage: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(0)
  }).optional(),
  premium: Joi.object({
    monthly: Joi.number().min(0),
    yearly: Joi.number().min(0)
  }).optional()
});

// Apply admin middleware
router.use(adminAuthMiddleware);

// Get all HD Bank products
router.get('/', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type = null, 
      isActive = null,
      search = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build WHERE clause
    let whereClause = '1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (type) {
      whereClause += ` AND type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }

    if (isActive !== null) {
      whereClause += ` AND is_active = $${paramIndex}`;
      queryParams.push(isActive === 'true');
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex + 1})`;
      queryParams.push(`%${search}%`, `%${search}%`);
      paramIndex += 2;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM hdbank_products WHERE ${whereClause}`;
    const countResult = await db.query(countQuery, queryParams);
    const totalProducts = parseInt(countResult.rows[0].count);

    // Get products (use mock data if database fails)
    let products = [];
    try {
      const productsQuery = `
        SELECT * FROM hdbank_products 
        WHERE ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      queryParams.push(parseInt(limit), offset);
      const productsResult = await db.query(productsQuery, queryParams);
      products = productsResult.rows;
    } catch (error) {
      console.log('Database not available, using mock data:', error.message);
      // Use in-memory data with filtering
      products = inMemoryProducts.filter(product => {
        const matchesSearch = search ? (product.name.toLowerCase().includes(search.toLowerCase()) ||
                                      product.description.toLowerCase().includes(search.toLowerCase())) : true;
        const matchesType = type ? product.type === type : true;
        const matchesActive = isActive !== null ? product.is_active === (isActive === 'true') : true;
        return matchesSearch && matchesType && matchesActive;
      }).slice(offset, offset + parseInt(limit));
      
      // Update total count for in-memory data
      totalProducts = inMemoryProducts.length;
    }

    // Get statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN type = 'cards' THEN 1 END) as cards_count,
        COUNT(CASE WHEN type = 'loans' THEN 1 END) as loans_count,
        COUNT(CASE WHEN type = 'savings' THEN 1 END) as savings_count,
        COUNT(CASE WHEN type = 'insurance' THEN 1 END) as insurance_count,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_products
      FROM hdbank_products
    `;
    const statsResult = await db.query(statsQuery);

    res.json({
      products: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalProducts,
        totalPages: Math.ceil(totalProducts / limit)
      },
      statistics: statsResult.rows?.[0] || {
        total_products: inMemoryProducts.length,
        cards_count: inMemoryProducts.filter(p => p.type === 'cards').length,
        loans_count: inMemoryProducts.filter(p => p.type === 'loans').length,
        savings_count: inMemoryProducts.filter(p => p.type === 'savings').length,
        insurance_count: inMemoryProducts.filter(p => p.type === 'insurance').length,
        active_products: inMemoryProducts.filter(p => p.is_active).length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const productResult = await db.query('SELECT * FROM hdbank_products WHERE id = $1', [id]);
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get sales statistics for this product
    const salesQuery = `
      SELECT 
        COUNT(*) as total_sales,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_order_value
      FROM transactions 
      WHERE service_type = 'hdbank' 
      AND service_reference_id = $1
    `;
    const salesResult = await db.query(salesQuery, [id]);

    res.json({
      product: productResult.rows[0],
      sales: salesResult.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Create new product
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    try {
      // Try database first
      const insertQuery = `
        INSERT INTO hdbank_products (
          name, type, description, features, is_active,
          annual_fee, credit_limit, applicable_cashback, applicable_rewards,
          interest_rate, loan_amount, term, min_investment, expected_returns,
          risk_level, coverage, premium
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `;

      const result = await db.query(insertQuery, [
        value.name,
        value.type,
        value.description,
        JSON.stringify(value.features),
        value.isActive,
        value.annualFee ? JSON.stringify(value.annualFee) : null,
        value.creditLimit ? JSON.stringify(value.creditLimit) : null,
        value.applicableCashback || null,
        value.applicableRewards || null,
        value.interestRate ? JSON.stringify(value.interestRate) : null,
        value.loanAmount ? JSON.stringify(value.loanAmount) : null,
        value.term ? JSON.stringify(value.term) : null,
        value.minInvestment || null,
        value.expectedReturns ? JSON.stringify(value.expectedReturns) : null,
        value.riskLevel || null,
        value.coverage ? JSON.stringify(value.coverage) : null,
        value.premium ? JSON.stringify(value.premium) : null
      ]);

      res.status(201).json({
        message: 'Product created successfully',
        product: result.rows[0]
      });
    } catch (dbError) {
      console.log('Database not available, using in-memory storage:', dbError.message);
      
      // Use in-memory storage
      const newProduct = {
        id: (nextId++).toString(),
        name: value.name,
        type: value.type,
        description: value.description,
        features: value.features,
        is_active: value.isActive,
        annual_fee: value.annualFee,
        credit_limit: value.creditLimit,
        applicable_cashback: value.applicableCashback,
        applicable_rewards: value.applicableRewards,
        interest_rate: value.interestRate,
        loan_amount: value.loanAmount,
        term: value.term,
        min_investment: value.minInvestment,
        expected_returns: value.expectedReturns,
        risk_level: value.riskLevel,
        coverage: value.coverage,
        premium: value.premium,
        created_at: new Date().toISOString()
      };

      inMemoryProducts.push(newProduct);

      res.status(201).json({
        message: 'Product created successfully (in-memory)',
        product: newProduct
      });
    }
  } catch (error) {
    next(error);
  }
});

// Update product
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = productSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if product exists
    const existingProduct = await db.query('SELECT id FROM hdbank_products WHERE id = $1', [id]);
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updateQuery = `
      UPDATE hdbank_products SET
        name = $1, type = $2, description = $3, features = $4, is_active = $5,
        annual_fee = $6, credit_limit = $7, applicable_cashback = $8, applicable_rewards = $9,
        interest_rate = $10, loan_amount = $11, term = $12, min_investment = $13,
        expected_returns = $14, risk_level = $15, coverage = $16, premium = $17,
        updated_at = NOW()
      WHERE id = $18
      RETURNING *
    `;

    const result = await db.query(updateQuery, [
      value.name,
      value.type,
      value.description,
      JSON.stringify(value.features),
      value.isActive,
      value.annualFee ? JSON.stringify(value.annualFee) : null,
      value.creditLimit ? JSON.stringify(value.creditLimit) : null,
      value.applicableCashback || null,
      value.applicableRewards || null,
      value.interestRate ? JSON.stringify(value.interestRate) : null,
      value.loanAmount ? JSON.stringify(value.loanAmount) : null,
      value.term ? JSON.stringify(value.term) : null,
      value.minInvestment || null,
      value.expectedReturns ? JSON.stringify(value.expectedReturns) : null,
      value.riskLevel || null,
      value.coverage ? JSON.stringify(value.coverage) : null,
      value.premium ? JSON.stringify(value.premium) : null,
      id
    ]);

    res.json({
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Delete product
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    try {
      // Try database first
      const existingProduct = await db.query('SELECT id FROM hdbank_products WHERE id = $1', [id]);
      if (existingProduct.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Soft delete by setting is_active = false
      await db.query('UPDATE hdbank_products SET is_active = false, updated_at = NOW() WHERE id = $1', [id]);

      res.json({ message: 'Product deleted successfully' });
    } catch (dbError) {
      console.log('Database not available, using in-memory storage:', dbError.message);
      
      // Use in-memory storage
      const productIndex = inMemoryProducts.findIndex(p => p.id === id);
      if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Remove from in-memory storage
      inMemoryProducts.splice(productIndex, 1);

      res.json({ message: 'Product deleted successfully (in-memory)' });
    }
  } catch (error) {
    next(error);
  }
});

// Toggle product status
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      UPDATE hdbank_products 
      SET is_active = NOT is_active, updated_at = NOW() 
      WHERE id = $1 
      RETURNING is_active
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product status updated successfully',
      isActive: result.rows[0].is_active
    });
  } catch (error) {
    next(error);
  }
});

// Get product sales report
router.get('/:id/sales', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, groupBy = 'day' } = req.query;

    let dateFilter = '';
    const queryParams = [id];
    let paramIndex = 2;

    if (startDate) {
      dateFilter += ` AND created_at >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      dateFilter += ` AND created_at <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    const salesQuery = `
      SELECT 
        DATE_TRUNC('${groupBy}', created_at) as period,
        COUNT(*) as sales_count,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_order_value
      FROM transactions 
      WHERE service_type = 'hdbank' 
      AND service_reference_id = $1
      ${dateFilter}
      GROUP BY DATE_TRUNC('${groupBy}', created_at)
      ORDER BY period DESC
    `;

    const salesResult = await db.query(salesQuery, queryParams);

    res.json({
      sales: salesResult.rows,
      summary: {
        totalSales: salesResult.rows.reduce((sum, row) => sum + parseInt(row.sales_count), 0),
        totalRevenue: salesResult.rows.reduce((sum, row) => sum + parseFloat(row.total_revenue || 0), 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
