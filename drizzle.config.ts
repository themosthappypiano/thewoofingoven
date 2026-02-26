import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

// Auto-detect database type based on URL
const isLocal = process.env.DATABASE_URL.startsWith('file:');

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: isLocal ? "sqlite" : "postgresql",
  dbCredentials: isLocal 
    ? { url: process.env.DATABASE_URL }
    : { url: process.env.DATABASE_URL },
});
