require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Pool } = require('pg');

if (typeof process.env.PGPASSWORD !== 'string' || !process.env.PGPASSWORD.trim()) {
    throw new Error('❌ PGPASSWORD не загружен из .env или пустой!');
}

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT,
});

module.exports = pool;
