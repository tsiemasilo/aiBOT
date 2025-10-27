# InstaScheduler - Instagram Automation Platform

## Overview

InstaScheduler is a full-stack Instagram automation platform that enables users to schedule posts, repost content from other Instagram profiles, and automate posting workflows. The application combines social media scheduling capabilities with AI-driven caption paraphrasing to help users maintain a consistent Instagram presence.

**Core Features:**
- Post scheduling and management with calendar visualization
- Instagram profile search with Instagram-style profile preview (profile picture, posts/followers/following counts, recent posts carousel)
- Automated reposting with AI-paraphrased captions that match the source profile's style
- Random post selection from confirmed source profiles
- Dashboard with separate views for automated queue and manual posts
- Queued automated posts preview showing upcoming content from source profile
- Analytics dashboard for tracking post performance
- Configurable posting schedules with custom time slots

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing
- **TanStack Query (React Query)** for server state management, caching, and data fetching

**UI Component System:**
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens
- **New York** style variant from shadcn with customized color scheme
- Theme system supporting light/dark modes via context provider
- Design system documented in `design_guidelines.md` with specific typography, spacing, and layout standards

**State Management:**
- Server state managed through React Query with configured refetch policies
- Local UI state handled via React hooks
- Theme state persisted to localStorage

### Backend Architecture

**Server Framework:**
- **Express.js** application with TypeScript
- RESTful API design pattern
- Session-based architecture (session middleware configured via `connect-pg-simple`)
- Custom middleware for request logging and JSON response capture

**API Structure:**
- `/api/posts` - CRUD operations for scheduled posts
- `/api/schedule` - Schedule settings configuration
- `/api/automation` - Automation settings management
- `/api/search-profile` - Search and preview Instagram profiles with full profile data (followers, following, posts count, recent posts)
- `/api/confirm-profile` - Confirm a profile as the source for reposting
- `/api/queued-posts` - Get preview of queued automated posts from confirmed source profile
- `/api/generate-repost` - Generate repost content with paraphrased captions
- `/api/analyze-profile` - (Legacy) Instagram profile content analysis endpoint
- `/api/accounts` - Connected Instagram accounts management

**Data Validation:**
- **Zod** schemas for runtime type validation
- **drizzle-zod** integration for database schema validation
- Input validation on API endpoints using schema parsing

### Data Storage

**Database:**
- **PostgreSQL** as the primary database (via Neon serverless driver `@neondatabase/serverless`)
- **Drizzle ORM** for type-safe database queries and schema management
- Database migrations managed through `drizzle-kit`

**Schema Design:**
Four main tables:
1. **posts** - Stores scheduled/posted content with status tracking
   - Fields: id, imageUrl, caption, scheduledDate, status, createdAt
   - Status values: "scheduled", "posted", "failed"

2. **schedule_settings** - User's posting schedule configuration
   - Fields: selectedDays (array), postsPerDay (integer), timeSlots (JSON)
   - Single-row configuration pattern

3. **automation_settings** - Reposting automation configuration
   - Fields: enabled (boolean), sourceProfileUrl, sourceProfileData (JSON), sourceProfilePosts (JSON), isProfileConfirmed (boolean), lastAnalyzedAt
   - Stores confirmed Instagram profile and all its posts for random selection
   - Single-row configuration pattern

4. **connected_accounts** - User's connected Instagram accounts
   - Fields: id, platform, username, accessToken, refreshToken, profileUrl, profileImageUrl, isActive, connectedAt, lastSyncedAt
   - Stores OAuth credentials for posting to user's Instagram

**In-Memory Fallback:**
- `MemStorage` class provides in-memory implementation of storage interface
- Used for development/testing when database is unavailable

### Authentication & Authorization

Currently implements session management infrastructure via `connect-pg-simple` but user authentication flows are not yet implemented. The architecture is prepared for session-based authentication.

### Code Organization

**Monorepo Structure:**
- `/client` - Frontend React application
  - `/src/components` - Reusable UI components
  - `/src/pages` - Route-level page components
  - `/src/lib` - Utilities and shared logic
  - `/src/hooks` - Custom React hooks
- `/server` - Backend Express application
  - `routes.ts` - API route definitions
  - `storage.ts` - Data access layer
  - `vite.ts` - Vite integration for development
- `/shared` - Code shared between client and server
  - `schema.ts` - Database schema and validation types

**Path Aliases:**
- `@/*` maps to `client/src/*`
- `@shared/*` maps to `shared/*`
- `@assets/*` maps to `attached_assets/*`

### Build & Deployment

**Development:**
- Vite dev server with HMR
- Express server with tsx runtime
- Concurrent client/server development

**Production:**
- Client built to `dist/public` via Vite
- Server bundled to `dist` via esbuild with ESM output
- Static file serving for production builds

## External Dependencies

### UI Component Libraries
- **Radix UI** - Headless component primitives for accessibility (Dialog, Dropdown, Popover, Select, etc.)
- **Lucide React** - Icon library
- **date-fns** - Date formatting and manipulation
- **embla-carousel-react** - Carousel component functionality
- **cmdk** - Command palette component
- **vaul** - Drawer component
- **react-day-picker** - Calendar/date picker
- **recharts** - Charting library for analytics

### Styling & Theming
- **Tailwind CSS** with PostCSS
- **class-variance-authority** - Type-safe component variants
- **tailwind-merge** & **clsx** - Conditional class name utilities
- **Google Fonts** - Inter (primary) and JetBrains Mono (monospace)

### Development Tools
- **@replit/vite-plugin-runtime-error-modal** - Error overlay for development
- **@replit/vite-plugin-cartographer** - Replit-specific development tooling
- **@replit/vite-plugin-dev-banner** - Development environment banner

### Database & ORM
- **@neondatabase/serverless** - Serverless PostgreSQL driver
- **drizzle-orm** - TypeScript ORM
- **drizzle-kit** - Schema migration tool

### Form Handling
- **react-hook-form** - Form state management
- **@hookform/resolvers** - Form validation resolvers for Zod integration

### Type Safety
- TypeScript throughout with strict mode enabled
- Shared types between frontend and backend via `/shared` directory
- Runtime validation with Zod schemas

### AI Integration
- **OpenAI GPT-5** - Used for caption paraphrasing
- `server/openai.ts` - OpenAI client configuration and helper functions with lazy-loading for error resilience
- `paraphraseCaption()` - Analyzes source profile's writing style and paraphrases captions to match their tone, vocabulary, and lingo
- Environment variable: `OPENAI_API_KEY`
- **Security**: OpenAI client is lazy-loaded to prevent application crashes when API key is not configured

### External APIs
- **RapidAPI Instagram Scraper** - Fetches Instagram profile data and posts
- Endpoints: `get_ig_user_about.php`, `get_user_posts.php`
- Environment variable: `RAPIDAPI_KEY`

### Mock Data
Currently uses mock data for analytics and activity feeds. Future implementation will connect to actual Instagram API or analytics service.