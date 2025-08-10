# Aetherquill - D&D Campaign Manager

## Overview

Aetherquill is a comprehensive Dungeons & Dragons campaign management application built with a modern full-stack architecture. The application provides dungeon masters with tools to manage campaigns, characters, quests, NPCs, locations, story branches, and session notes through an intuitive web interface with an enhanced fantasy-themed design featuring mystical elements and ethereal styling. This project is now set up for local development and can be easily run using Docker.

## How To

To set up and run the Aetherquill development environment, you have two primary options: using Docker for a consistent, isolated setup, or running it directly on your local machine.

### Option 1: Development with Docker (Recommended)

This method provides a consistent and isolated development environment using Docker Compose, bundling both the application and the database.

1.  **Prerequisites**: Ensure you have Docker and Docker Compose installed on your system.
2.  **Clone the Repository**: If you haven't already, clone the Aetherquill repository to your local machine.
*   **Navigate to Project Root**: Open your terminal and change directory to the project root (e.g., `cd ttrpg`).
4.  **Build and Run Containers**: Execute the following command to build the application image and start all necessary services (application and PostgreSQL database):
    ```bash
    docker-compose up --build
    ```
    *   The frontend will be accessible at `http://localhost:5173`.
    *   The backend API will be accessible at `http://localhost:3000`.
    *   File changes on your host machine will trigger hot-reloads within the containers.
5.  **Run Database Migrations**: After the containers are up and running for the first time, you need to apply the database schema. Run this command from your host machine's project root:
    ```bash
    npm run db:push
    ```
    Ensure your `DATABASE_URL` environment variable is correctly set in your `docker-compose.yml` or `.env` file for the `app` service to connect to the `db` service.

### Option 2: Local Development (Without Docker)

If you prefer to run the application components directly on your host machine, follow these steps. You will need a local PostgreSQL database instance.

1.  **Prerequisites**:
    *   Ensure Node.js (v18 or higher) and npm are installed.
    *   You will need a local PostgreSQL database running and accessible.
2.  **Clone the Repository**: If you haven't already, clone the Aetherquill repository.
3.  **Navigate to Project Root**: Open your terminal and change directory to the project root (e.g., `cd ttrpg`).
4.  **Install Dependencies**: Install all project dependencies:
    ```bash
    npm install
    ```
5.  **Configure Database**: Set the `DATABASE_URL` environment variable to point to your local PostgreSQL instance. For example, in your terminal before starting:
    ```bash
    export DATABASE_URL=postgres://user:password@localhost:5432/aetherquill
    ```
    (Replace `user`, `password`, and `aetherquill` with your database credentials and name).
6.  **Run Database Migrations**: Apply the database schema to your local PostgreSQL instance:
    ```bash
    npm run db:push
    ```
7.  **Start Development Servers**: Start both the frontend (Vite) and backend (Express) development servers concurrently:
    ```bash
    npm run dev
    ```
    *   The frontend will be accessible at `http://localhost:5173`.
    *   The backend API will be accessible at `http://localhost:3000`.


## Recent Changes

### Character Management Features (January 26, 2025)
- ✓ Added character editing functionality with edit buttons on character cards
- ✓ Implemented edit dialogs for updating character details including level, HP, and stats
- ✓ Added validation and error handling for character updates

### Story Branch Player Assignment (January 26, 2025)
- ✓ Enhanced story branches with character assignment capabilities
- ✓ Added multi-select checkboxes for assigning specific characters to story branches
- ✓ Updated story branch cards to display assigned characters with badges
- ✓ Supports split party scenarios where different characters follow different narrative paths

### Database Integration Enhancements
- ✓ Updated database schema to include assignedCharacters field for story branches
- ✓ Maintained full PostgreSQL integration with persistent storage
- ✓ All features fully functional with real database operations

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom fantasy theme variables
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with conventional HTTP methods
- **Request Handling**: Express middleware for JSON parsing, CORS, and request logging
- **Error Handling**: Centralized error handling middleware

### Data Storage Solutions
- **Database**: PostgreSQL (can be run locally or via Docker)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Validation**: Zod schemas for runtime type validation shared between client and server

## Key Components

### Database Schema
The application uses a comprehensive schema with the following main entities:
- **Campaigns**: Core campaign information with session tracking
- **Characters**: Player characters with stats, equipment, and progression
- **Quests**: Quest management with objectives, progress tracking, and priorities
- **NPCs**: Non-player characters with roles, relationships, and locations
- **Locations**: World-building locations with inhabitants and features
- **Story Branches**: Decision points and narrative paths with player alignment tracking
- **Session Notes**: Detailed session recordings with key events and decisions
- **Activities**: Campaign activity feed for tracking important events

### Frontend Components
- **Layout System**: Sidebar navigation with header and main content area
- **Card Components**: Reusable cards for displaying characters, quests, NPCs, and story elements
- **Form Components**: Modal-based forms for creating and editing entities
- **Dashboard**: Overview page with stats and recent activity
- **Specialized Pages**: Dedicated pages for each entity type with CRUD operations

### API Structure
RESTful endpoints following conventional patterns:
- `GET /api/campaigns` - List campaigns
- `GET /api/campaigns/:id` - Get specific campaign
- `POST /api/campaigns` - Create new campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- Similar patterns for characters, quests, NPCs, locations, story branches, and session notes

## Data Flow

### Client-Server Communication
1. **Query Management**: TanStack Query handles all server state with automatic caching, background refetching, and optimistic updates
2. **API Layer**: Centralized API client with error handling and request/response interceptors
3. **Form Submission**: React Hook Form with Zod validation before API calls
4. **Real-time Updates**: Query invalidation triggers UI updates after mutations

### State Management Strategy
- **Server State**: Managed by TanStack Query with intelligent caching
- **Form State**: Local component state via React Hook Form
- **UI State**: React component state for modals, filters, and temporary UI interactions
- **Shared State**: Minimal global state, mostly handled through URL parameters and query cache

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL
- **UI Components**: Radix UI primitives for accessibility and behavior
- **Styling**: Tailwind CSS for utility-first styling
- **Validation**: Zod for schema validation across client and server
- **Icons**: Lucide React for consistent iconography

### Development Tools
- **TypeScript**: Full type safety across the stack
- **Vite**: Fast development server and build tool
- **Drizzle Kit**: Database schema management and migrations
- **ESLint/Prettier**: Code quality and formatting
- **Docker/Docker Compose**: For containerized development environment

## Deployment Strategy

### Development Environment Setup (with Docker)

For a consistent and isolated development environment, you can use Docker and Docker Compose.

1.  **Prerequisites**: Ensure Docker and Docker Compose are installed on your system.
2.  **Clone the Repository**: If you haven't already, clone the Aetherquill repository.
3.  **Navigate to Project Root**: Open your terminal and change directory to the project root (`ttrpg`).
4.  **Build and Run Containers**:
    ```bash
    docker-compose up --build
    ```
    This command will:
    *   Build the `app` service image based on the `Dockerfile`.
    *   Start both the `app` (frontend + backend) and `db` (PostgreSQL) containers.
    *   The frontend will be accessible at `http://localhost:5173`.
    *   The backend API will be accessible at `http://localhost:3000`.
    *   File changes on your host machine will trigger hot-reloads inside the containers.
5.  **Run Database Migrations**: After the containers are up for the first time, you'll need to apply database migrations to set up the schema. Run this command from your host machine's project root:
    ```bash
    npm run db:push
    ```
    Ensure your `DATABASE_URL` environment variable is correctly set in your `docker-compose.yml` or `.env` file for the `app` service to connect to the `db` service.

### Local Development (without Docker)

If you prefer to run the application directly on your host machine:

1.  **Prerequisites**: Ensure Node.js (v18 or higher) and npm are installed. You will also need a local PostgreSQL database running and accessible.
2.  **Clone the Repository**: If you haven't already, clone the Aetherquill repository.
3.  **Navigate to Project Root**: Open your terminal and change directory to the project root (`ttrpg`).
4.  **Install Dependencies**:
    ```bash
    npm install
    ```
5.  **Configure Database**: Set the `DATABASE_URL` environment variable to point to your local PostgreSQL instance (e.g., `export DATABASE_URL=postgres://user:password@localhost:5432/aetherquill`).
6.  **Run Database Migrations**:
    ```bash
    npm run db:push
    ```
7.  **Start Development Servers**:
    ```bash
    npm run dev
    ```
    This command will concurrently start the Vite development server for the frontend and the Express server for the backend.
    *   The frontend will be accessible at `http://localhost:5173`.
    *   The backend API will be accessible at `http://localhost:3000`.

### Production Deployment

To build the application for production:

1.  **Build Application**:
    ```bash
    npm run build
    ```
    This will create optimized `dist` directories for both the client and server.
2.  **Start Production Server**:
    ```bash
    npm run start
    ```
    This command runs the bundled Express server, serving the client assets. Ensure your production `DATABASE_URL` environment variable is correctly set.

### Environment Configuration
- **Development**: Managed by `docker-compose.yml` for containerized setup, or local `npm run dev` with environment variables for direct local setup.
- **Production**: Bundled application served by Express with static file serving; relies on environment-based connection strings for the database.

## Key Architectural Decisions

#### Database Choice: Drizzle ORM with PostgreSQL
- **Problem**: Need for type-safe database operations with complex relational data
- **Solution**: Drizzle ORM provides excellent TypeScript integration with PostgreSQL
- **Benefits**: Full type safety, easy migrations, and excellent performance
- **Trade-offs**: Learning curve compared to simpler ORMs

#### State Management: TanStack Query
- **Problem**: Complex server state management with caching and synchronization needs
- **Solution**: TanStack Query for server state, local state for UI concerns
- **Benefits**: Automatic caching, background refetching, optimistic updates
- **Trade-offs**: Additional complexity for simple use cases

#### UI Framework: Shadcn/ui with Radix
- **Problem**: Need for accessible, customizable UI components
- **Solution**: Shadcn/ui built on Radix UI primitives
- **Benefits**: Accessibility built-in, highly customizable, great developer experience
- **Trade-offs**: Larger bundle size compared to simpler UI libraries

#### Monorepo Structure
- **Problem**: Sharing types and schemas between frontend and backend
- **Solution**: Shared folder with common TypeScript definitions
- **Benefits**: Type safety across the full stack, reduced duplication
- **Trade-offs**: More complex build setup and dependency management
