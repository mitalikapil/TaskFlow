const { Pool } = require('pg');

// 🚨 IMPORTANT: Replace these credentials with your PostgreSQL setup 🚨
const pool = new Pool({
    user: 'postgres', // Your PostgreSQL username
    host: 'localhost',
    database: 'trello_clone', // The database name we successfully created
    password: 'system', // 🚨 UPDATE THIS! 🚨
    port: 5432, // Default PostgreSQL port
});

// Test the connection pool
pool.on('connect', () => {
    console.log('Successfully connected to PostgreSQL database!');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    // Exit the process if the database connection is critically lost
    process.exit(-1);
});

module.exports = pool;