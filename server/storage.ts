import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { users, addresses, visits, sales, tournees, type User, type InsertUser, type Address, type InsertAddress, type Visit, type InsertVisit, type Sale, type InsertSale, type Tournee, type InsertTournee } from "@shared/schema";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  approveUser(id: number, approvedBy: number): Promise<User>;
  getUnapprovedUsers(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;

  // Addresses
  getAddresses(filters?: { status?: string; assignedTo?: number; city?: string }): Promise<Address[]>;
  getAddress(id: number): Promise<Address | undefined>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address>;
  deleteAddress(id: number): Promise<void>;
  getAddressesByBounds(bounds: { north: number; south: number; east: number; west: number }): Promise<Address[]>;

  // Visits
  getVisits(addressId?: number, pompierId?: number): Promise<Visit[]>;
  createVisit(visit: InsertVisit): Promise<Visit>;
  getVisitsByAddress(addressId: number): Promise<Visit[]>;

  // Sales
  getSales(filters?: { pompierId?: number; startDate?: Date; endDate?: Date }): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  getSalesStats(): Promise<{ totalSales: number; totalAmount: number; calendarsSold: number }>;

  // Tournees
  getTournees(pompierId?: number): Promise<Tournee[]>;
  createTournee(tournee: InsertTournee): Promise<Tournee>;
  updateTournee(id: number, tournee: Partial<InsertTournee>): Promise<Tournee>;
  deleteTournee(id: number): Promise<void>;
}

export class SupabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
    if (error) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase.from("users").select("*").eq("username", username).single();
    if (error) return undefined;
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single();
    if (error) return undefined;
    return data as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase.from("users").insert(user).select().single();
    if (error) throw error;
    return data as User;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User> {
    const { data, error } = await supabase.from("users").update(user).eq("id", id).select().single();
    if (error) throw error;
    return data as User;
  }

  async approveUser(id: number, approvedBy: number): Promise<User> {
    const { data, error } = await supabase.from("users").update({ isApproved: true, approvedBy }).eq("id", id).select().single();
    if (error) throw error;
    return data as User;
  }

  async getUnapprovedUsers(): Promise<User[]> {
    const { data, error } = await supabase.from("users").select("*").eq("isApproved", false);
    if (error) throw error;
    return data as User[];
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase.from("users").select("*").order("createdAt", { ascending: true });
    if (error) throw error;
    return data as User[];
  }

  // Addresses
  async getAddresses(filters?: { status?: string; assignedTo?: number; city?: string }): Promise<Address[]> {
    let query = supabase.from("addresses").select("*");
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.assignedTo) query = query.eq("assignedTo", filters.assignedTo);
    if (filters?.city) query = query.eq("city", filters.city);
    query = query.order("createdAt", { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    return data as Address[];
  }

  async getAddress(id: number): Promise<Address | undefined> {
    const { data, error } = await supabase.from("addresses").select("*").eq("id", id).single();
    if (error) return undefined;
    return data as Address;
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const { data, error } = await supabase.from("addresses").insert(address).select().single();
    if (error) throw error;
    return data as Address;
  }

  async updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address> {
    const { data, error } = await supabase.from("addresses").update(address).eq("id", id).select().single();
    if (error) throw error;
    return data as Address;
  }

  async deleteAddress(id: number): Promise<void> {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) throw error;
  }

  async getAddressesByBounds(bounds: { north: number; south: number; east: number; west: number }): Promise<Address[]> {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .gte("latitude", bounds.south)
      .lte("latitude", bounds.north)
      .gte("longitude", bounds.west)
      .lte("longitude", bounds.east);
    if (error) throw error;
    return data as Address[];
  }

  // Visits
  async getVisits(addressId?: number, pompierId?: number): Promise<Visit[]> {
    let query = supabase.from("visits").select("*");
    if (addressId) query = query.eq("addressId", addressId);
    if (pompierId) query = query.eq("pompierId", pompierId);
    query = query.order("createdAt", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data as Visit[];
  }

  async createVisit(visit: InsertVisit): Promise<Visit> {
    const { data, error } = await supabase.from("visits").insert(visit).select().single();
    if (error) throw error;
    return data as Visit;
  }

  async getVisitsByAddress(addressId: number): Promise<Visit[]> {
    const { data, error } = await supabase.from("visits").select("*").eq("addressId", addressId).order("createdAt", { ascending: false });
    if (error) throw error;
    return data as Visit[];
  }

  // Sales
  async getSales(filters?: { pompierId?: number; startDate?: Date; endDate?: Date }): Promise<Sale[]> {
    let query = supabase.from("sales").select("*");
    if (filters?.pompierId) query = query.eq("pompierId", filters.pompierId);
    if (filters?.startDate) query = query.gte("createdAt", filters.startDate.toISOString());
    if (filters?.endDate) query = query.lte("createdAt", filters.endDate.toISOString());
    query = query.order("createdAt", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data as Sale[];
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const { data, error } = await supabase.from("sales").insert(sale).select().single();
    if (error) throw error;
    return data as Sale;
  }

  async getSalesStats(): Promise<{ totalSales: number; totalAmount: number; calendarsSold: number }> {
    const { data, error } = await supabase.from("sales").select("*");
    if (error) throw error;
    const totalSales = data?.length ?? 0;
    const totalAmount = data?.reduce((sum: number, sale: any) => sum + parseFloat(sale.amount), 0) ?? 0;
    const calendarsSold = totalSales;
    return { totalSales, totalAmount, calendarsSold };
  }

  // Tournees
  async getTournees(pompierId?: number): Promise<Tournee[]> {
    let query = supabase.from("tournees").select("*");
    if (pompierId) query = query.eq("pompierId", pompierId);
    query = query.order("createdAt", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data as Tournee[];
  }

  async createTournee(tournee: InsertTournee): Promise<Tournee> {
    const { data, error } = await supabase.from("tournees").insert(tournee).select().single();
    if (error) throw error;
    return data as Tournee;
  }

  async updateTournee(id: number, tournee: Partial<InsertTournee>): Promise<Tournee> {
    const { data, error } = await supabase.from("tournees").update(tournee).eq("id", id).select().single();
    if (error) throw error;
    return data as Tournee;
  }

  async deleteTournee(id: number): Promise<void> {
    const { error } = await supabase.from("tournees").delete().eq("id", id);
    if (error) throw error;
  }
}

export const storage = new SupabaseStorage();