import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email"), 
  created_at: text("created_at").default("CURRENT_TIMESTAMP"),
  last_logged_in: text("last_logged_in").default("CURRENT_TIMESTAMP"),
});
