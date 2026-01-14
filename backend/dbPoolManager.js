import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* ------------------------------------------------------------------
   ESM-safe __dirname
------------------------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------------------------------------------------------
   Load DB registry
------------------------------------------------------------------- */
const registryPath = path.join(__dirname, "dbRegistry.json");
const dbRegistry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));

/* ------------------------------------------------------------------
   Connection pools
------------------------------------------------------------------- */
const pools = {};

/* ------------------------------------------------------------------
   Get pool for a database
------------------------------------------------------------------- */
export function getDBPool(dbName) {
  if (!dbRegistry[dbName]) {
    throw new Error(`❌ Database not registered: ${dbName}`);
  }

  if (!pools[dbName]) {
    pools[dbName] = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "node_user",
      password: process.env.DB_PASSWORD || "Node@123",
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log(`🔌 DB pool created for: ${dbName}`);
  }

  return pools[dbName];
}

/* ------------------------------------------------------------------
   Execute SQL safely
------------------------------------------------------------------- */
export async function executeQuery(dbName, sql) {
  const pool = getDBPool(dbName);
  const [rows] = await pool.query(sql);
  return rows;
}
