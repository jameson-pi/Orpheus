import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export const db = (function() {
  if (_db) return _db;
  
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not defined in environment variables.");
    return null;
  }
  
  try {
    const sql = neon(url);
    _db = drizzle(sql, { schema });
    return _db;
  } catch (error) {
    console.error("Failed to initialize database connection:", error);
    return null;
  }
})();

export function getDb() {
  return db;
}
