#!/bin/bash

# ATHENA Platform Docker Setup Script
# This script helps you set up the Docker environment for ATHENA Platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is installed and running
check_docker() {
    print_status "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are ready!"
}

# Function to create environment file
create_env_file() {
    print_status "Creating environment file..."
    
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            print_success "Created .env file from env.example"
            print_warning "Please review and update the .env file with your specific configuration"
        else
            print_error "env.example file not found. Please create a .env file manually."
            exit 1
        fi
    else
        print_warning ".env file already exists. Skipping creation."
    fi
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    directories=(
        "logs"
        "uploads"
        "database/backups"
        "blockchain/logs"
        "blockchain/wallet"
        "blockchain/crypto-config"
        "blockchain/channel-artifacts"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_status "Created directory: $dir"
        fi
    done
    
    print_success "All directories created successfully!"
}

# Function to start development environment
start_dev_environment() {
    print_status "Starting ATHENA Platform development environment..."
    
    # Stop any running containers first
    docker-compose -f docker-compose.dev.yml down
    
    # Start the development services
    docker-compose -f docker-compose.dev.yml up -d
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check if database is ready
    print_status "Checking database connection..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f docker-compose.dev.yml exec -T athena-db-dev pg_isready -U athena_dev -d athena_db_dev &> /dev/null; then
            print_success "Database is ready!"
            break
        fi
        
        print_status "Waiting for database... (attempt $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Database failed to start within expected time"
        exit 1
    fi
    
    print_success "Development environment is running!"
    print_status "Services available at:"
    echo "  - Database: localhost:5433 (athena_dev/athena_dev_password)"
    echo "  - Redis: localhost:6380"
    echo "  - pgAdmin: http://localhost:8081 (dev@athena.com/athena_dev_admin)"
    echo "  - Mailhog: http://localhost:8025"
}

# Function to start production environment
start_prod_environment() {
    print_status "Starting ATHENA Platform production environment..."
    
    # Stop any running containers first
    docker-compose down
    
    # Build and start the production services
    docker-compose up -d --build
    
    print_status "Waiting for services to be ready..."
    sleep 15
    
    # Check if services are ready
    print_status "Checking services health..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T athena-db pg_isready -U athena_user -d athena_db &> /dev/null; then
            print_success "Database is ready!"
            break
        fi
        
        print_status "Waiting for database... (attempt $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Database failed to start within expected time"
        exit 1
    fi
    
    # Check API health
    print_status "Checking API health..."
    sleep 5
    
    if curl -f http://localhost:3000/health &> /dev/null; then
        print_success "API is ready!"
    else
        print_warning "API health check failed. Please check the logs."
    fi
    
    print_success "Production environment is running!"
    print_status "Services available at:"
    echo "  - API: http://localhost:3000"
    echo "  - Database: localhost:5432"
    echo "  - Redis: localhost:6379"
    echo "  - pgAdmin: http://localhost:8080 (admin@athena.com/athena_admin_password)"
}

# Function to stop all services
stop_services() {
    print_status "Stopping all ATHENA Platform services..."
    
    # Stop development services
    if [ -f docker-compose.dev.yml ]; then
        docker-compose -f docker-compose.dev.yml down
    fi
    
    # Stop production services
    if [ -f docker-compose.yml ]; then
        docker-compose down
    fi
    
    print_success "All services stopped!"
}

# Function to clean up Docker resources
cleanup_docker() {
    print_warning "This will remove all ATHENA Platform Docker resources including data!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up Docker resources..."
        
        # Stop and remove containers
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans 2>/dev/null || true
        docker-compose down -v --remove-orphans 2>/dev/null || true
        
        # Remove volumes
        docker volume rm athena_db_data 2>/dev/null || true
        docker volume rm athena_redis_data 2>/dev/null || true
        docker volume rm athena_pgadmin_data 2>/dev/null || true
        docker volume rm athena_db_dev_data 2>/dev/null || true
        docker volume rm athena_redis_dev_data 2>/dev/null || true
        docker volume rm athena_pgadmin_dev_data 2>/dev/null || true
        
        # Remove networks
        docker network rm athena-network 2>/dev/null || true
        docker network rm athena-dev-network 2>/dev/null || true
        
        # Remove images
        docker rmi $(docker images -q "athena*" 2>/dev/null) 2>/dev/null || true
        
        print_success "Docker cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show logs
show_logs() {
    local service=$1
    local environment=$2
    
    if [ "$environment" = "dev" ]; then
        if [ -z "$service" ]; then
            docker-compose -f docker-compose.dev.yml logs -f
        else
            docker-compose -f docker-compose.dev.yml logs -f "$service"
        fi
    else
        if [ -z "$service" ]; then
            docker-compose logs -f
        else
            docker-compose logs -f "$service"
        fi
    fi
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Check if development environment is running
    if docker-compose -f docker-compose.dev.yml ps | grep -q athena-db-dev; then
        print_status "Running migrations on development database..."
        docker-compose -f docker-compose.dev.yml exec athena-db-dev psql -U athena_dev -d athena_db_dev -f /docker-entrypoint-initdb.d/01-init-database.sql
        docker-compose -f docker-compose.dev.yml exec athena-db-dev psql -U athena_dev -d athena_db_dev -f /docker-entrypoint-initdb.d/02-sample-data.sql
    elif docker-compose ps | grep -q athena-db; then
        print_status "Running migrations on production database..."
        docker-compose exec athena-db psql -U athena_user -d athena_db -f /docker-entrypoint-initdb.d/01-init-database.sql
        docker-compose exec athena-db psql -U athena_user -d athena_db -f /docker-entrypoint-initdb.d/02-sample-data.sql
    else
        print_error "No database container is running. Please start the environment first."
        exit 1
    fi
    
    print_success "Database migrations completed!"
}

# Function to backup database
backup_database() {
    local backup_name="athena_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    print_status "Creating database backup: $backup_name"
    
    if docker-compose -f docker-compose.dev.yml ps | grep -q athena-db-dev; then
        docker-compose -f docker-compose.dev.yml exec -T athena-db-dev pg_dump -U athena_dev athena_db_dev > "database/backups/$backup_name"
    elif docker-compose ps | grep -q athena-db; then
        docker-compose exec -T athena-db pg_dump -U athena_user athena_db > "database/backups/$backup_name"
    else
        print_error "No database container is running."
        exit 1
    fi
    
    print_success "Database backup created: database/backups/$backup_name"
}

# Function to show help
show_help() {
    echo "ATHENA Platform Docker Setup Script"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  setup         - Initial setup (check Docker, create directories, etc.)"
    echo "  dev           - Start development environment"
    echo "  prod          - Start production environment"
    echo "  stop          - Stop all services"
    echo "  restart       - Restart services"
    echo "  logs [service]- Show logs (optionally for specific service)"
    echo "  logs-dev [service] - Show development logs"
    echo "  migrate       - Run database migrations"
    echo "  backup        - Create database backup"
    echo "  cleanup       - Clean up all Docker resources (WARNING: removes data)"
    echo "  status        - Show status of all services"
    echo "  help          - Show this help message"
    echo
    echo "Examples:"
    echo "  $0 setup      - Initial setup"
    echo "  $0 dev        - Start development environment"
    echo "  $0 logs api   - Show API logs"
    echo "  $0 backup     - Create database backup"
}

# Function to show service status
show_status() {
    print_status "ATHENA Platform Service Status:"
    echo
    
    echo "Development Environment:"
    if [ -f docker-compose.dev.yml ]; then
        docker-compose -f docker-compose.dev.yml ps
    else
        echo "  docker-compose.dev.yml not found"
    fi
    
    echo
    echo "Production Environment:"
    if [ -f docker-compose.yml ]; then
        docker-compose ps
    else
        echo "  docker-compose.yml not found"
    fi
}

# Main script logic
case "${1:-help}" in
    setup)
        check_docker
        create_env_file
        create_directories
        print_success "Setup completed! You can now run '$0 dev' to start the development environment."
        ;;
    dev)
        check_docker
        start_dev_environment
        ;;
    prod)
        check_docker
        start_prod_environment
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        sleep 2
        if [ "${2:-dev}" = "prod" ]; then
            start_prod_environment
        else
            start_dev_environment
        fi
        ;;
    logs)
        show_logs "$2" "prod"
        ;;
    logs-dev)
        show_logs "$2" "dev"
        ;;
    migrate)
        run_migrations
        ;;
    backup)
        backup_database
        ;;
    cleanup)
        cleanup_docker
        ;;
    status)
        show_status
        ;;
    help|*)
        show_help
        ;;
esac

