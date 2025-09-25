# ATHENA Platform - Super-App Micro-Economy Ecosystem

ATHENA is a comprehensive super-app platform for Sovico Group that transforms traditional reward points into tradable SOV-Tokens using blockchain technology. The platform provides a unified interface for booking flights (Vietjet), banking services (HDBank), resort accommodations, and insurance products, all while earning and trading SOV-Tokens in a P2P marketplace.

## 🏗️ Architecture Overview

### Core Pillars
1. **Blockchain Integration** - Hyperledger Fabric-based SOV-Token system
2. **Super-App Interface** - React Native cross-platform mobile application
3. **Unified Commerce** - Single cart checkout across multiple services
4. **P2P Marketplace** - Token trading with 1.5% transaction fees

### Tech Stack
- **Backend**: Node.js, Express.js (Monolithic architecture)
- **Database**: PostgreSQL with structured transaction data
- **Blockchain**: Hyperledger Fabric with Solidity-style smart contracts
- **Frontend**: React Native with React Navigation
- **Real-time**: Socket.IO for live updates
- **Authentication**: JWT-based with secure token management

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- React Native development environment
- Android Studio or Xcode for mobile development

### Backend Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Database Configuration**
```bash
# Create PostgreSQL database
createdb athena_db

# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=athena_db
export DB_USER=athena_user
export DB_PASSWORD=athena_password
export JWT_SECRET=your_super_secret_key_change_in_production
```

3. **Initialize Database**
```bash
npm run setup-db
```

4. **Start Backend Server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend server will start on `http://localhost:3000`

### Frontend Setup

1. **Navigate to Frontend Directory**
```bash
cd frontend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Install iOS Dependencies** (iOS only)
```bash
cd ios && pod install && cd ..
```

4. **Start Metro Bundler**
```bash
npm start
```

5. **Run on Device/Simulator**
```bash
# Android
npm run android

# iOS
npm run ios
```

### Blockchain Setup

1. **Initialize Hyperledger Fabric Network** (Simulated)
```bash
npm run setup-blockchain
```

Note: The current implementation includes a blockchain service simulator. In production, this would connect to a real Hyperledger Fabric network.

## 📱 Key Features

### 🔐 Authentication & User Management
- JWT-based secure authentication
- User profile management
- ATHENA Prime subscription (1.5x token multiplier)
- Password reset and security features

### 💰 SOV-Token System
- **Earning Rate**: 1 SOV-Token per 10,000 VND spent
- **ATHENA Prime Bonus**: 1.5x earning multiplier
- **Service Bonuses**: Resort bookings (1.2x), Insurance (1.1x)
- **Blockchain Security**: All transactions recorded on Hyperledger Fabric

### 🛒 Unified Shopping Experience
- **Multi-Service Cart**: Add items from different services
- **Single Checkout**: Pay once for flights, hotels, insurance
- **Real-time Token Calculation**: See tokens earned before purchase
- **Order Tracking**: Monitor all bookings in one place

### 📈 P2P Marketplace
- **Buy/Sell Orders**: Create limit orders for SOV-Tokens
- **Automatic Matching**: Smart order execution system
- **Transaction Fees**: 1.5% platform fee on all trades
- **Real-time Updates**: Live order book and trade notifications

### 🏢 Service Integrations

#### ✈️ Vietjet Airlines
- Flight search and booking
- Real-time availability and pricing
- Passenger management
- Booking confirmations and references

#### 🏦 HDBank Services
- Savings accounts with competitive rates
- Credit card applications
- Investment products
- Digital banking integration

#### 🏨 Resort Bookings
- Hotel and resort search
- Date-based availability
- Room type selection
- Special requests handling

#### 🛡️ Insurance Products
- Travel insurance policies
- Health insurance coverage
- Premium calculations
- Policy management

## 🔧 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    - User registration
POST /api/auth/login       - User login
GET  /api/auth/verify      - Token verification
POST /api/auth/refresh     - Token refresh
```

### Token Management
```
GET  /api/tokens/balance           - Get user token balance
GET  /api/tokens/transactions      - Transaction history
POST /api/tokens/calculate-earning - Calculate tokens for purchase
POST /api/tokens/award            - Award tokens (internal)
POST /api/tokens/redeem           - Redeem tokens for rewards
```

### Marketplace
```
GET  /api/marketplace/overview     - Market statistics
GET  /api/marketplace/orderbook    - Buy/sell orders
POST /api/marketplace/orders       - Create new order
GET  /api/marketplace/my-orders    - User's orders
DELETE /api/marketplace/orders/:id - Cancel order
GET  /api/marketplace/trades       - Trading history
```

### Shopping Cart
```
GET    /api/cart           - Get cart contents
POST   /api/cart/items     - Add item to cart
PUT    /api/cart/items/:id - Update cart item
DELETE /api/cart/items/:id - Remove from cart
DELETE /api/cart           - Clear cart
POST   /api/cart/checkout  - Unified checkout
```

### Services
```
GET  /api/services/vietjet/flights    - Search flights
POST /api/services/vietjet/book       - Book flight
GET  /api/services/hdbank/products    - Banking products
POST /api/services/hdbank/apply       - Apply for product
GET  /api/services/resorts            - Search resorts
POST /api/services/resorts/book       - Book resort
GET  /api/services/insurance          - Insurance products
POST /api/services/insurance/purchase - Purchase insurance
```

## 🎯 Sample User Journeys

### Smart Vacation Journey
1. **Search & Select**: Find Vietjet flight from Hanoi to Da Nang
2. **Add Services**: Add resort booking and travel insurance to cart
3. **Review Cart**: See total cost and estimated SOV-Tokens (150 tokens)
4. **Checkout**: Single payment for all services
5. **Earn Tokens**: Receive 150 SOV-Tokens automatically
6. **Confirmation**: Get booking references for all services

### Monetizing Loyalty Journey
1. **Check Balance**: View 2,500 SOV-Tokens in wallet
2. **Market Analysis**: Check current token price (8,500 VND each)
3. **Create Sell Order**: List 1,000 tokens at 8,600 VND each
4. **Order Execution**: Automatic matching with buyer
5. **Receive Payment**: 8,471,000 VND after 1.5% platform fee
6. **Bank Transfer**: Transfer proceeds to linked HDBank account

## 💾 Database Schema

### Core Tables
- **users**: User accounts and profiles
- **token_balances**: SOV-Token balances and statistics
- **transactions**: All token earning/spending records
- **marketplace_orders**: Buy/sell orders
- **marketplace_trades**: Completed trades
- **shopping_cart**: Multi-service shopping cart
- **service_bookings**: All service reservations

### Key Relationships
- Users have one token balance
- Users can have multiple transactions
- Users can have multiple marketplace orders
- Orders can result in multiple trades

## 🔒 Security Features

### Authentication Security
- JWT tokens with 7-day expiration
- Bcrypt password hashing (12 rounds)
- Secure token storage in mobile app
- Automatic token refresh mechanism

### API Security
- Helmet.js for HTTP headers
- CORS protection
- Request rate limiting
- Input validation with Joi
- SQL injection prevention

### Blockchain Security
- Hyperledger Fabric permissioned network
- Smart contract validation
- Transaction immutability
- Multi-signature requirements

## 📊 Monitoring & Analytics

### Logging
- Winston-based structured logging
- Error tracking and alerting
- Performance monitoring
- User activity analytics

### Real-time Features
- Socket.IO for live updates
- Push notifications for trades
- Real-time order book updates
- Instant token earning notifications

## 🧪 Testing

### Run Tests
```bash
# Backend unit tests
npm test

# Frontend tests
cd frontend && npm test

# Integration tests
npm run test:integration
```

### Test Coverage
- Authentication flows
- Token earning/spending
- Marketplace operations
- Cart and checkout
- Service integrations

## 🚀 Deployment

### Production Environment
```bash
# Set production environment variables
export NODE_ENV=production
export DB_HOST=your-production-db-host
export JWT_SECRET=your-production-jwt-secret

# Start production server
npm start
```

### Mobile App Deployment
```bash
# Android build
cd frontend && npx react-native build-android

# iOS build
cd frontend && npx react-native build-ios
```

## 🔄 Revenue Streams

1. **Marketplace Fees**: 1.5% on all SOV-Token trades
2. **ATHENA Prime**: Premium subscription with enhanced benefits
3. **Service Commissions**: Revenue sharing with partner services
4. **Premium Features**: Advanced analytics and priority support

## 🎯 Future Enhancements

### Phase 2 Features
- AI-powered spending insights
- Dynamic pricing algorithms
- Advanced portfolio management
- Cross-border token transfers

### Additional Services
- Food delivery integration
- E-commerce marketplace
- Ride-sharing services
- Utility bill payments

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For technical support or questions:
- Email: support@athena-platform.com
- Documentation: https://docs.athena-platform.com
- Issue Tracker: https://github.com/sovico-group/athena-platform/issues

## 🏢 About Sovico Group

ATHENA is developed by Sovico Group, Vietnam's leading conglomerate with businesses spanning aviation (Vietjet), banking (HDBank), hospitality, and insurance sectors.

---

**Built with ❤️ by the Sovico Group Technology Team**

#   A T H E N A - H D _ H A C K A T H O N  
 