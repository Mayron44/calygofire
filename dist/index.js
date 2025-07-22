// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_KEY;
var supabase = createClient(supabaseUrl, supabaseKey);
var SupabaseStorage = class {
  // Users
  async getUser(id) {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
    if (error) return void 0;
    return data;
  }
  async getUserByUsername(username) {
    const { data, error } = await supabase.from("users").select("*").eq("username", username).single();
    if (error) return void 0;
    return data;
  }
  async getUserByEmail(email) {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single();
    if (error) return void 0;
    return data;
  }
  async createUser(user) {
    const { data, error } = await supabase.from("users").insert(user).select().single();
    if (error) throw error;
    return data;
  }
  async updateUser(id, user) {
    const { data, error } = await supabase.from("users").update(user).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
  async approveUser(id, approvedBy) {
    const { data, error } = await supabase.from("users").update({ isApproved: true, approvedBy }).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
  async getUnapprovedUsers() {
    const { data, error } = await supabase.from("users").select("*").eq("isApproved", false);
    if (error) throw error;
    return data;
  }
  async getAllUsers() {
    const { data, error } = await supabase.from("users").select("*").order("createdAt", { ascending: true });
    if (error) throw error;
    return data;
  }
  // Addresses
  async getAddresses(filters) {
    let query = supabase.from("addresses").select("*");
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.assignedTo) query = query.eq("assignedTo", filters.assignedTo);
    if (filters?.city) query = query.eq("city", filters.city);
    query = query.order("createdAt", { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
  async getAddress(id) {
    const { data, error } = await supabase.from("addresses").select("*").eq("id", id).single();
    if (error) return void 0;
    return data;
  }
  async createAddress(address) {
    const { data, error } = await supabase.from("addresses").insert(address).select().single();
    if (error) throw error;
    return data;
  }
  async updateAddress(id, address) {
    const { data, error } = await supabase.from("addresses").update(address).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
  async deleteAddress(id) {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) throw error;
  }
  async getAddressesByBounds(bounds) {
    const { data, error } = await supabase.from("addresses").select("*").gte("latitude", bounds.south).lte("latitude", bounds.north).gte("longitude", bounds.west).lte("longitude", bounds.east);
    if (error) throw error;
    return data;
  }
  // Visits
  async getVisits(addressId, pompierId) {
    let query = supabase.from("visits").select("*");
    if (addressId) query = query.eq("addressId", addressId);
    if (pompierId) query = query.eq("pompierId", pompierId);
    query = query.order("createdAt", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
  async createVisit(visit) {
    const { data, error } = await supabase.from("visits").insert(visit).select().single();
    if (error) throw error;
    return data;
  }
  async getVisitsByAddress(addressId) {
    const { data, error } = await supabase.from("visits").select("*").eq("addressId", addressId).order("createdAt", { ascending: false });
    if (error) throw error;
    return data;
  }
  // Sales
  async getSales(filters) {
    let query = supabase.from("sales").select("*");
    if (filters?.pompierId) query = query.eq("pompierId", filters.pompierId);
    if (filters?.startDate) query = query.gte("createdAt", filters.startDate.toISOString());
    if (filters?.endDate) query = query.lte("createdAt", filters.endDate.toISOString());
    query = query.order("createdAt", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
  async createSale(sale) {
    const { data, error } = await supabase.from("sales").insert(sale).select().single();
    if (error) throw error;
    return data;
  }
  async getSalesStats() {
    const { data, error } = await supabase.from("sales").select("*");
    if (error) throw error;
    const totalSales = data?.length ?? 0;
    const totalAmount = data?.reduce((sum, sale) => sum + parseFloat(sale.amount), 0) ?? 0;
    const calendarsSold = totalSales;
    return { totalSales, totalAmount, calendarsSold };
  }
  // Tournees
  async getTournees(pompierId) {
    let query = supabase.from("tournees").select("*");
    if (pompierId) query = query.eq("pompierId", pompierId);
    query = query.order("createdAt", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
  async createTournee(tournee) {
    const { data, error } = await supabase.from("tournees").insert(tournee).select().single();
    if (error) throw error;
    return data;
  }
  async updateTournee(id, tournee) {
    const { data, error } = await supabase.from("tournees").update(tournee).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }
  async deleteTournee(id) {
    const { error } = await supabase.from("tournees").delete().eq("id", id);
    if (error) throw error;
  }
};
var storage = new SupabaseStorage();

// server/routes.ts
import bcrypt from "bcrypt";

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("Membre"),
  // Admin, Bureau, Membre
  isApproved: boolean("is_approved").default(false),
  approvedBy: integer("approved_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  fullAddress: text("full_address").notNull(),
  street: varchar("street", { length: 255 }),
  city: varchar("city", { length: 100 }).default("Sainte-Pazanne"),
  postalCode: varchar("postal_code", { length: 10 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  housingType: varchar("housing_type", { length: 100 }),
  // Maison individuelle, Appartement, etc.
  contactName: varchar("contact_name", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  status: varchar("status", { length: 50 }).default("unvisited"),
  // sold, refused, revisit, unvisited, absent
  assignedTo: integer("assigned_to").references(() => users.id),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  addressId: integer("address_id").references(() => addresses.id).notNull(),
  pompierId: integer("pompier_id").references(() => users.id).notNull(),
  visitDate: timestamp("visit_date").defaultNow(),
  status: varchar("status", { length: 50 }).notNull(),
  // sold, refused, revisit, absent
  amount: decimal("amount", { precision: 10, scale: 2 }),
  paymentMethod: varchar("payment_method", { length: 100 }),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow()
});
var sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  addressId: integer("address_id").references(() => addresses.id).notNull(),
  pompierId: integer("pompier_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 100 }).notNull(),
  saleDate: timestamp("sale_date").defaultNow(),
  receiptGenerated: boolean("receipt_generated").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var tournees = pgTable("tournees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  pompierId: integer("pompier_id").references(() => users.id).notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: varchar("status", { length: 50 }).default("planned"),
  // planned, in_progress, completed, cancelled
  addressIds: text("address_ids").array(),
  // Array of address IDs
  optimizedRoute: text("optimized_route"),
  // JSON string of optimized route
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedBy: true
});
var insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertVisitSchema = createInsertSchema(visits).omit({
  id: true,
  createdAt: true
});
var insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true
});
var insertTourneeSchema = createInsertSchema(tournees).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/routes.ts
import { z } from "zod";

// server/utils/address-loader.ts
var SAINTE_PAZANNE_BOUNDS = {
  north: 47.12,
  south: 47.08,
  east: -1.78,
  west: -1.84
};
var AddressLoader = class _AddressLoader {
  static instance;
  OVERPASS_API = "https://overpass-api.de/api/interpreter";
  NOMINATIM_API = "https://nominatim.openstreetmap.org";
  static getInstance() {
    if (!_AddressLoader.instance) {
      _AddressLoader.instance = new _AddressLoader();
    }
    return _AddressLoader.instance;
  }
  /**
   * Load addresses from OpenStreetMap for Sainte-Pazanne
   */
  async loadAddressesFromOSM() {
    const results = { loaded: 0, skipped: 0, errors: 0 };
    try {
      console.log("\u{1F504} Chargement des adresses depuis OpenStreetMap...");
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["addr:housenumber"]["addr:street"]
            (${SAINTE_PAZANNE_BOUNDS.south},${SAINTE_PAZANNE_BOUNDS.west},${SAINTE_PAZANNE_BOUNDS.north},${SAINTE_PAZANNE_BOUNDS.east});
          way["addr:housenumber"]["addr:street"]
            (${SAINTE_PAZANNE_BOUNDS.south},${SAINTE_PAZANNE_BOUNDS.west},${SAINTE_PAZANNE_BOUNDS.north},${SAINTE_PAZANNE_BOUNDS.east});
        );
        out center;
      `;
      const response = await fetch(this.OVERPASS_API, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(overpassQuery)}`
      });
      if (!response.ok) {
        throw new Error(`Erreur API Overpass: ${response.status}`);
      }
      const data = await response.json();
      const addresses2 = data.elements || [];
      console.log(`\u{1F4CD} ${addresses2.length} adresses trouv\xE9es sur OpenStreetMap`);
      for (const addr of addresses2) {
        try {
          await this.processAddress(addr);
          results.loaded++;
        } catch (error) {
          console.error(`\u274C Erreur lors du traitement de l'adresse:`, error);
          results.errors++;
        }
        await this.delay(100);
      }
      console.log(`\u2705 Chargement termin\xE9: ${results.loaded} adresses ajout\xE9es, ${results.skipped} ignor\xE9es, ${results.errors} erreurs`);
      return results;
    } catch (error) {
      console.error("\u274C Erreur lors du chargement des adresses:", error);
      throw error;
    }
  }
  /**
   * Process a single address from OSM data
   */
  async processAddress(osmAddr) {
    const tags = osmAddr.tags || {};
    const houseNumber = tags["addr:housenumber"];
    const street = tags["addr:street"];
    const postcode = tags["addr:postcode"] || "44680";
    const city = tags["addr:city"] || tags["addr:village"] || "Sainte-Pazanne";
    if (!houseNumber || !street) {
      return;
    }
    const fullAddress = `${houseNumber} ${street}, ${postcode} ${city}`;
    let lat, lon;
    if (osmAddr.lat && osmAddr.lon) {
      lat = parseFloat(osmAddr.lat);
      lon = parseFloat(osmAddr.lon);
    } else if (osmAddr.center) {
      lat = osmAddr.center.lat;
      lon = osmAddr.center.lon;
    } else {
      return;
    }
    const existingAddresses = await storage.getAddresses();
    const exists = existingAddresses.some(
      (addr) => addr.fullAddress.toLowerCase() === fullAddress.toLowerCase()
    );
    if (exists) {
      return;
    }
    const addressData = {
      fullAddress,
      latitude: lat.toString(),
      longitude: lon.toString(),
      city,
      postalCode: postcode,
      status: "unvisited",
      notes: "Charg\xE9 automatiquement depuis OpenStreetMap"
    };
    await storage.createAddress(addressData);
  }
  /**
   * Load specific sectors of Sainte-Pazanne
   */
  async loadSectorAddresses(sectorName) {
    console.log(`\u{1F504} Chargement des adresses pour le secteur: ${sectorName}`);
    const sectorBounds = this.getSectorBounds(sectorName);
    if (!sectorBounds) {
      throw new Error(`Secteur inconnu: ${sectorName}`);
    }
    return 0;
  }
  /**
   * Get geographic bounds for different sectors of Sainte-Pazanne
   */
  getSectorBounds(sector) {
    const sectors = {
      "centre-ville": {
        north: 47.105,
        south: 47.095,
        east: -1.805,
        west: -1.815
      },
      "closeaux": {
        north: 47.115,
        south: 47.1,
        east: -1.795,
        west: -1.81
      },
      "bernardiere": {
        north: 47.11,
        south: 47.09,
        east: -1.79,
        west: -1.82
      }
    };
    return sectors[sector] || null;
  }
  /**
   * Geocode addresses that are missing coordinates
   */
  async geocodeMissingCoordinates() {
    const results = { updated: 0, failed: 0 };
    const addresses2 = await storage.getAddresses();
    for (const address of addresses2) {
      if (!address.latitude || !address.longitude) {
        try {
          const coords = await this.geocodeAddress(address.fullAddress);
          if (coords) {
            await storage.updateAddress(address.id, {
              latitude: coords.lat.toString(),
              longitude: coords.lon.toString()
            });
            results.updated++;
          } else {
            results.failed++;
          }
        } catch (error) {
          console.error(`\u274C Erreur g\xE9ocodage pour ${address.fullAddress}:`, error);
          results.failed++;
        }
        await this.delay(1e3);
      }
    }
    return results;
  }
  /**
   * Geocode a single address using Nominatim
   */
  async geocodeAddress(address) {
    try {
      const response = await fetch(
        `${this.NOMINATIM_API}/search?format=json&q=${encodeURIComponent(address + ", Sainte-Pazanne, France")}&limit=1`
      );
      if (!response.ok) return null;
      const data = await response.json();
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
    } catch (error) {
      console.error("Erreur g\xE9ocodage:", error);
    }
    return null;
  }
  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};
var addressLoader = AddressLoader.getInstance();

// server/routes.ts
var loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      console.log("Fetched user:", user);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (!user.is_approved) {
        return res.status(403).json({ message: "Account not approved yet" });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.get("/api/users", async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const usersWithoutPasswords = users2.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/users/unapproved", async (req, res) => {
    try {
      const users2 = await storage.getUnapprovedUsers();
      const usersWithoutPasswords = users2.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unapproved users" });
    }
  });
  app2.post("/api/users/:id/approve", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const approvedBy = req.body.approvedBy;
      const user = await storage.approveUser(userId, approvedBy);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve user" });
    }
  });
  app2.get("/api/addresses", async (req, res) => {
    try {
      const filters = {
        status: req.query.status,
        assignedTo: req.query.assignedTo ? parseInt(req.query.assignedTo) : void 0,
        city: req.query.city
      };
      const addresses2 = await storage.getAddresses(filters);
      res.json(addresses2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });
  app2.get("/api/addresses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const address = await storage.getAddress(id);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.json(address);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch address" });
    }
  });
  app2.post("/api/addresses", async (req, res) => {
    try {
      const addressData = insertAddressSchema.parse(req.body);
      const address = await storage.createAddress(addressData);
      res.json(address);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/addresses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const addressData = insertAddressSchema.partial().parse(req.body);
      const address = await storage.updateAddress(id, addressData);
      res.json(address);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.delete("/api/addresses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAddress(id);
      res.json({ message: "Address deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete address" });
    }
  });
  app2.get("/api/visits", async (req, res) => {
    try {
      const addressId = req.query.addressId ? parseInt(req.query.addressId) : void 0;
      const pompierId = req.query.pompierId ? parseInt(req.query.pompierId) : void 0;
      const visits2 = await storage.getVisits(addressId, pompierId);
      res.json(visits2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visits" });
    }
  });
  app2.get("/api/visits/address/:addressId", async (req, res) => {
    try {
      const addressId = parseInt(req.params.addressId);
      const visits2 = await storage.getVisitsByAddress(addressId);
      res.json(visits2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visits for address" });
    }
  });
  app2.post("/api/visits", async (req, res) => {
    try {
      if (typeof req.body.amount === "number") {
        req.body.amount = req.body.amount.toString();
      }
      const visitData = insertVisitSchema.parse(req.body);
      const visit = await storage.createVisit(visitData);
      await storage.updateAddress(visit.addressId, { status: visit.status });
      res.json(visit);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.get("/api/sales", async (req, res) => {
    try {
      const filters = {
        pompierId: req.query.pompierId ? parseInt(req.query.pompierId) : void 0,
        startDate: req.query.startDate ? new Date(req.query.startDate) : void 0,
        endDate: req.query.endDate ? new Date(req.query.endDate) : void 0
      };
      const sales2 = await storage.getSales(filters);
      res.json(sales2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });
  app2.get("/api/sales/stats", async (req, res) => {
    try {
      const stats = await storage.getSalesStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales stats" });
    }
  });
  app2.post("/api/sales", async (req, res) => {
    try {
      if (typeof req.body.amount === "number") {
        req.body.amount = req.body.amount.toString();
      }
      const saleData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(saleData);
      await storage.updateAddress(sale.addressId, { status: "sold" });
      res.json(sale);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.get("/api/tournees", async (req, res) => {
    try {
      const pompierId = req.query.pompierId ? parseInt(req.query.pompierId) : void 0;
      const tournees2 = await storage.getTournees(pompierId);
      res.json(tournees2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tournees" });
    }
  });
  app2.post("/api/tournees", async (req, res) => {
    try {
      const tourneeData = insertTourneeSchema.parse(req.body);
      const tournee = await storage.createTournee(tourneeData);
      res.json(tournee);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.put("/api/tournees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tourneeData = insertTourneeSchema.partial().parse(req.body);
      const tournee = await storage.updateTournee(id, tourneeData);
      res.json(tournee);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });
  app2.delete("/api/tournees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTournee(id);
      res.json({ message: "Tournee deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tournee" });
    }
  });
  app2.get("/api/geocode", async (req, res) => {
    try {
      const { address } = req.query;
      if (!address) {
        return res.status(400).json({ message: "Address parameter required" });
      }
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to geocode address" });
    }
  });
  app2.post("/api/addresses/load-from-osm", async (req, res) => {
    try {
      console.log("\u{1F504} D\xE9marrage du chargement automatique des adresses...");
      const results = await addressLoader.loadAddressesFromOSM();
      res.json({
        success: true,
        message: `Chargement termin\xE9: ${results.loaded} adresses ajout\xE9es, ${results.skipped} ignor\xE9es, ${results.errors} erreurs`,
        results
      });
    } catch (error) {
      console.error("\u274C Erreur lors du chargement des adresses:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors du chargement des adresses",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });
  app2.post("/api/addresses/load-sector", async (req, res) => {
    try {
      const { sector } = req.body;
      if (!sector) {
        return res.status(400).json({ message: "Secteur requis" });
      }
      const count = await addressLoader.loadSectorAddresses(sector);
      res.json({
        success: true,
        message: `${count} adresses charg\xE9es pour le secteur ${sector}`,
        count
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors du chargement du secteur",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });
  app2.post("/api/addresses/geocode-missing", async (req, res) => {
    try {
      console.log("\u{1F504} G\xE9ocodage des adresses manquantes...");
      const results = await addressLoader.geocodeMissingCoordinates();
      res.json({
        success: true,
        message: `G\xE9ocodage termin\xE9: ${results.updated} adresses mises \xE0 jour, ${results.failed} \xE9checs`,
        results
      });
    } catch (error) {
      console.error("\u274C Erreur lors du g\xE9ocodage:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors du g\xE9ocodage",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
