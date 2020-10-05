const fs = require('fs');
const path = require('path');
const config = require('config');
const {Pool} = require('pg');

pool = new Pool({
    connectionString: config.get('pgconnect'),
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(1);
});

const sql = fs.readFileSync(path.resolve(__dirname, 'db.sql'), 'utf-8');

pool.query(sql, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log('Database is ok');
});