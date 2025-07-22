# Calygo Fire - Firefighters Calendar Sales Management

## Overview

Calygo Fire is a web application designed for firefighters to manage calendar sales efficiently. It features a public-facing website and a secure intranet with role-based access control. The application includes interactive mapping, sales tracking, and user management capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom fire-themed color palette (blue to red gradient)
- **Mobile Support**: Responsive design with PWA capabilities

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with JSON responses
- **Authentication**: Session-based auth with bcrypt for password hashing
- **Database ORM**: Drizzle ORM for type-safe database operations

### Database Strategy
- **Primary Database**: PostgreSQL (local development, Supabase planned for production)
- **Schema Management**: Drizzle migrations with schema-first approach
- **Connection**: Local PostgreSQL for development, Supabase integration prepared
- **Note**: Supabase URL configured (https://rhobxmxdthuctmfwyhbk.supabase.co), connection migration in progress

## Key Components

### Authentication & Authorization
- **User Registration**: Public registration with admin approval workflow
- **Role System**: Three-tier access (Admin, Bureau, Membre)
- **Session Management**: Express sessions with PostgreSQL storage
- **Password Security**: bcrypt hashing with salt rounds

### Mapping Integration
- **Map Provider**: OpenStreetMap with Leaflet for interactive maps
- **Geocoding**: Nominatim API for address-to-coordinates conversion
- **Address Management**: Overpass API integration for automatic address loading
- **Geolocation**: Browser geolocation API for user positioning

### Sales Management
- **Address Tracking**: Comprehensive address database with visit status
- **Sales Recording**: Transaction tracking with payment methods
- **Visit Management**: Status tracking (sold, refused, revisit, absent, unvisited)
- **Statistics**: Real-time sales analytics and performance metrics

### User Interface
- **Theme**: Custom fire department theme with blue-to-red gradient
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Accessibility**: ARIA-compliant components with keyboard navigation
- **Progressive Web App**: Service worker integration for offline capabilities

## Data Flow

### User Registration Flow
1. User submits registration form with role selection
2. Password is hashed using bcrypt
3. User account created with `isApproved: false`
4. Bureau/Admin users can approve pending registrations
5. Approved users gain access to protected routes

### Sales Management Flow
1. Addresses are loaded from external APIs or manually entered
2. Addresses are assigned to firefighters (pompiers)
3. Firefighters visit addresses and record outcomes
4. Sales data is aggregated for reporting and analytics
5. Real-time updates reflect on dashboard and maps

### Map Integration Flow
1. Addresses are geocoded using Nominatim API
2. Coordinates are stored in database for fast retrieval
3. Map displays addresses with color-coded status markers
4. Users can filter by pompier, status, or geographic area
5. Click interactions open detailed address information

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm**: Type-safe database operations
- **bcrypt**: Password hashing and verification
- **express**: Web server framework
- **leaflet**: Interactive mapping library

### UI Dependencies
- **@radix-ui/***: Accessible component primitives
- **@tanstack/react-query**: Server state management
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

### Development Dependencies
- **typescript**: Type checking and compilation
- **vite**: Build tool and development server
- **drizzle-kit**: Database schema management

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Development PostgreSQL instance
- **Environment Variables**: `.env` file for configuration

### Production Build
- **Frontend**: Vite build with optimized bundle
- **Backend**: esbuild compilation to ES modules
- **Static Assets**: Served from `dist/public` directory
- **Database**: Production PostgreSQL with connection pooling

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment flag (development/production)
- **Session Configuration**: Secure session management in production

### Deployment Requirements
- Node.js 18+ runtime environment
- PostgreSQL database (Neon serverless recommended)
- Environment variables properly configured
- SSL/TLS certificates for HTTPS in production

The application follows a monorepo structure with shared types and utilities, enabling type safety across the full stack while maintaining clear separation of concerns between frontend and backend code.

## Recent Changes: Latest modifications with dates

### 2025-07-16 - API Corrections & Tournées Implementation
- **Fixed API Request Handler**: Corrected `apiRequest` function to return JSON data directly, resolving "body stream already read" errors
- **Enhanced Sales Modal**: Made customer name, phone, and notes optional in sale entry form
- **Improved Geocoding**: Added building-level precision for better address marker placement
- **Complete Tournées System**: 
  - Created full tournées management page with CRUD operations
  - Implemented route optimization using nearest neighbor algorithm
  - Added address selection and pompier assignment
  - Status tracking (planned, in_progress, completed, cancelled)
- **Data Validation**: Added automatic type conversion for monetary amounts in API routes
- **Navigation Fix**: Removed non-existent payments route from sidebar navigation