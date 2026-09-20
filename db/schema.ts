// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const game = sqliteTable('game', {id: integer('id').primaryKey(), revision: integer('revision').notNull().default(0), data: text('data').notNull()});
