const request = require('supertest');
const app = require('../backend/server');
const db = require('../backend/config/database');

describe('ATHENA Platform API Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Wait for database connection
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    // Clean up database connections
    await db.pool.end();
  });

  describe('Authentication', () => {
    test('POST /api/auth/register - should create new user', async () => {
      const userData = {
        email: 'test@athena.com',
        password: 'test123456',
        fullName: 'Test User',
        phone: '+84901234567'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.fullName).toBe(userData.fullName);

      // Store for later tests
      authToken = response.body.token;
      userId = response.body.user.id;
    });

    test('POST /api/auth/login - should login existing user', async () => {
      const loginData = {
        email: 'test@athena.com',
        password: 'test123456'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(loginData.email);
    });

    test('GET /api/auth/verify - should verify valid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.valid).toBe(true);
      expect(response.body.user).toHaveProperty('id');
    });

    test('POST /api/auth/login - should reject invalid credentials', async () => {
      const loginData = {
        email: 'test@athena.com',
        password: 'wrongpassword'
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
    });
  });

  describe('Token Management', () => {
    test('GET /api/tokens/balance - should get user token balance', async () => {
      const response = await request(app)
        .get('/api/tokens/balance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('balance');
      expect(response.body).toHaveProperty('totalEarned');
      expect(response.body).toHaveProperty('totalSpent');
      expect(typeof response.body.balance).toBe('number');
    });

    test('POST /api/tokens/calculate-earning - should calculate tokens for purchase', async () => {
      const purchaseData = {
        vndAmount: 100000,
        serviceType: 'vietjet'
      };

      const response = await request(app)
        .post('/api/tokens/calculate-earning')
        .set('Authorization', `Bearer ${authToken}`)
        .send(purchaseData)
        .expect(200);

      expect(response.body).toHaveProperty('tokensEarned');
      expect(response.body).toHaveProperty('multiplier');
      expect(response.body.tokensEarned).toBe(10); // 100,000 VND = 10 tokens
    });

    test('POST /api/tokens/award - should award tokens for purchase', async () => {
      const awardData = {
        vndAmount: 50000,
        serviceType: 'vietjet',
        serviceReferenceId: 'VJ-TEST-001',
        description: 'Test flight booking'
      };

      const response = await request(app)
        .post('/api/tokens/award')
        .set('Authorization', `Bearer ${authToken}`)
        .send(awardData)
        .expect(200);

      expect(response.body).toHaveProperty('tokensEarned');
      expect(response.body).toHaveProperty('transactionId');
      expect(response.body.tokensEarned).toBe(5); // 50,000 VND = 5 tokens
    });

    test('GET /api/tokens/transactions - should get transaction history', async () => {
      const response = await request(app)
        .get('/api/tokens/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.transactions)).toBe(true);
    });
  });

  describe('Shopping Cart', () => {
    let cartItemId;

    test('GET /api/cart - should get empty cart initially', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('summary');
      expect(response.body.items).toHaveLength(0);
    });

    test('POST /api/cart/items - should add item to cart', async () => {
      const cartItem = {
        serviceType: 'vietjet',
        serviceItemId: 'VJ001',
        quantity: 1,
        price: 1500000,
        metadata: {
          route: 'HAN-SGN',
          date: '2024-01-15'
        }
      };

      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cartItem)
        .expect(201);

      expect(response.body).toHaveProperty('item');
      expect(response.body.item.serviceType).toBe(cartItem.serviceType);
      cartItemId = response.body.item.id;
    });

    test('GET /api/cart - should get cart with items', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.summary.totalItems).toBe(1);
      expect(response.body.summary.totalAmount).toBe(1500000);
    });

    test('PUT /api/cart/items/:id - should update cart item', async () => {
      const updateData = { quantity: 2 };

      const response = await request(app)
        .put(`/api/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.item.quantity).toBe(2);
    });

    test('DELETE /api/cart/items/:id - should remove item from cart', async () => {
      await request(app)
        .delete(`/api/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Marketplace', () => {
    test('GET /api/marketplace/overview - should get marketplace overview', async () => {
      const response = await request(app)
        .get('/api/marketplace/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('orderBook');
      expect(response.body).toHaveProperty('recentTrades');
      expect(response.body).toHaveProperty('volume24h');
    });

    test('GET /api/marketplace/orderbook - should get order book', async () => {
      const response = await request(app)
        .get('/api/marketplace/orderbook')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('buyOrders');
      expect(response.body).toHaveProperty('sellOrders');
      expect(Array.isArray(response.body.buyOrders)).toBe(true);
      expect(Array.isArray(response.body.sellOrders)).toBe(true);
    });

    test('POST /api/marketplace/orders - should create marketplace order', async () => {
      // First, ensure user has tokens to sell
      await request(app)
        .post('/api/tokens/award')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vndAmount: 100000,
          serviceType: 'test',
          description: 'Test tokens for marketplace'
        });

      const orderData = {
        orderType: 'sell',
        amount: 5,
        pricePerToken: 8500
      };

      const response = await request(app)
        .post('/api/marketplace/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('orderId');
      expect(response.body.orderType).toBe('sell');
      expect(response.body.amount).toBe(5);
    });

    test('GET /api/marketplace/my-orders - should get user orders', async () => {
      const response = await request(app)
        .get('/api/marketplace/my-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('orders');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.orders)).toBe(true);
    });
  });

  describe('Services', () => {
    test('GET /api/services/vietjet/flights - should search flights', async () => {
      const response = await request(app)
        .get('/api/services/vietjet/flights')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          from: 'HAN',
          to: 'SGN',
          date: '2024-01-15',
          passengers: 1
        })
        .expect(200);

      expect(response.body).toHaveProperty('flights');
      expect(response.body).toHaveProperty('searchCriteria');
      expect(Array.isArray(response.body.flights)).toBe(true);
    });

    test('GET /api/services/hdbank/products - should get banking products', async () => {
      const response = await request(app)
        .get('/api/services/hdbank/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    test('GET /api/services/resorts - should search resorts', async () => {
      const response = await request(app)
        .get('/api/services/resorts')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          location: 'Phu Quoc',
          checkIn: '2024-01-15',
          checkOut: '2024-01-17',
          guests: 2
        })
        .expect(200);

      expect(response.body).toHaveProperty('resorts');
      expect(Array.isArray(response.body.resorts)).toBe(true);
    });

    test('GET /api/services/insurance - should get insurance products', async () => {
      const response = await request(app)
        .get('/api/services/insurance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
    });
  });

  describe('User Management', () => {
    test('GET /api/users/profile - should get user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('statistics');
      expect(response.body.user.email).toBe('test@athena.com');
    });

    test('PUT /api/users/profile - should update user profile', async () => {
      const updateData = {
        fullName: 'Updated Test User',
        phone: '+84987654321'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.user.fullName).toBe(updateData.fullName);
      expect(response.body.user.phone).toBe(updateData.phone);
    });
  });

  describe('Error Handling', () => {
    test('should return 401 for requests without auth token', async () => {
      await request(app)
        .get('/api/tokens/balance')
        .expect(401);
    });

    test('should return 401 for requests with invalid auth token', async () => {
      await request(app)
        .get('/api/tokens/balance')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    test('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/non-existent-route')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    test('should return 400 for invalid input data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123' // too short
      };

      await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('Health Check', () => {
    test('GET /health - should return server health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.status).toBe('healthy');
    });
  });
});

// Integration tests for complex workflows
describe('Integration Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Create test user
    const userData = {
      email: 'integration@athena.com',
      password: 'integration123',
      fullName: 'Integration Test User'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = response.body.token;
    userId = response.body.user.id;
  });

  test('Complete Smart Vacation Journey', async () => {
    // 1. Search for flights
    const flightResponse = await request(app)
      .get('/api/services/vietjet/flights')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ from: 'HAN', to: 'DAD' });

    expect(flightResponse.status).toBe(200);
    const flight = flightResponse.body.flights[0];

    // 2. Add flight to cart
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        serviceType: 'vietjet',
        serviceItemId: flight.id,
        quantity: 1,
        price: flight.price
      })
      .expect(201);

    // 3. Search and add resort
    const resortResponse = await request(app)
      .get('/api/services/resorts')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ location: 'Da Nang' });

    const resort = resortResponse.body.resorts[0];
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        serviceType: 'resort',
        serviceItemId: resort.id,
        quantity: 1,
        price: resort.totalPrice
      });

    // 4. Add insurance
    const insuranceResponse = await request(app)
      .get('/api/services/insurance')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ type: 'travel_insurance' });

    const insurance = insuranceResponse.body.products[0];
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        serviceType: 'insurance',
        serviceItemId: insurance.id,
        quantity: 1,
        price: insurance.premium
      });

    // 5. Checkout unified cart
    const checkoutResponse = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        paymentMethod: 'credit_card',
        billingAddress: {
          street: '123 Test Street',
          city: 'Hanoi',
          country: 'Vietnam'
        }
      })
      .expect(200);

    expect(checkoutResponse.body.checkout).toHaveProperty('tokensEarned');
    expect(checkoutResponse.body.checkout).toHaveProperty('bookings');
    expect(checkoutResponse.body.checkout.tokensEarned).toBeGreaterThan(0);
  });

  test('Complete Marketplace Trading Journey', async () => {
    // 1. Award some tokens first
    await request(app)
      .post('/api/tokens/award')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        vndAmount: 1000000,
        serviceType: 'test',
        description: 'Test tokens for trading'
      });

    // 2. Check token balance
    const balanceResponse = await request(app)
      .get('/api/tokens/balance')
      .set('Authorization', `Bearer ${authToken}`);

    expect(balanceResponse.body.balance).toBeGreaterThanOrEqual(100);

    // 3. Create sell order
    const sellOrderResponse = await request(app)
      .post('/api/marketplace/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        orderType: 'sell',
        amount: 50,
        pricePerToken: 8500
      })
      .expect(201);

    const orderId = sellOrderResponse.body.orderId;

    // 4. Check order in user's orders
    const ordersResponse = await request(app)
      .get('/api/marketplace/my-orders')
      .set('Authorization', `Bearer ${authToken}`);

    expect(ordersResponse.body.orders).toContainEqual(
      expect.objectContaining({
        id: orderId,
        orderType: 'sell'
      })
    );

    // 5. Cancel the order
    await request(app)
      .delete(`/api/marketplace/orders/${orderId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });
});

