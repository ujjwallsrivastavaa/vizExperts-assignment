/**
 * Database initialization script
 * Reads schema.sql and creates tables
 */

const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL...');
    
    // First connect without database to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'rootpassword',
      multipleStatements: true
    });
    
    console.log('✅ Connected to MySQL');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../../schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    console.log('📝 Executing schema...');
    await connection.query(schema);
    
    console.log('✅ Database initialized successfully');
    console.log('📊 Tables created: uploads, chunks');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
