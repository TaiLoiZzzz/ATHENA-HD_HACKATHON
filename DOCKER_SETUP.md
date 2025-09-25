# 🐳 ATHENA Platform Docker Setup Guide

This guide will help you set up and run the ATHENA Platform using Docker containers for easy development and deployment.

## 📋 Prerequisites

### Required Software
- **Docker Desktop** (latest version)
  - Windows: [Download Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
  - macOS: [Download Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
  - Linux: [Install Docker Engine](https://docs.docker.com/engine/install/)
- **Docker Compose** (included with Docker Desktop)
- **Git** for cloning the repository

### System Requirements
- **RAM**: Minimum 8GB, Recommended 16GB
- **Storage**: At least 10GB free space
- **CPU**: Multi-core processor recommended

## 🚀 Quick Start

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd athena-platform

# Run initial setup
./scripts/docker-setup.sh setup    # Linux/macOS
scripts\docker-setup.bat setup     # Windows
```

### 2. Start Development Environment
```bash
# Start all development services
./scripts/docker-setup.sh dev      # Linux/macOS
scripts\docker-setup.bat dev       # Windows
```

### 3. Access Services
Once started, you can access:
- **Database**: `localhost:5433` (athena_dev/athena_dev_password)
- **Redis**: `localhost:6380`
- **pgAdmin**: http://localhost:8081 (dev@athena.com/athena_dev_admin)
- **Mailhog**: http://localhost:8025 (for email testing)

## 🏗️ Architecture Overview

### Development Environment (`docker-compose.dev.yml`)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │      Redis      │    │     pgAdmin     │
│   Port: 5433    │    │   Port: 6380    │    │   Port: 8081    │
│                 │    │                 │    │                 │
│ athena_dev_db   │    │  athena_redis   │    │  Database GUI   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Mailhog     │
                    │   Port: 8025    │
                    │                 │
                    │  Email Testing  │
                    └─────────────────┘
```

### Production Environment (`docker-compose.yml`)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │      Redis      │    │   ATHENA API    │
│   Port: 5432    │    │   Port: 6379    │    │   Port: 3000    │
│                 │    │                 │    │                 │
│  athena_prod    │    │  athena_cache   │    │  Node.js App    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     pgAdmin     │
                    │   Port: 8080    │
                    │                 │
                    │  Database GUI   │
                    └─────────────────┘
```

## 🔧 Configuration

### Environment Variables
Copy `env.example` to `.env` and customize:

```bash
# Database Configuration
DB_HOST=athena-db-dev          # For development
DB_PORT=5432
DB_NAME=athena_db_dev
DB_USER=athena_dev
DB_PASSWORD=athena_dev_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Redis Configuration
REDIS_HOST=athena-redis-dev
REDIS_PORT=6379
REDIS_PASSWORD=athena_dev_redis
```

### Docker Compose Files

#### `docker-compose.dev.yml` - Development
- Uses different ports to avoid conflicts
- Includes development tools (Mailhog, pgAdmin)
- Volume mounts for hot reload
- Sample data auto-loaded

#### `docker-compose.yml` - Production
- Optimized for production use
- Includes the ATHENA API container
- Health checks and restart policies
- Production-ready security settings

## 📖 Available Commands

### Setup and Management
```bash
# Initial setup (run once)
./scripts/docker-setup.sh setup

# Start development environment
./scripts/docker-setup.sh dev

# Start production environment  
./scripts/docker-setup.sh prod

# Stop all services
./scripts/docker-setup.sh stop

# Restart services
./scripts/docker-setup.sh restart

# Show service status
./scripts/docker-setup.sh status
```

### Logs and Debugging
```bash
# View all logs
./scripts/docker-setup.sh logs

# View specific service logs
./scripts/docker-setup.sh logs athena-db-dev

# View development logs
./scripts/docker-setup.sh logs-dev
```

### Database Operations
```bash
# Run database migrations
./scripts/docker-setup.sh migrate

# Create database backup
./scripts/docker-setup.sh backup

# Access database directly
docker-compose -f docker-compose.dev.yml exec athena-db-dev psql -U athena_dev -d athena_db_dev
```

### Cleanup
```bash
# Remove all containers, volumes, and data (WARNING: destructive)
./scripts/docker-setup.sh cleanup
```

## 🗄️ Database Setup

### Automatic Initialization
The PostgreSQL container automatically runs initialization scripts from `database/init/`:

1. **`01-init-database.sql`** - Creates tables, indexes, and functions
2. **`02-sample-data.sql`** - Loads demo users and sample data

### Demo Users Created
| Email | Password | Type | SOV-Token Balance |
|-------|----------|------|-------------------|
| demo@athena.com | demo123 | Standard User | 1,250.50 |
| prime@athena.com | prime123 | ATHENA Prime | 5,420.75 |
| trader@athena.com | trader123 | Active Trader | 850.25 |
| business@athena.com | business123 | Business User | 12,750.80 |

### Database Access
- **Development**: `localhost:5433`
- **Production**: `localhost:5432`
- **pgAdmin**: http://localhost:8081 (dev) or http://localhost:8080 (prod)

## 🔍 Monitoring and Debugging

### Service Health Checks
All services include health checks that verify:
- Database connectivity
- Redis availability
- API responsiveness

### Log Locations
```bash
# Container logs
docker-compose logs [service-name]

# Application logs (mounted volumes)
./logs/error.log          # Error logs
./logs/combined.log       # All logs
./logs/blockchain.log     # Blockchain service logs
```

### Common Issues and Solutions

#### Port Conflicts
If you get port binding errors:
```bash
# Check what's using the port
netstat -tulpn | grep :5432    # Linux
netstat -an | findstr :5432    # Windows

# Use different ports in docker-compose.dev.yml
```

#### Database Connection Issues
```bash
# Check if database is ready
docker-compose -f docker-compose.dev.yml exec athena-db-dev pg_isready -U athena_dev

# View database logs
docker-compose -f docker-compose.dev.yml logs athena-db-dev
```

#### Memory Issues
```bash
# Check Docker resource usage
docker stats

# Increase Docker Desktop memory allocation in settings
```

## 🚀 Development Workflow

### 1. Daily Development
```bash
# Start development environment
./scripts/docker-setup.sh dev

# Make code changes (hot reload enabled)
# Test your changes

# View logs if needed
./scripts/docker-setup.sh logs-dev
```

### 2. Database Changes
```bash
# Modify database/init/*.sql files
# Restart database to apply changes
docker-compose -f docker-compose.dev.yml restart athena-db-dev

# Or rebuild completely
docker-compose -f docker-compose.dev.yml down -v
./scripts/docker-setup.sh dev
```

### 3. Testing
```bash
# Run backend tests
docker-compose -f docker-compose.dev.yml exec athena-api npm test

# Run integration tests
docker-compose -f docker-compose.dev.yml exec athena-api npm run test:integration
```

## 🌐 Production Deployment

### 1. Build and Deploy
```bash
# Start production environment
./scripts/docker-setup.sh prod

# Verify all services are healthy
./scripts/docker-setup.sh status
curl http://localhost:3000/health
```

### 2. Environment Configuration
Update `.env` with production values:
```bash
NODE_ENV=production
DB_PASSWORD=strong_production_password
JWT_SECRET=very_long_random_production_secret
REDIS_PASSWORD=strong_redis_password
```

### 3. SSL/HTTPS Setup
For production, add a reverse proxy (nginx) with SSL:
```yaml
# Add to docker-compose.yml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
    - ./ssl:/etc/nginx/ssl
```

## 🔐 Security Considerations

### Development Environment
- Uses default passwords (change for production)
- Exposes services on non-standard ports
- Includes development tools

### Production Environment
- Strong passwords required
- Limited exposed ports
- Health checks enabled
- Restart policies configured

### Best Practices
1. **Never use default passwords in production**
2. **Use environment-specific `.env` files**
3. **Regularly backup your database**
4. **Monitor container logs**
5. **Keep Docker images updated**

## 📚 Additional Resources

### Documentation
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)

### ATHENA Platform Specific
- Main README.md - Complete platform documentation
- API documentation - Available at `/api/docs` when running
- Frontend setup guide - In `frontend/README.md`

## 🆘 Troubleshooting

### Get Help
```bash
# Show help for setup script
./scripts/docker-setup.sh help

# Check service status
./scripts/docker-setup.sh status

# View all logs
./scripts/docker-setup.sh logs
```

### Reset Everything
If you need to start fresh:
```bash
# WARNING: This removes all data
./scripts/docker-setup.sh cleanup

# Then start over
./scripts/docker-setup.sh setup
./scripts/docker-setup.sh dev
```

---

**🎉 You're now ready to develop with the ATHENA Platform using Docker!**

For additional help, check the main README.md or create an issue in the repository.

