@echo off
echo ========================================
echo Savii Personal Finance Management System
echo Backend Installation Script
echo ========================================
echo.

echo Step 1: Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is installed ✓

echo.
echo Step 2: Checking MySQL installation...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MySQL command not found in PATH
    echo Please ensure MySQL is installed and accessible
    echo You can continue if MySQL is installed but not in PATH
    pause
)

echo.
echo Step 3: Installing backend dependencies...
cd backend
if not exist package.json (
    echo ERROR: package.json not found in backend directory
    pause
    exit /b 1
)

echo Installing npm packages...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install npm packages
    pause
    exit /b 1
)
echo Backend dependencies installed ✓

echo.
echo Step 4: Setting up environment configuration...
if not exist .env (
    if exist .env.example (
        copy .env.example .env
        echo Environment file created from example ✓
        echo.
        echo IMPORTANT: Please edit backend\.env file with your MySQL credentials
        echo Update the DB_PASSWORD field with your MySQL root password
        echo.
    ) else (
        echo ERROR: .env.example file not found
        pause
        exit /b 1
    )
) else (
    echo Environment file already exists ✓
)

cd ..

echo.
echo Step 5: Database setup instructions...
echo ========================================
echo To complete the setup, you need to:
echo.
echo 1. Start your MySQL server
echo 2. Connect to MySQL as root: mysql -u root -p
echo 3. Run the database schema: source database/schema.sql
echo 4. Update backend\.env with your MySQL password
echo 5. Start the backend server: cd backend && npm run dev
echo.
echo ========================================

echo.
echo Installation completed! ✓
echo.
echo Next steps:
echo 1. Configure your database (see instructions above)
echo 2. Start the backend server: cd backend && npm run dev
echo 3. Open your browser and navigate to the HTML files
echo.
echo For detailed setup instructions, see setup.md
echo.
pause
