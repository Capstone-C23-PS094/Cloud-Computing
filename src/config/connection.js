import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config()

const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    database: process.env.DB_NAME,
});

export default dbPool.promise()