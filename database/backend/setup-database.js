const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });

async function setupDatabase() {
  console.log('🔧 Setting up MoneyVault database...');
  
  // First, connect without specifying a database to create it
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  try {
    // Connect to MySQL server
    console.log('📡 Connecting to MySQL server...');
    const connection = await mysql.createConnection(connectionConfig);
    
    // Create database if it doesn't exist
    console.log('🏗️ Creating database...');
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'moneyvault_finance'}`);
    console.log('✅ Database created successfully');
    
    // Close the connection
    await connection.end();
    
    // Now connect to the specific database and run schema
    const dbConnection = await mysql.createConnection({
      ...connectionConfig,
      database: process.env.DB_NAME || 'moneyvault_finance'
    });
    
    // Read and execute schema file
    console.log('📋 Reading schema file...');
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('CREATE DATABASE') && !stmt.startsWith('USE') && !stmt.startsWith('CREATE INDEX'));
    
    console.log('🔨 Executing schema statements...');
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await dbConnection.execute(statement);
          console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
        } catch (error) {
          console.log(`⚠️ Warning: ${error.message}`);
        }
      }
    }
    
    await dbConnection.end();
    console.log('🎉 Database setup completed successfully!');
    console.log('🚀 You can now start the server with: node server.js');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
