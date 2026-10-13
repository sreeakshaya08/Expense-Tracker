const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/../.env' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'moneyvault_finance',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize database (create tables if they don't exist)
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Check if tables exist
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ?",
      [process.env.DB_NAME]
    );
    
    if (tables.length === 0) {
      console.log('📋 No tables found. Please run the schema.sql file to create tables.');
    } else {
      console.log(`✅ Found ${tables.length} tables in database`);
    }
    
    connection.release();
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};
