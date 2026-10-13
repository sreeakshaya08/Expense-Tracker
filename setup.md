# Savii Personal Finance Management System - Backend Setup Guide

## Prerequisites

1. **Node.js** (version 14 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MySQL Server** (version 8.0 or higher)
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Install on D: drive if preferred
   - Remember your root password

## Step-by-Step Setup

### 1. Database Setup

1. **Start MySQL Server**
   ```bash
   # Windows (if MySQL is in PATH)
   net start mysql80
   
   # Or start from MySQL Workbench/Services
   ```

2. **Create Database**
   ```bash
   # Connect to MySQL
   mysql -u root -p
   
   # Run the schema file
   source database/schema.sql
   
   # Or copy-paste the contents of database/schema.sql
   ```

### 2. Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Copy the example environment file
   copy .env.example .env
   
   # Edit .env file with your MySQL credentials
   # Update DB_PASSWORD with your MySQL root password
   ```

4. **Start the backend server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Or production mode
   npm start
   ```

5. **Verify backend is running**
   - Open browser and go to: http://localhost:3000/health
   - You should see a JSON response indicating the server is running

### 3. Frontend Integration

The frontend files need to be updated to use the backend APIs instead of localStorage. Here are the key changes needed:

#### Update login.html
- Replace localStorage authentication with API calls
- Add JWT token storage and management

#### Update dashboard.html
- Fetch data from `/api/dashboard` endpoint
- Update all data display logic

#### Update other HTML files
- Replace localStorage operations with fetch() API calls
- Add proper error handling for network requests

### 4. Testing the Setup

1. **Test API endpoints**
   ```bash
   # Test health endpoint
   curl http://localhost:3000/health
   
   # Test user registration
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","firstname":"Test"}'
   ```

2. **Test database connection**
   - Check MySQL logs for any connection errors
   - Verify tables were created successfully

## Environment Variables

Update the `.env` file with your specific configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=moneyvault_finance

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:8080
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password/send-otp` - Send OTP for password reset
- `POST /api/auth/forgot-password/reset` - Reset password
- `GET /api/auth/profile` - Get user profile

### Accounts
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/:id` - Get specific account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account
- `GET /api/accounts/summary` - Get account summary

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get specific transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary` - Get transaction summary

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create new budget
- `GET /api/budgets/:id` - Get specific budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/summary` - Get budget summary
- `POST /api/budgets/reset` - Reset all budgets

### Bills
- `GET /api/bills` - Get all bills
- `POST /api/bills` - Create new bill
- `GET /api/bills/:id` - Get specific bill
- `PUT /api/bills/:id` - Update bill
- `DELETE /api/bills/:id` - Delete bill
- `PATCH /api/bills/:id/mark-paid` - Mark bill as paid
- `GET /api/bills/summary` - Get bills summary

### EMIs
- `GET /api/emis` - Get all EMIs
- `POST /api/emis` - Create new EMI
- `GET /api/emis/:id` - Get specific EMI
- `PUT /api/emis/:id` - Update EMI
- `DELETE /api/emis/:id` - Delete EMI
- `GET /api/emis/summary` - Get EMI summary

### Dashboard
- `GET /api/dashboard` - Get dashboard data
- `GET /api/dashboard/overview` - Get financial overview

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if MySQL server is running
   - Verify credentials in .env file
   - Ensure database exists

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing process on port 3000

3. **CORS Errors**
   - Update FRONTEND_URL in .env file
   - Ensure frontend is served from correct URL

4. **JWT Token Issues**
   - Check JWT_SECRET in .env file
   - Ensure token is included in Authorization header

### Logs and Debugging

- Backend logs are displayed in the console
- Check MySQL error logs for database issues
- Use browser developer tools for frontend debugging

## Security Notes

- Change default JWT_SECRET in production
- Use strong MySQL passwords
- Enable HTTPS in production
- Implement proper input validation
- Regular security updates

## Next Steps

After setup is complete:
1. Update frontend files to use backend APIs
2. Test all functionality thoroughly
3. Add additional features as needed
4. Deploy to production environment
