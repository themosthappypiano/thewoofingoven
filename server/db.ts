import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { JSONStorageAdapter } from "./storage-adapter";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";

// Auto-detect database type based on URL
const isLocal = DATABASE_URL.startsWith("file:");

let db: any;
let pool: any;

function getTableName(table: any) {
  return table?.[Symbol.for("drizzle:Name")] || "products";
}

function toCamelCase(value: string) {
  return value.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase());
}

function getRecordValue(record: Record<string, any>, fieldName: string) {
  if (fieldName in record) {
    return record[fieldName];
  }

  const camelFieldName = toCamelCase(fieldName);
  if (camelFieldName in record) {
    return record[camelFieldName];
  }

  return undefined;
}

function createWhereFilter(condition: any) {
  const chunks = condition?.queryChunks;
  const fieldName = chunks?.[1]?.name;
  const expectedValue = chunks?.[3]?.value;

  if (!fieldName) {
    return (_record: Record<string, any>) => true;
  }

  return (record: Record<string, any>) => getRecordValue(record, fieldName) === expectedValue;
}

function createJsonDb(jsonStorage: JSONStorageAdapter) {
  const runSelect = async (table: any, whereCondition?: any, limitCount?: number) => {
    const tableName = getTableName(table);
    let results = await jsonStorage.select(tableName);

    if (whereCondition) {
      const filter = createWhereFilter(whereCondition);
      results = results.filter(filter);
    }

    if (typeof limitCount === "number") {
      results = results.slice(0, limitCount);
    }

    return results;
  };

  const buildSelectQuery = (table: any, whereCondition?: any) => ({
    where(condition: any) {
      return buildSelectQuery(table, condition);
    },
    limit(limitCount?: number) {
      return runSelect(table, whereCondition, limitCount);
    },
    then(resolve: any, reject: any) {
      return runSelect(table, whereCondition).then(resolve, reject);
    },
  });

  const insertIntoTable = async (table: any, values: Record<string, any> | Record<string, any>[]) => {
    const tableName = getTableName(table);
    const records = Array.isArray(values) ? values : [values];
    const inserted = [];

    for (const record of records) {
      inserted.push(await jsonStorage.insert(tableName, record));
    }

    return inserted;
  };

  const createInsertBuilder = (table: any) => ({
    values(values: Record<string, any> | Record<string, any>[]) {
      const insertedPromise = insertIntoTable(table, values);
      return {
        returning() {
          return insertedPromise;
        },
        then(resolve: any, reject: any) {
          return insertedPromise.then(resolve, reject);
        },
      };
    },
  });

  const baseDb = {
    select: () => ({
      from(table: any) {
        return buildSelectQuery(table);
      },
    }),
    insert(table: any) {
      return createInsertBuilder(table);
    },
    transaction(callback: (tx: any) => Promise<any>) {
      return callback({
        insert(table: any) {
          return createInsertBuilder(table);
        },
      });
    },
    query: jsonStorage.query,
  };

  return baseDb;
}

async function initializeDatabase() {
  try {
    if (isLocal) {
      const jsonStorage = new JSONStorageAdapter("./storage.json");
      await jsonStorage.initialize();
      db = createJsonDb(jsonStorage);
    } else {
      pool = new Pool({ connectionString: DATABASE_URL });
      db = drizzle(pool, { schema });
    }
    
    // Test the connection
    if (db.select) {
      await db.select().from(schema.products).limit(1);
    }
    
    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.warn("Database initialization failed, falling back to JSON storage:", error.message);
    
    // Fallback to JSON storage
    const jsonStorage = new JSONStorageAdapter("./storage.json");
    await jsonStorage.initialize();

    db = createJsonDb(jsonStorage);

    return db;
  }
}

// Initialize database on module load
const dbPromise = initializeDatabase();

export { dbPromise as db, pool };
