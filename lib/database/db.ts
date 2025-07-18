// lib/db.ts
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "*Apoema@2025!",
  database: process.env.DB_NAME || "apoema",
  waitForConnections: true,
  connectionLimit: 10,
});
