const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get transaction analytics/dashboard data
router.get('/analytics', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const period = req.query.period || '30'; // days
    
    // Get transaction summary for the period
    const summaryResult = await db.query(`
      SELECT 
        type,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount
      FROM transactions 
      WHERE user_id = $1 
        AND created_at > NOW() - INTERVAL '${period} days'
      GROUP BY type
    `, [userId]);

    // Get daily transaction trends
    const trendsResult = await db.query(`
      SELECT 
        DATE(created_at) as date,
        type,
        COUNT(*) as count,
        SUM(amount) as amount
      FROM transactions 
      WHERE user_id = $1 
        AND created_at > NOW() - INTERVAL '${period} days'
      GROUP BY DATE(created_at), type
      ORDER BY date DESC
    `, [userId]);

    // Get service breakdown
    const serviceResult = await db.query(`
      SELECT 
        service_type,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount
      FROM transactions 
      WHERE user_id = $1 
        AND service_type IS NOT NULL
        AND created_at > NOW() - INTERVAL '${period} days'
      GROUP BY service_type
    `, [userId]);

    // Get largest transactions
    const largestResult = await db.query(`
      SELECT 
        id,
        type,
        amount,
        description,
        service_type,
        created_at
      FROM transactions 
      WHERE user_id = $1 
        AND created_at > NOW() - INTERVAL '${period} days'
      ORDER BY amount DESC
      LIMIT 5
    `, [userId]);

    // Calculate totals
    let totalEarned = 0;
    let totalSpent = 0;
    let totalTransactions = 0;

    const summary = {};
    summaryResult.rows.forEach(row => {
      const amount = parseFloat(row.total_amount);
      summary[row.type] = {
        count: parseInt(row.transaction_count),
        total: amount,
        average: parseFloat(row.avg_amount)
      };
      
      totalTransactions += parseInt(row.transaction_count);
      
      if (row.type === 'earn') {
        totalEarned += amount;
      } else if (['spend', 'marketplace_buy'].includes(row.type)) {
        totalSpent += amount;
      }
    });

    res.json({
      period: `${period} days`,
      summary: {
        totalTransactions,
        totalEarned,
        totalSpent,
        netChange: totalEarned - totalSpent,
        byType: summary
      },
      trends: trendsResult.rows.map(row => ({
        date: row.date,
        type: row.type,
        count: parseInt(row.count),
        amount: parseFloat(row.amount)
      })),
      serviceBreakdown: serviceResult.rows.map(row => ({
        serviceType: row.service_type,
        transactionCount: parseInt(row.transaction_count),
        totalAmount: parseFloat(row.total_amount)
      })),
      largestTransactions: largestResult.rows.map(row => ({
        id: row.id,
        type: row.type,
        amount: parseFloat(row.amount),
        description: row.description,
        serviceType: row.service_type,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Export transaction data (CSV format)
router.get('/export', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;
    const format = req.query.format || 'csv';

    let query = `
      SELECT 
        id,
        type,
        amount,
        description,
        service_type,
        service_reference_id,
        status,
        created_at
      FROM transactions 
      WHERE user_id = $1
    `;
    
    const params = [userId];
    
    if (startDate) {
      query += ` AND created_at >= $${params.length + 1}`;
      params.push(startDate);
    }
    
    if (endDate) {
      query += ` AND created_at <= $${params.length + 1}`;
      params.push(endDate);
    }
    
    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);

    if (format === 'csv') {
      // Generate CSV content
      const csvHeaders = [
        'ID', 'Type', 'Amount', 'Description', 'Service Type', 
        'Service Reference', 'Status', 'Date'
      ].join(',');
      
      const csvRows = result.rows.map(row => [
        row.id,
        row.type,
        row.amount,
        `"${row.description || ''}"`,
        row.service_type || '',
        row.service_reference_id || '',
        row.status,
        row.created_at
      ].join(','));

      const csvContent = [csvHeaders, ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=athena-transactions.csv');
      res.send(csvContent);
    } else {
      // Return JSON format
      res.json({
        transactions: result.rows.map(row => ({
          id: row.id,
          type: row.type,
          amount: parseFloat(row.amount),
          description: row.description,
          serviceType: row.service_type,
          serviceReferenceId: row.service_reference_id,
          status: row.status,
          createdAt: row.created_at
        })),
        exportInfo: {
          totalRecords: result.rows.length,
          startDate,
          endDate,
          exportedAt: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// Get transaction details by ID
router.get('/:transactionId', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { transactionId } = req.params;

    const result = await db.query(`
      SELECT 
        t.*,
        CASE 
          WHEN t.service_type = 'vietjet' THEN 'Flight Booking'
          WHEN t.service_type = 'hdbank' THEN 'Banking Service'
          WHEN t.service_type = 'resort' THEN 'Resort Booking'
          WHEN t.service_type = 'insurance' THEN 'Insurance Policy'
          WHEN t.service_type = 'unified_purchase' THEN 'Unified Cart Purchase'
          ELSE t.service_type
        END as service_display_name
      FROM transactions t
      WHERE t.id = $1 AND t.user_id = $2
    `, [transactionId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = result.rows[0];

    // Get related booking if exists
    let relatedBooking = null;
    if (transaction.service_reference_id) {
      const bookingResult = await db.query(`
        SELECT 
          booking_reference,
          booking_details,
          status as booking_status
        FROM service_bookings 
        WHERE booking_reference = $1
      `, [transaction.service_reference_id]);

      if (bookingResult.rows.length > 0) {
        relatedBooking = bookingResult.rows[0];
      }
    }

    res.json({
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: parseFloat(transaction.amount),
        description: transaction.description,
        serviceType: transaction.service_type,
        serviceDisplayName: transaction.service_display_name,
        serviceReferenceId: transaction.service_reference_id,
        blockchainTxId: transaction.blockchain_tx_id,
        status: transaction.status,
        metadata: transaction.metadata,
        createdAt: transaction.created_at
      },
      relatedBooking
    });
  } catch (error) {
    next(error);
  }
});

// Get spending patterns and insights
router.get('/insights/spending', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get spending by service type
    const spendingByService = await db.query(`
      SELECT 
        service_type,
        COUNT(*) as transaction_count,
        SUM(amount) as total_spent,
        AVG(amount) as avg_transaction
      FROM transactions 
      WHERE user_id = $1 
        AND type IN ('spend', 'marketplace_buy')
        AND service_type IS NOT NULL
        AND created_at > NOW() - INTERVAL '90 days'
      GROUP BY service_type
      ORDER BY total_spent DESC
    `, [userId]);

    // Get monthly spending trend
    const monthlySpending = await db.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(amount) as total_spent,
        COUNT(*) as transaction_count
      FROM transactions 
      WHERE user_id = $1 
        AND type IN ('spend', 'marketplace_buy')
        AND created_at > NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `, [userId]);

    // Get earning efficiency (tokens earned vs VND spent)
    const efficiency = await db.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(CASE WHEN type = 'earn' THEN amount ELSE 0 END) as tokens_earned,
        COUNT(CASE WHEN type = 'earn' THEN 1 END) as earning_transactions
      FROM transactions 
      WHERE user_id = $1 
        AND created_at > NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `, [userId]);

    // Calculate insights
    const totalSpent = spendingByService.rows.reduce((sum, row) => sum + parseFloat(row.total_spent), 0);
    const favoriteService = spendingByService.rows[0]?.service_type || null;
    const avgMonthlySpending = monthlySpending.rows.length > 0 ? 
      monthlySpending.rows.reduce((sum, row) => sum + parseFloat(row.total_spent), 0) / monthlySpending.rows.length : 0;

    res.json({
      spendingByService: spendingByService.rows.map(row => ({
        serviceType: row.service_type,
        transactionCount: parseInt(row.transaction_count),
        totalSpent: parseFloat(row.total_spent),
        avgTransaction: parseFloat(row.avg_transaction),
        percentage: totalSpent > 0 ? (parseFloat(row.total_spent) / totalSpent * 100).toFixed(1) : 0
      })),
      monthlyTrend: monthlySpending.rows.map(row => ({
        month: row.month,
        totalSpent: parseFloat(row.total_spent),
        transactionCount: parseInt(row.transaction_count)
      })),
      earningEfficiency: efficiency.rows.map(row => ({
        month: row.month,
        tokensEarned: parseFloat(row.tokens_earned),
        earningTransactions: parseInt(row.earning_transactions)
      })),
      insights: {
        totalSpent90Days: totalSpent,
        favoriteService,
        avgMonthlySpending: avgMonthlySpending.toFixed(2),
        mostActiveMonth: monthlySpending.rows[0]?.month || null
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

