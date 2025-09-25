# ATHENA Platform Web Application

A modern web application for the ATHENA Platform built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS
- **Authentication**: JWT-based auth with secure cookie storage
- **Real-time Updates**: Socket.IO integration for live notifications
- **Responsive Design**: Mobile-first approach with beautiful UI
- **State Management**: React Context with TypeScript
- **API Integration**: Complete integration with ATHENA backend
- **Animations**: Framer Motion for smooth interactions

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom ATHENA theme
- **UI Components**: Headless UI, Heroicons
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios with interceptors
- **Animations**: Framer Motion
- **Charts**: Recharts for data visualization
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Install Dependencies**
```bash
cd web
npm install
```

2. **Environment Setup**
Create a `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ATHENA Platform
```

3. **Start Development Server**
```bash
npm run dev
```

The web app will be available at `http://localhost:3001`

## 🏗️ Project Structure

```
web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard page
│   │   ├── marketplace/       # Marketplace pages
│   │   ├── services/          # Service pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── Layout/           # Layout components
│   │   ├── UI/               # UI components
│   │   └── Forms/            # Form components
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx   # Authentication context
│   ├── lib/                  # Utilities and configs
│   │   ├── api.ts            # API service
│   │   └── utils.ts          # Utility functions
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── tailwind.config.js        # Tailwind configuration
├── next.config.js           # Next.js configuration
└── package.json             # Dependencies
```

## 🎨 Design System

### Colors
- **Primary**: Deep blue (#1B365D) - Trust and stability
- **Secondary**: Orange (#FF6B35) - Energy and innovation
- **Token**: Gold (#FFD700) - Value and premium
- **Success**: Green (#22C55E) - Positive actions
- **Warning**: Amber (#F59E0B) - Caution
- **Error**: Red (#EF4444) - Errors and danger

### Typography
- **Font**: Inter (system font fallback)
- **Scales**: Tailwind default with custom extensions
- **Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)

### Components
- **Buttons**: Multiple variants with consistent styling
- **Cards**: Elevated surfaces with shadows
- **Forms**: Consistent input styling with validation
- **Badges**: Status indicators with semantic colors

## 🔐 Authentication

The web app uses JWT-based authentication with secure cookie storage:

- **Login/Register**: Form validation with Zod schemas
- **Token Storage**: HTTP-only cookies for security
- **Auto-refresh**: Automatic token refresh
- **Protected Routes**: Route guards for authenticated pages
- **User Context**: Global user state management

## 📱 Pages Overview

### Public Pages
- **Homepage** (`/`): Landing page with features and CTA
- **Login** (`/auth/login`): User authentication
- **Register** (`/auth/register`): User registration

### Protected Pages
- **Dashboard** (`/dashboard`): User overview with stats
- **Services** (`/services`): Browse and book services
- **Marketplace** (`/marketplace`): Trade SOV-Tokens
- **Transactions** (`/transactions`): Transaction history
- **Profile** (`/profile`): User profile management

## 🔌 API Integration

### API Service (`src/lib/api.ts`)
- **Axios Instance**: Pre-configured with base URL and interceptors
- **Error Handling**: Automatic error handling with toast notifications
- **Type Safety**: Full TypeScript support for all endpoints
- **Authentication**: Automatic token injection

### Available Endpoints
```typescript
// Authentication
apiService.login(email, password)
apiService.register(userData)
apiService.logout()

// User Management
apiService.getUserProfile()
apiService.updateUserProfile(data)
apiService.upgradeToAthenaPrime()

// Token Management
apiService.getTokenBalance()
apiService.getTokenTransactions()
apiService.redeemTokens(amount, type)

// Marketplace
apiService.getMarketplaceOverview()
apiService.createMarketplaceOrder(data)
apiService.getUserOrders()

// Services
apiService.searchVietjetFlights(params)
apiService.getHDBankProducts()
apiService.searchResorts(params)
```

## 🎯 Key Features

### Dashboard
- **Token Balance**: Real-time SOV-Token balance display
- **Quick Stats**: Earnings, spending, and net tokens
- **Recent Transactions**: Latest transaction history
- **Quick Actions**: Fast access to key features
- **ATHENA Prime**: Premium upgrade prompts

### Marketplace
- **Order Book**: Live buy/sell orders
- **Trading Interface**: Create and manage orders
- **Trade History**: Complete trading history
- **Real-time Updates**: Live order book updates

### Services
- **Vietjet Flights**: Flight search and booking
- **HDBank Products**: Banking services
- **Resort Bookings**: Hotel reservations
- **Insurance**: Policy management

### Unified Cart
- **Multi-service**: Items from different services
- **Token Calculation**: Real-time token earning preview
- **Single Checkout**: One payment for all services

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Code Style
- **ESLint**: Code linting with Next.js config
- **Prettier**: Code formatting (recommended)
- **TypeScript**: Strict type checking
- **Tailwind**: Utility-first CSS

### Environment Variables
```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Optional
NEXT_PUBLIC_APP_NAME=ATHENA Platform
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🚀 Deployment

### Build and Deploy
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Support
```dockerfile
# Add to main docker-compose.yml
athena-web:
  build:
    context: ./web
    dockerfile: Dockerfile
  ports:
    - "3001:3000"
  environment:
    - NEXT_PUBLIC_API_URL=http://athena-api:3000/api
  depends_on:
    - athena-api
```

### Vercel Deployment
The app is optimized for Vercel deployment:
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

## 🧪 Testing

### Demo Accounts
Use these accounts for testing:

| Email | Password | Type |
|-------|----------|------|
| demo@athena.com | demo123 | Standard User |
| prime@athena.com | prime123 | ATHENA Prime |
| trader@athena.com | trader123 | Active Trader |
| business@athena.com | business123 | Business User |

### Features to Test
- **Authentication**: Login/register flows
- **Dashboard**: Token balance and stats
- **Services**: Browse and add to cart
- **Marketplace**: Create and manage orders
- **Real-time**: Live notifications and updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the ATHENA Platform by Sovico Group.

---

**🎉 Ready to experience the future of loyalty rewards!**

