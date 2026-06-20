# ARCOLYTE TECHNOLOGIES - Future Digital Solutions

## Overview

ARCOLYTE TECHNOLOGIES is a modern full-stack web application representing Phase 1 of Kingdom Enhancement Corp (KEC). It's a professional digital agency platform that showcases services in AI integration, web development, digital marketing, and cybersecurity solutions. The application features a futuristic cyberpunk aesthetic with interactive animations and serves as both a portfolio and business management platform for digital transformation services targeting SMEs, startups, and social-impact organizations across Africa and beyond.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript in a single-page application (SPA) architecture
- **Styling**: Tailwind CSS with custom cyberpunk theme featuring neon colors (cyber-cyan, cyber-purple, cyber-green) and futuristic design elements
- **UI Components**: Radix UI primitives with custom shadcn/ui components for consistent, accessible interface elements
- **Animations**: GSAP (GreenSock) for smooth scroll-triggered animations and Three.js for 3D globe visualization
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and data fetching

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript for type safety across the entire application
- **API Design**: RESTful API endpoints for contacts, products, and courses with proper HTTP status codes
- **Development Setup**: Vite for fast development with hot module replacement and optimized production builds

### Data Storage Solutions
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Database**: PostgreSQL configured for production with Neon Database serverless integration
- **Development Storage**: In-memory storage implementation for rapid development and testing
- **Schema Management**: Centralized schema definitions in shared directory with Zod validation

### Authentication and Authorization
- **Current State**: Basic structure in place with user schema defined but not yet implemented in the UI
- **Planned Features**: Session-based authentication with PostgreSQL session storage using connect-pg-simple

### Component Organization
- **Design System**: Modular component architecture with reusable UI primitives
- **Section-Based Layout**: Individual section components (Hero, About, Services, Products, etc.) for maintainable page structure
- **Custom Components**: Specialized cyberpunk-themed components like CyberButton and ServiceCard with consistent styling

### External Integrations
- **Fonts**: Google Fonts integration for Orbitron, Exo 2, and Share Tech Mono typefaces
- **CDN Resources**: External libraries loaded via CDN (Three.js, GSAP, Particles.js) for performance optimization
- **Development Tools**: Replit-specific plugins for enhanced development experience

### Build and Deployment
- **Development**: Hot reload with Vite and tsx for TypeScript execution
- **Production**: Optimized builds with code splitting and asset optimization
- **Database Operations**: Drizzle Kit for schema migrations and database management

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, and TypeScript for the main application framework
- **TanStack Query**: Advanced server state management with caching and synchronization
- **Wouter**: Lightweight routing solution for single-page application navigation

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom cyberpunk color scheme
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Class Variance Authority**: Type-safe utility for creating component variants
- **Lucide React**: Modern icon library with consistent design language

### Database and Backend
- **Drizzle ORM**: Type-safe ORM with PostgreSQL dialect support
- **Neon Database**: Serverless PostgreSQL database for production deployment
- **Express.js**: Web application framework for API endpoints
- **Zod**: Runtime type validation and schema validation

### Animation and Interactive Elements
- **GSAP (GreenSock)**: Professional animation library for smooth transitions and scroll-triggered animations
- **Three.js**: 3D graphics library for interactive globe visualization
- **Particles.js**: Particle system for dynamic background effects
- **Embla Carousel**: Touch-friendly carousel component for content presentation

### Development and Build Tools
- **Vite**: Fast build tool with hot module replacement for optimal development experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins
- **TSX**: TypeScript execution environment for Node.js development