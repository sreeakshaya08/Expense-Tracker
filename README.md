# 💰 MoneyVault - Advanced Personal Wealth Management System

A comprehensive web-based personal wealth management application designed for serious money management with a modern frontend and robust backend API.

## 🌟 Premium Features

### 💎 Frontend Wealth Management Features
- **Secure Vault Access** - Military-grade login/signup with password reset
- **Wealth Dashboard** - Complete overview of your financial empire with key metrics
- **Multi-Account Portfolio** - Track multiple bank accounts, investments, and cash reserves
- **Smart Transaction Engine** - Record income streams and expense tracking with intelligent categories
- **Budget Fortress** - Set and monitor spending limits with advanced budget controls
- **Bill Command Center** - Manage upcoming bills and payment schedules
- **Loan & EMI Tracker** - Track loan payments and EMI schedules with precision
- **Responsive Money Interface** - Modern, mobile-friendly wealth management interface

### 🏦 Backend Financial Infrastructure
- **RESTful Money API** - Complete API for all wealth management operations
- **JWT Vault Security** - Bank-level token-based authentication
- **MySQL Financial Database** - Reliable money data storage with proper relationships
- **Financial Data Validation** - Comprehensive monetary data validation and sanitization
- **Error Handling** - Proper error responses and financial logging
- **Bank-Grade Security** - Password hashing, rate limiting, and CORS protection

## 🚀 Quick Vault Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
- Web browser

### Installation

1. **Clone or download MoneyVault**
   ```bash
   # If using git
   git clone <repository-url>
   cd moneyvault-finance
   ```

2. **Run the installation script (Windows)**
   ```bash
   install.bat
   ```

3. **Manual installation (All platforms)**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Copy environment configuration
   cp .env.example .env
   ```

4. **Financial Database Setup**
   ```bash
   # Connect to MySQL
   mysql -u root -p

   # Run the schema file
   source database/schema.sql
   ```

5. **Configure Your Money Vault**
   - Edit `backend/.env` file
   - Update `DB_PASSWORD` with your MySQL password
   - Modify other settings as needed

6. **Launch the Money Server**
   ```bash
   cd backend
   npm run dev
   ```

7. **Access Your Wealth Dashboard**
   - Open `login.html` in your web browser
   - Create your secure vault account or login
   - Start building your financial empire!

## 📁 MoneyVault Architecture

```
moneyvault-finance/
├── backend/                 # Financial API server
│   ├── config/             # Database configuration
│   ├── controllers/        # Money API controllers
│   ├── middleware/         # Authentication & validation
│   ├── routes/            # Financial API routes
│   ├── package.json       # Backend dependencies
│   ├── server.js          # Main money server file
│   └── .env               # Vault environment configuration
├── database/              # Financial database schema
│   └── schema.sql         # MySQL wealth database schema
├── frontend/              # Frontend wealth utilities
│   └── js/
│       └── api.js         # Money API client library
├── *.html                 # Wealth management pages
├── setup.md              # Detailed vault setup guide
├── install.bat           # Windows installation script
└── README.md             # This file
```

## 🔧 MoneyVault API Endpoints

### 🔐 Vault Authentication
- `POST /api/auth/register` - Register new vault user
- `POST /api/auth/login` - Secure vault login
- `POST /api/auth/forgot-password/send-otp` - Send password reset OTP
- `POST /api/auth/forgot-password/reset` - Reset vault password

### 📊 Wealth Dashboard
- `GET /api/dashboard` - Get wealth dashboard summary
- `GET /api/dashboard/overview` - Get complete financial overview

### 🏦 Money Accounts
- `GET /api/accounts` - Get all money accounts
- `POST /api/accounts` - Create new money account
- `PUT /api/accounts/:id` - Update account details
- `DELETE /api/accounts/:id` - Delete money account

### 💸 Financial Transactions
- `GET /api/transactions` - Get all money transactions
- `POST /api/transactions` - Create new financial transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### 💰 Budget Control
- `GET /api/budgets` - Get all budget allocations
- `POST /api/budgets` - Create new budget plan
- `PUT /api/budgets/:id` - Update budget limits
- `DELETE /api/budgets/:id` - Delete budget plan

### 📋 Bill Management
- `GET /api/bills` - Get all pending bills
- `POST /api/bills` - Create new bill entry
- `PUT /api/bills/:id` - Update bill details
- `DELETE /api/bills/:id` - Delete bill entry

### 🏠 Loan & EMI Tracker
- `GET /api/emis` - Get all EMI schedules
- `POST /api/emis` - Create new EMI plan
- `PUT /api/emis/:id` - Update EMI details
- `DELETE /api/emis/:id` - Delete EMI plan

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Tokens** - Secure authentication tokens
- **Input Validation** - Server-side validation for all inputs
- **Rate Limiting** - Protection against brute force attacks
- **CORS Protection** - Controlled cross-origin requests
- **SQL Injection Prevention** - Parameterized queries

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Start with nodemon for auto-restart
```

### Environment Variables
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=moneyvault_finance
JWT_SECRET=your_secret_key
PORT=3000
```

### Testing API Endpoints
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstname":"Test"}'
```

## 📱 Frontend Pages

- **login.html** - User login page
- **signup.html** - User registration page
- **forgot.html** - Password reset page
- **dashboard.html** - Main dashboard
- **accounts.html** - Account management
- **addtransaction.html** - Add new transactions
- **budgets.html** - Budget management
- **bills.html** - Bill tracking
- **emi.html** - EMI management

## 🔄 Migration from localStorage

The application has been upgraded from localStorage to a full backend API. Key changes:

- All data now stored in MySQL database
- Secure user authentication with JWT
- Real-time data synchronization
- Better data validation and error handling
- Scalable architecture for future enhancements

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if MySQL server is running
   - Verify credentials in `.env` file
   - Ensure database exists

2. **Port Already in Use**
   - Change `PORT` in `.env` file
   - Kill existing process: `taskkill /f /im node.exe` (Windows)

3. **CORS Errors**
   - Update `FRONTEND_URL` in `.env` file
   - Ensure frontend is served from correct URL

4. **Authentication Issues**
   - Check JWT_SECRET in `.env` file
   - Clear browser localStorage and try again

### Getting Help

- Check the console for error messages
- Review the setup.md file for detailed instructions
- Ensure all prerequisites are installed correctly

## 📄 License

This project is for educational purposes as part of a CSE mini-project.

## 🤝 Contributing

This is a student project. For improvements or suggestions, please create an issue or submit a pull request.

---

**Build Your Financial Empire with MoneyVault! 💰🏦💎**
