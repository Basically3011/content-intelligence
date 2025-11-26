# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Content Intelligence Interface - A B2B content analytics platform ("Spotify for Content") that helps marketing teams discover content gaps, optimize performance, and plan campaigns. Built with Next.js 14 App Router.

## Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Build & Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint

# Database
npx prisma generate  # Generate Prisma client after schema changes
npx prisma db pull   # Pull schema from existing database
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Zustand, TanStack Query for server state
- **UI**: shadcn/ui components, Tailwind CSS
- **Charts**: Recharts

### Directory Structure
```
app/
├── (dashboard)/           # Main dashboard routes with shared layout
│   ├── page.tsx          # Executive overview
│   ├── discover/         # Coverage heatmap & gap analysis
│   ├── library/          # Content browser with filters
│   ├── analytics/        # Performance insights
│   ├── assistant/        # AI recommendations
│   └── classification/   # Content classification
├── api/                  # API routes
│   ├── content/          # Content CRUD & stats
│   ├── coverage/         # Coverage heatmap data
│   ├── filters/          # Filter options
│   └── classification/   # Classification endpoints
components/
├── ui/                   # shadcn/ui components
├── layout/               # Sidebar, Header
└── features/             # Feature-specific components
    ├── library/          # Content filters, cards, detail sheet
    ├── analytics/        # Stats cards, charts
    └── discover/         # Coverage heatmap, filters
lib/
├── db.ts                 # Prisma client singleton
├── api-client.ts         # Frontend fetch functions
├── types.ts              # TypeScript interfaces
├── hooks/                # TanStack Query hooks
├── api/                  # Server-side data fetching
└── config/               # Configuration (languages, etc.)
```

### Data Model (Prisma)
Three main tables:
- `content_inventory` - Core content items with SEO data, CMS metadata
- `content_persona_mapping` - Persona and buying stage mappings (AI-generated)
- `content_scoring` - Quality scores and flags (AI-generated)

Content items link to their active persona mapping and scoring via `active_persona_mapping_id` and `active_scoring_id`.

### API Pattern
- Routes use `?action=` parameter for different operations (stats, seo-stats, scoring-stats)
- BigInt fields serialized to strings for JSON responses
- Filtering via query parameters, supports: personas, buying_stages, languages, content_types, score_ranges, date_from/date_to, PDG stages, quality flags

### Data Fetching Pattern
```typescript
// Server: lib/api/*.ts functions query Prisma
// Client: lib/api-client.ts wraps fetch calls
// Hooks: lib/hooks/use-*.ts wrap TanStack Query
```

### Path Alias
`@/*` maps to project root (configured in tsconfig.json)
