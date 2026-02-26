import { drizzle } from "drizzle-orm/node-postgres";
import { drizzle as sqliteDrizzle } from "drizzle-orm/better-sqlite3";
import pg from "pg";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Auto-detect database type based on URL
const isLocal = process.env.DATABASE_URL.startsWith('file:');

let db: any;
let pool: any;

if (isLocal) {
  const sqlite = new Database(process.env.DATABASE_URL.replace('file:', ''));
  db = sqliteDrizzle(sqlite, { schema });
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
}

export { db, pool };
