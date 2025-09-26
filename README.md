# 🚀 ATHENA Platform - Web3 Super-App Ecosystem

## 🌐 Demo Access

**Live Demo:** https://athena-hd-hackathon-ivf3.vercel.app/

**Demo Credentials:**
- **Email:** demo@athena.com
- **Password:** demo123

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

ATHENA is a comprehensive Web3 super-app platform for Sovico Group that transforms traditional reward points into tradable SOV-Tokens using blockchain technology. The platform provides a unified interface for booking flights (Vietjet), banking services (HDBank), resort accommodations, and insurance products, all while earning and trading SOV-Tokens in a P2P marketplace.

### 🌟 Key Highlights

- **Unified Ecosystem**: Single platform for flights, banking, resorts, and insurance
- **SOV Token Economy**: Earn, stake, and trade tokens across all services
- **Web3 Integration**: MetaMask wallet support and blockchain transactions
- **AI-Powered**: Smart recommendations and personalized experiences
- **Cross-Service Rewards**: Earn tokens from every interaction

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Docker (optional, for containerized setup)
- Git

### 1. Clone Repository

```bash
git clone https://github.com/your-org/athena-hd-hackathon.git
cd athena-hd-hackathon
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit environment variables
nano .env
```

### 3. Database Setup

```bash
# Using Docker (Recommended)
docker-compose up -d postgres

# Or install PostgreSQL locally
# Create database
createdb athena_db
```

### 4. Backend Setup

```bash
cd backend
npm install
npm run setup-db
npm run dev
```

### 5. Frontend Setup

```bash
cd web
npm install
npm run dev
```

### 6. Access Application

- **Web Application**: http://localhost:3000
- **API Server**: http://localhost:5000
- **Database**: localhost:5432

## ✨ Features

### 🔐 Authentication & User Management
- Secure JWT-based authentication
- User profile management with avatars
- ATHENA Prime subscription (1.5x token multiplier)
- Multi-factor authentication support

### 💰 SOV Token Ecosystem
- **Earning Rate**: 1 SOV-Token per 10,000 VND spent
- **ATHENA Prime Bonus**: 1.5x earning multiplier
- **Service Bonuses**: Resort bookings (1.2x), Insurance (1.1x)
- **Staking Rewards**: Up to 18.5% APY
- **P2P Trading**: Buy/sell tokens with 1.5% platform fee

### 🛒 Unified Shopping Experience
- **Multi-Service Cart**: Add items from different services
- **Single Checkout**: Pay once for flights, hotels, insurance
- **Real-time Token Calculation**: See tokens earned before purchase
- **Order Tracking**: Monitor all bookings in one place

### 🏢 Service Integrations

#### ✈️ Vietjet Airlines
- Flight search and booking
- Real-time availability and pricing
- Passenger management
- Booking confirmations

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

### 🤖 AI-Powered Features
- Personalized recommendations
- Smart spending insights
- Dynamic pricing optimization
- Predictive analytics

### 📱 Web3 Integration
- MetaMask wallet connection
- Blockchain transaction support
- DeFi protocol integration
- NFT marketplace access

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Blockchain**: Web3.js with Ethereum integration
- **Real-time**: Socket.IO
- **API**: RESTful with OpenAPI documentation

### Frontend
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context + Redux Toolkit
- **Web3**: Ethers.js for blockchain interactions
- **UI Components**: Custom component library
- **Charts**: Chart.js for analytics

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis for session management
- **File Storage**: AWS S3 compatible storage
- **Monitoring**: Winston logging with error tracking

## 📖 Setup Instructions

### Option 1: Docker Setup (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup database
npm run setup-db

# Run migrations
npm run migrate

# Start development server
npm run dev
```

#### Frontend Setup

```bash
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```

#### Database Setup

```bash
# Create database
createdb athena_db

# Run setup scripts
cd backend/scripts
node setup-database.js
node setup-sample-users.js
```

### Environment Variables

Create `.env` file in project root:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=athena_db
DB_USER=athena_user
DB_PASSWORD=athena_password

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Blockchain
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/your-project-id
PRIVATE_KEY=your_private_key_for_deployments

# External APIs
VIETJET_API_KEY=your_vietjet_api_key
HDBANK_API_KEY=your_hdbank_api_key
```

## 📚 API Documentation

### Authentication Endpoints

```http
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/verify      # Token verification
POST /api/auth/refresh     # Token refresh
```

### Token Management

```http
GET  /api/tokens/balance           # Get user token balance
GET  /api/tokens/transactions      # Transaction history
POST /api/tokens/calculate-earning # Calculate tokens for purchase
POST /api/tokens/award            # Award tokens (internal)
POST /api/tokens/redeem           # Redeem tokens for rewards
```

### Marketplace

```http
GET  /api/marketplace/overview     # Market statistics
GET  /api/marketplace/orderbook    # Buy/sell orders
POST /api/marketplace/orders       # Create new order
GET  /api/marketplace/my-orders    # User's orders
DELETE /api/marketplace/orders/:id # Cancel order
GET  /api/marketplace/trades       # Trading history
```

### Services

```http
GET  /api/services/vietjet/flights    # Search flights
POST /api/services/vietjet/book       # Book flight
GET  /api/services/hdbank/products    # Banking products
POST /api/services/hdbank/apply       # Apply for product
GET  /api/services/resorts            # Search resorts
POST /api/services/resorts/book       # Book resort
GET  /api/services/insurance          # Insurance products
POST /api/services/insurance/purchase # Purchase insurance
```

## 🚀 Deployment

### Production Deployment

```bash
# Build frontend
cd web
npm run build

# Build backend
cd ../backend
npm run build

# Start production
npm start
```

### Docker Deployment

```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale backend=3
```

### Environment Configuration

```bash
# Production environment
export NODE_ENV=production
export DB_HOST=your-production-db-host
export JWT_SECRET=your-production-jwt-secret
export ETHEREUM_RPC_URL=your-mainnet-rpc-url
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests
cd backend && npm test

# Run frontend tests
cd web && npm test

# Run integration tests
npm run test:integration
```

## 📊 Monitoring

- **Logs**: Winston-based structured logging
- **Metrics**: Performance monitoring with custom dashboards
- **Alerts**: Error tracking and notification system
- **Analytics**: User behavior and transaction analytics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For technical support or questions:
- **Email**: support@athena-platform.com
- **Documentation**: https://docs.athena-platform.com
- **Issues**: https://github.com/sovico-group/athena-platform/issues

## 🏢 About Sovico Group

ATHENA is developed by Sovico Group, Vietnam's leading conglomerate with businesses spanning aviation (Vietjet), banking (HDBank), hospitality, and insurance sectors.

---

**Built with ❤️ by the Sovico Group Technology Team**

## 🎯 Demo Credentials Reminder

**Live Demo:** https://athena-hd-hackathon-ivf3.vercel.app/
- **Email:** demo@athena.com
- **Password:** demo123
