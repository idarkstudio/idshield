# Overview

IDShield is a privacy-focused identity and data management application that uses zero-knowledge proofs for secure data verification. The application allows users to manage their personal data in a secure vault, control access permissions, and generate cryptographic proofs without revealing sensitive information. It features a dashboard for monitoring privacy levels, managing access requests, and tracking audit logs.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with React and TypeScript using Vite as the build tool. It follows a component-based architecture with shadcn/ui components for consistent design. The application uses Wouter for client-side routing and TanStack Query for server state management. The UI is styled with Tailwind CSS and follows a modular component structure with reusable UI primitives.

## Backend Architecture
The backend is an Express.js server with TypeScript that provides RESTful API endpoints. It uses a layered architecture with route handlers in `server/routes.ts` and a storage abstraction layer in `server/storage.ts`. The server includes middleware for request logging and error handling. The current implementation uses in-memory storage but is designed to be easily swapped with a database implementation.

## Data Storage Solutions
The application is configured to use PostgreSQL with Drizzle ORM for database operations. The schema is defined in `shared/schema.ts` with tables for users, vault items, access requests, audit logs, and zero-knowledge proofs. The storage layer implements an interface-based design pattern that supports both in-memory storage (for development) and database persistence.

## Authentication and Authorization Mechanisms
The application uses decentralized identity (DID) addresses for user identification. Each user has a unique DID address that serves as their identity anchor. The system implements privacy levels (0-6) that control data access and visibility. Session management is handled through PostgreSQL sessions using connect-pg-simple middleware.

## Zero-Knowledge Proof System
The application integrates zero-knowledge proof capabilities for privacy-preserving data verification. Users can generate proofs for age verification, income ranges, and other sensitive data without revealing the actual values. The ZK proof system is designed to allow third parties to verify claims while maintaining user privacy.

# External Dependencies

## Database
- **PostgreSQL**: Primary database using Neon serverless for cloud deployment
- **Drizzle ORM**: Type-safe database client with migrations support
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI Framework
- **React**: Frontend framework with TypeScript support
- **Vite**: Build tool and development server
- **Wouter**: Lightweight client-side routing
- **TanStack Query**: Server state management and caching

## Component Library
- **shadcn/ui**: Collection of reusable UI components built on Radix UI
- **Radix UI**: Headless component library for accessibility
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **TypeScript**: Static type checking across the full stack
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind integration
- **date-fns**: Date manipulation and formatting utilities

## Third-Party Services
- **Replit**: Development environment with specialized plugins
- **Neon Database**: Serverless PostgreSQL hosting
- **Google Fonts**: Typography with Inter font family