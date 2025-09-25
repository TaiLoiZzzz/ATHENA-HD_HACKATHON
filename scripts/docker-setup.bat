@echo off
REM ATHENA Platform Docker Setup Script for Windows
REM This script helps you set up the Docker environment for ATHENA Platform

setlocal enabledelayedexpansion

REM Colors for output (using echo with color codes)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

:print_status
echo %BLUE%[INFO]%NC% %1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %1
goto :eof

:check_docker
call :print_status "Checking Docker installation..."

docker --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not installed. Please install Docker Desktop first."
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not running. Please start Docker Desktop first."
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit /b 1
)

call :print_success "Docker and Docker Compose are ready!"
goto :eof

:create_env_file
call :print_status "Creating environment file..."

if not exist .env (
    if exist env.example (
        copy env.example .env >nul
        call :print_success "Created .env file from env.example"
        call :print_warning "Please review and update the .env file with your specific configuration"
    ) else (
        call :print_error "env.example file not found. Please create a .env file manually."
        exit /b 1
    )
) else (
    call :print_warning ".env file already exists. Skipping creation."
)
goto :eof

:create_directories
call :print_status "Creating necessary directories..."

set directories=logs uploads database\backups blockchain\logs blockchain\wallet blockchain\crypto-config blockchain\channel-artifacts

for %%d in (%directories%) do (
    if not exist "%%d" (
        mkdir "%%d" 2>nul
        call :print_status "Created directory: %%d"
    )
)

call :print_success "All directories created successfully!"
goto :eof

:start_dev_environment
call :print_status "Starting ATHENA Platform development environment..."

REM Stop any running containers first
docker-compose -f docker-compose.dev.yml down

REM Start the development services
docker-compose -f docker-compose.dev.yml up -d

call :print_status "Waiting for services to be ready..."
timeout /t 10 /nobreak >nul

call :print_status "Checking database connection..."
set max_attempts=30
set attempt=1

:db_check_loop
docker-compose -f docker-compose.dev.yml exec -T athena-db-dev pg_isready -U athena_dev -d athena_db_dev >nul 2>&1
if not errorlevel 1 (
    call :print_success "Database is ready!"
    goto :db_ready
)

call :print_status "Waiting for database... (attempt !attempt!/!max_attempts!)"
timeout /t 2 /nobreak >nul
set /a attempt+=1

if !attempt! leq !max_attempts! goto :db_check_loop

call :print_error "Database failed to start within expected time"
exit /b 1

:db_ready
call :print_success "Development environment is running!"
call :print_status "Services available at:"
echo   - Database: localhost:5433 (athena_dev/athena_dev_password)
echo   - Redis: localhost:6380
echo   - pgAdmin: http://localhost:8081 (dev@athena.com/athena_dev_admin)
echo   - Mailhog: http://localhost:8025
goto :eof

:start_prod_environment
call :print_status "Starting ATHENA Platform production environment..."

REM Stop any running containers first
docker-compose down

REM Build and start the production services
docker-compose up -d --build

call :print_status "Waiting for services to be ready..."
timeout /t 15 /nobreak >nul

call :print_status "Checking services health..."
set max_attempts=30
set attempt=1

:prod_db_check_loop
docker-compose exec -T athena-db pg_isready -U athena_user -d athena_db >nul 2>&1
if not errorlevel 1 (
    call :print_success "Database is ready!"
    goto :prod_db_ready
)

call :print_status "Waiting for database... (attempt !attempt!/!max_attempts!)"
timeout /t 2 /nobreak >nul
set /a attempt+=1

if !attempt! leq !max_attempts! goto :prod_db_check_loop

call :print_error "Database failed to start within expected time"
exit /b 1

:prod_db_ready
call :print_status "Checking API health..."
timeout /t 5 /nobreak >nul

curl -f http://localhost:3000/health >nul 2>&1
if not errorlevel 1 (
    call :print_success "API is ready!"
) else (
    call :print_warning "API health check failed. Please check the logs."
)

call :print_success "Production environment is running!"
call :print_status "Services available at:"
echo   - API: http://localhost:3000
echo   - Database: localhost:5432
echo   - Redis: localhost:6379
echo   - pgAdmin: http://localhost:8080 (admin@athena.com/athena_admin_password)
goto :eof

:stop_services
call :print_status "Stopping all ATHENA Platform services..."

if exist docker-compose.dev.yml (
    docker-compose -f docker-compose.dev.yml down
)

if exist docker-compose.yml (
    docker-compose down
)

call :print_success "All services stopped!"
goto :eof

:show_status
call :print_status "ATHENA Platform Service Status:"
echo.

echo Development Environment:
if exist docker-compose.dev.yml (
    docker-compose -f docker-compose.dev.yml ps
) else (
    echo   docker-compose.dev.yml not found
)

echo.
echo Production Environment:
if exist docker-compose.yml (
    docker-compose ps
) else (
    echo   docker-compose.yml not found
)
goto :eof

:show_help
echo ATHENA Platform Docker Setup Script for Windows
echo.
echo Usage: %0 [COMMAND]
echo.
echo Commands:
echo   setup         - Initial setup (check Docker, create directories, etc.)
echo   dev           - Start development environment
echo   prod          - Start production environment
echo   stop          - Stop all services
echo   restart       - Restart services
echo   status        - Show status of all services
echo   help          - Show this help message
echo.
echo Examples:
echo   %0 setup      - Initial setup
echo   %0 dev        - Start development environment
echo   %0 stop       - Stop all services
goto :eof

REM Main script logic
if "%1"=="" goto :show_help
if "%1"=="setup" goto :setup
if "%1"=="dev" goto :dev
if "%1"=="prod" goto :prod
if "%1"=="stop" goto :stop
if "%1"=="restart" goto :restart
if "%1"=="status" goto :status
if "%1"=="help" goto :show_help
goto :show_help

:setup
call :check_docker
call :create_env_file
call :create_directories
call :print_success "Setup completed! You can now run '%0 dev' to start the development environment."
goto :eof

:dev
call :check_docker
call :start_dev_environment
goto :eof

:prod
call :check_docker
call :start_prod_environment
goto :eof

:stop
call :stop_services
goto :eof

:restart
call :stop_services
timeout /t 2 /nobreak >nul
if "%2"=="prod" (
    call :start_prod_environment
) else (
    call :start_dev_environment
)
goto :eof

:status
call :show_status
goto :eof

