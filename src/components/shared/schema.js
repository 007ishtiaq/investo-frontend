import { createInsertSchema } from "drizzle-zod";
import {
  pgTable,
  text,
  integer,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { z } from "zod";

// Define the users table
export const users = pgTable("users", {
  id: integer("id").primaryKey(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  isVerified: integer("is_verified").default(0),
  totalSales: numeric("total_sales").default("0"),
  createdAt: timestamp("created_at"),
});

// Define the collections table
export const collections = pgTable("collections", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at"),
  creatorId: integer("creator_id").references(() => users.id),
  itemCount: integer("item_count"),
  floorPrice: numeric("floor_price"),
});

// Define the NFTs table
export const nfts = pgTable("nfts", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  price: numeric("price"),
  currency: text("currency").default("ETH"),
  collectionId: integer("collection_id").references(() => collections.id),
  creatorId: integer("creator_id").references(() => users.id),
  ownerId: integer("owner_id").references(() => users.id),
  tokenId: text("token_id"),
  blockchain: text("blockchain").default("Ethereum"),
  category: text("category"),
  status: text("status").default("on_sale"),
  createdAt: timestamp("created_at"),
  endTime: timestamp("end_time"),
});

// Create insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  avatar: true,
  bio: true,
  isVerified: true,
  totalSales: true,
  createdAt: true,
});

export const insertCollectionSchema = createInsertSchema(collections).pick({
  name: true,
  description: true,
  coverImage: true,
  creatorId: true,
  itemCount: true,
  floorPrice: true,
  createdAt: true,
});

export const insertNftSchema = createInsertSchema(nfts).pick({
  name: true,
  description: true,
  image: true,
  price: true,
  currency: true,
  collectionId: true,
  creatorId: true,
  ownerId: true,
  tokenId: true,
  blockchain: true,
  category: true,
  status: true,
  createdAt: true,
  endTime: true,
});
