import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'memorygame',
    password: process.env.DB_PASSWORD || 'memorygame',
    database: process.env.DB_NAME || 'memorygame',
});

// Schema is managed by Liquibase — just verify the connection
export async function initDb(): Promise<void> {
    await pool.query('SELECT 1');
}

export default pool;