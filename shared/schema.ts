import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Credit Cards table
export const creditCards = pgTable("credit_cards", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  issuer: varchar("issuer", { length: 255 }).notNull(),
  joiningFee: decimal("joining_fee", { precision: 10, scale: 2 }).notNull(),
  annualFee: decimal("annual_fee", { precision: 10, scale: 2 }).notNull(),
  rewardType: varchar("reward_type", { length: 100 }).notNull(),
  rewardRate: varchar("reward_rate", { length: 255 }).notNull(),
  eligibilityCriteria: text("eligibility_criteria").notNull(),
  specialPerks: jsonb("special_perks").notNull(), // Array of perks
  affiliateLink: varchar("affiliate_link", { length: 500 }),
  applyLink: varchar("apply_link", { length: 500 }),
  cardType: varchar("card_type", { length: 100 }).notNull(), // cashback, travel, dining, fuel, etc.
  minCreditScore: integer("min_credit_score"),
  minIncome: decimal("min_income", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Favorites table
export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  cardId: integer("card_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat History table
export const chatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  sessionId: varchar("session_id").notNull(),
  message: text("message").notNull(),
  isUser: boolean("is_user").notNull(),
  recommendations: jsonb("recommendations"), // Array of recommended card IDs
  userProfile: jsonb("user_profile"), // Store user preferences/profile data
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  favorites: many(userFavorites),
  chatHistory: many(chatHistory),
}));

export const creditCardsRelations = relations(creditCards, ({ many }) => ({
  favorites: many(userFavorites),
}));

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id],
  }),
  card: one(creditCards, {
    fields: [userFavorites.cardId],
    references: [creditCards.id],
  }),
}));

export const chatHistoryRelations = relations(chatHistory, ({ one }) => ({
  user: one(users, {
    fields: [chatHistory.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertCreditCardSchema = createInsertSchema(creditCards).omit({
  id: true,
  createdAt: true,
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

export const insertChatHistorySchema = createInsertSchema(chatHistory).omit({
  id: true,
  timestamp: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type CreditCard = typeof creditCards.$inferSelect;
export type InsertCreditCard = z.infer<typeof insertCreditCardSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type ChatHistory = typeof chatHistory.$inferSelect;
export type InsertChatHistory = z.infer<typeof insertChatHistorySchema>;
