import { drizzle } from "drizzle-orm/node-postgres";
import { drizzle as sqliteDrizzle } from "drizzle-orm/better-sqlite3";
import pg from "pg";
import * as schema from "@shared/schema";
import { JSONStorageAdapter } from "./storage-adapter";

const { Pool } = pg;

// Provide default DATABASE_URL if not set
const DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';

// Auto-detect database type based on URL
const isLocal = DATABASE_URL.startsWith('file:');

let db: any;
let pool: any;

async function initializeDatabase() {
  try {
    if (isLocal) {
      // Try to dynamically import better-sqlite3
      const { default: Database } = await import("better-sqlite3");
      const sqlite = new Database(DATABASE_URL.replace('file:', ''));
      db = sqliteDrizzle(sqlite, { schema });
    } else {
      pool = new Pool({ connectionString: DATABASE_URL });
      db = drizzle(pool, { schema });
    }
    
    // Test the connection
    if (db.select) {
      await db.select().from(schema.products).limit(1);
    }
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.warn('Database initialization failed, falling back to JSON storage:', error.message);
    
    // Fallback to JSON storage
    const jsonStorage = new JSONStorageAdapter('./storage.json');
    await jsonStorage.initialize();
    
    // Mock drizzle interface
    db = {
      select: () => ({
        from: (table: any) => ({
          limit: async (limit?: number) => {
            const tableName = table[Symbol.for('drizzle:Name')] || 'products';
            const results = await jsonStorage.select(tableName);
            return limit ? results.slice(0, limit) : results;
          },
          where: () => ({
            limit: async (limit?: number) => {
              const tableName = table[Symbol.for('drizzle:Name')] || 'products';
              const results = await jsonStorage.select(tableName);
              return limit ? results.slice(0, limit) : results;
            }
          })
        })
      }),
      insert: (table: any) => ({
        values: async (values: any) => {
          const tableName = table[Symbol.for('drizzle:Name')] || 'products';
          return jsonStorage.insert(tableName, values);
        }
      }),
      update: (table: any) => ({
        set: (values: any) => ({
          where: async (condition: any) => {
            const tableName = table[Symbol.for('drizzle:Name')] || 'products';
            // Simple ID-based update for now
            const id = condition.id || 1;
            return jsonStorage.update(tableName, id, values);
          }
        })
      }),
      delete: (table: any) => ({
        where: async (condition: any) => {
          const tableName = table[Symbol.for('drizzle:Name')] || 'products';
          const id = condition.id || 1;
          return jsonStorage.delete(tableName, id);
        }
      }),
      query: jsonStorage.query
    };
    
    return db;
  }
}

// Initialize database on module load
const dbPromise = initializeDatabase();

export { dbPromise as db, pool };
