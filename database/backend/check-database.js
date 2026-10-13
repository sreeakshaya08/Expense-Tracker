const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

async function checkDatabase() {
  console.log('🔍 Checking MoneyVault database...');
  console.log('Database name:', process.env.DB_NAME);
  
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'moneyvault_finance'
  };

  try {
    const connection = await mysql.createConnection(connectionConfig);
    
    // Check if database exists
    const [databases] = await connection.execute(`SHOW DATABASES LIKE '${process.env.DB_NAME}'`);
    console.log('Database exists:', databases.length > 0);
    
    // Check tables
    const [tables] = await connection.execute("SHOW TABLES");
    console.log('Tables found:', tables.length);
    
    if (tables.length > 0) {
      console.log('Table names:');
      tables.forEach(table => {
        console.log('  -', Object.values(table)[0]);
      });
    }
    
    // Check users table specifically
    try {
      const [users] = await connection.execute("SELECT COUNT(*) as count FROM users");
      console.log('Users table exists with', users[0].count, 'records');
    } catch (error) {
      console.log('Users table does not exist or is empty');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkDatabase();
