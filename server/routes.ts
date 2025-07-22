import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { insertUserSchema, insertAddressSchema, insertVisitSchema, insertSaleSchema, insertTourneeSchema } from "@shared/schema";
import { z } from "zod";
import { addressLoader } from "./utils/address-loader";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Don't send password back
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      console.log("Fetched user:", user);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (!user.isApproved) {
        return res.status(403).json({ message: "Account not approved yet" });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't send password back
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // User management routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/unapproved", async (req, res) => {
    try {
      const users = await storage.getUnapprovedUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unapproved users" });
    }
  });

  app.post("/api/users/:id/approve", async (req, res) => {
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

  // Address routes
  app.get("/api/addresses", async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string,
        assignedTo: req.query.assignedTo ? parseInt(req.query.assignedTo as string) : undefined,
        city: req.query.city as string
      };
      
      const addresses = await storage.getAddresses(filters);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });

  app.get("/api/addresses/:id", async (req, res) => {
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

  app.post("/api/addresses", async (req, res) => {
    try {
      const addressData = insertAddressSchema.parse(req.body);
      const address = await storage.createAddress(addressData);
      res.json(address);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/addresses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const addressData = insertAddressSchema.partial().parse(req.body);
      const address = await storage.updateAddress(id, addressData);
      res.json(address);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.delete("/api/addresses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAddress(id);
      res.json({ message: "Address deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete address" });
    }
  });

  // Visit routes
  app.get("/api/visits", async (req, res) => {
    try {
      const addressId = req.query.addressId ? parseInt(req.query.addressId as string) : undefined;
      const pompierId = req.query.pompierId ? parseInt(req.query.pompierId as string) : undefined;
      
      const visits = await storage.getVisits(addressId, pompierId);
      res.json(visits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visits" });
    }
  });

  app.get("/api/visits/address/:addressId", async (req, res) => {
    try {
      const addressId = parseInt(req.params.addressId);
      const visits = await storage.getVisitsByAddress(addressId);
      res.json(visits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visits for address" });
    }
  });

  app.post("/api/visits", async (req, res) => {
    try {
      // Convert amount to string if it's a number
      if (typeof req.body.amount === 'number') {
        req.body.amount = req.body.amount.toString();
      }
      
      const visitData = insertVisitSchema.parse(req.body);
      const visit = await storage.createVisit(visitData);
      
      // Update address status based on visit
      await storage.updateAddress(visit.addressId, { status: visit.status });
      
      res.json(visit);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Sales routes
  app.get("/api/sales", async (req, res) => {
    try {
      const filters = {
        pompierId: req.query.pompierId ? parseInt(req.query.pompierId as string) : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };
      
      const sales = await storage.getSales(filters);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.get("/api/sales/stats", async (req, res) => {
    try {
      const stats = await storage.getSalesStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales stats" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      // Convert amount to string if it's a number
      if (typeof req.body.amount === 'number') {
        req.body.amount = req.body.amount.toString();
      }
      
      const saleData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(saleData);
      
      // Update address status to sold
      await storage.updateAddress(sale.addressId, { status: "sold" });
      
      res.json(sale);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Tournee routes
  app.get("/api/tournees", async (req, res) => {
    try {
      const pompierId = req.query.pompierId ? parseInt(req.query.pompierId as string) : undefined;
      const tournees = await storage.getTournees(pompierId);
      res.json(tournees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tournees" });
    }
  });

  app.post("/api/tournees", async (req, res) => {
    try {
      const tourneeData = insertTourneeSchema.parse(req.body);
      const tournee = await storage.createTournee(tourneeData);
      res.json(tournee);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.put("/api/tournees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tourneeData = insertTourneeSchema.partial().parse(req.body);
      const tournee = await storage.updateTournee(id, tourneeData);
      res.json(tournee);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.delete("/api/tournees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTournee(id);
      res.json({ message: "Tournee deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tournee" });
    }
  });

  // External API routes for geocoding
  app.get("/api/geocode", async (req, res) => {
    try {
      const { address } = req.query;
      
      if (!address) {
        return res.status(400).json({ message: "Address parameter required" });
      }
      
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address as string)}&limit=1`);
      const data = await response.json();
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to geocode address" });
    }
  });

  // Address loading routes
  app.post("/api/addresses/load-from-osm", async (req, res) => {
    try {
      console.log("🔄 Démarrage du chargement automatique des adresses...");
      const results = await addressLoader.loadAddressesFromOSM();
      
      res.json({
        success: true,
        message: `Chargement terminé: ${results.loaded} adresses ajoutées, ${results.skipped} ignorées, ${results.errors} erreurs`,
        results
      });
    } catch (error) {
      console.error("❌ Erreur lors du chargement des adresses:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erreur lors du chargement des adresses",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });

  app.post("/api/addresses/load-sector", async (req, res) => {
    try {
      const { sector } = req.body;
      
      if (!sector) {
        return res.status(400).json({ message: "Secteur requis" });
      }
      
      const count = await addressLoader.loadSectorAddresses(sector);
      res.json({
        success: true,
        message: `${count} adresses chargées pour le secteur ${sector}`,
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

  app.post("/api/addresses/geocode-missing", async (req, res) => {
    try {
      console.log("🔄 Géocodage des adresses manquantes...");
      const results = await addressLoader.geocodeMissingCoordinates();
      
      res.json({
        success: true,
        message: `Géocodage terminé: ${results.updated} adresses mises à jour, ${results.failed} échecs`,
        results
      });
    } catch (error) {
      console.error("❌ Erreur lors du géocodage:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erreur lors du géocodage",
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
