import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("Membre"), // Admin, Bureau, Membre
  isApproved: boolean("is_approved").default(false),
  approvedBy: integer("approved_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  fullAddress: text("full_address").notNull(),
  street: varchar("street", { length: 255 }),
  city: varchar("city", { length: 100 }).default("Sainte-Pazanne"),
  postalCode: varchar("postal_code", { length: 10 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  housingType: varchar("housing_type", { length: 100 }), // Maison individuelle, Appartement, etc.
  contactName: varchar("contact_name", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  status: varchar("status", { length: 50 }).default("unvisited"), // sold, refused, revisit, unvisited, absent
  assignedTo: integer("assigned_to").references(() => users.id),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  addressId: integer("address_id").references(() => addresses.id).notNull(),
  pompierId: integer("pompier_id").references(() => users.id).notNull(),
  visitDate: timestamp("visit_date").defaultNow(),
  status: varchar("status", { length: 50 }).notNull(), // sold, refused, revisit, absent
  amount: decimal("amount", { precision: 10, scale: 2 }),
  paymentMethod: varchar("payment_method", { length: 100 }),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  addressId: integer("address_id").references(() => addresses.id).notNull(),
  pompierId: integer("pompier_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 100 }).notNull(),
  saleDate: timestamp("sale_date").defaultNow(),
  receiptGenerated: boolean("receipt_generated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tournees = pgTable("tournees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  pompierId: integer("pompier_id").references(() => users.id).notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: varchar("status", { length: 50 }).default("planned"), // planned, in_progress, completed, cancelled
  addressIds: text("address_ids").array(), // Array of address IDs
  optimizedRoute: text("optimized_route"), // JSON string of optimized route
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedBy: true,
});

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVisitSchema = createInsertSchema(visits).omit({
  id: true,
  createdAt: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertTourneeSchema = createInsertSchema(tournees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Visit = typeof visits.$inferSelect;
export type InsertVisit = z.infer<typeof insertVisitSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Tournee = typeof tournees.$inferSelect;
export type InsertTournee = z.infer<typeof insertTourneeSchema>;
