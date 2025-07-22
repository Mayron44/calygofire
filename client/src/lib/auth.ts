import { apiRequest } from "./queryClient";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
  isApproved: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: string;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: AuthUser | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
    const userData = await apiRequest("POST", "/api/auth/login", credentials);

      
      this.currentUser = userData;
      this.setStoredUser(userData);
      
      return userData;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Login failed");
    }
  }

  async register(data: RegisterData): Promise<void> {
    try {
      await apiRequest("POST", "/api/auth/register", data);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Registration failed");
    }
  }

  logout(): void {
    this.currentUser = null;
    this.clearStoredUser();
  }

  getCurrentUser(): AuthUser | null {
    if (!this.currentUser) {
      this.currentUser = this.getStoredUser();
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  canApproveUsers(): boolean {
    return this.hasAnyRole(['Admin', 'Bureau']);
  }

  canManageUsers(): boolean {
    return this.hasRole('Admin');
  }

  canCreateTournees(): boolean {
    return this.hasAnyRole(['Admin', 'Bureau']);
  }

  private setStoredUser(user: AuthUser): void {
    localStorage.setItem("calygo_user", JSON.stringify(user));
  }

  private getStoredUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem("calygo_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private clearStoredUser(): void {
    localStorage.removeItem("calygo_user");
  }
}

export const authService = AuthService.getInstance();

// Utility functions for role-based access control
export const checkPermission = (user: AuthUser | null, requiredRoles: string[]): boolean => {
  if (!user || !user.isApproved) return false;
  return requiredRoles.includes(user.role);
};

export const isAdmin = (user: AuthUser | null): boolean => {
  return checkPermission(user, ['Admin']);
};

export const isBureau = (user: AuthUser | null): boolean => {
  return checkPermission(user, ['Bureau']);
};

export const isAdminOrBureau = (user: AuthUser | null): boolean => {
  return checkPermission(user, ['Admin', 'Bureau']);
};

export const isMembre = (user: AuthUser | null): boolean => {
  return checkPermission(user, ['Membre']);
};

// Password validation utilities
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: "Le mot de passe doit contenir au moins 8 caractères" };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Le mot de passe doit contenir au moins une lettre minuscule" };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Le mot de passe doit contenir au moins une lettre majuscule" };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Le mot de passe doit contenir au moins un chiffre" };
  }
  
  return { isValid: true };
};

// Username validation utilities
export const validateUsername = (username: string): { isValid: boolean; message?: string } => {
  if (username.length < 3) {
    return { isValid: false, message: "Le nom d'utilisateur doit contenir au moins 3 caractères" };
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, message: "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores" };
  }
  
  return { isValid: true };
};

// Email validation utilities
export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Format d'email invalide" };
  }
  
  return { isValid: true };
};
