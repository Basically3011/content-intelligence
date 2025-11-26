# Content Intelligence Dashboard

Ein Next.js Dashboard zur Analyse und Verwaltung von Content-Daten mit Prisma und PostgreSQL.

## Features

- 📊 Content Analytics & Scoring
- 🎯 Content Classification & Persona Mapping
- 📚 Content Library Management
- 🔍 Discovery & Coverage Analysis
- 🤖 AI Assistant Integration
- 📈 SEO Performance Tracking

## Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL mit Prisma ORM
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query

## Deployment Optionen

### 🐳 Docker / Unraid (Empfohlen für Production)

Für die Bereitstellung auf Unraid oder einem anderen Docker-Host:

```bash
# Repository klonen
git clone https://github.com/Basically3011/content-intelligence.git
cd content-intelligence

# .env Datei erstellen (siehe .env.example)
nano .env

# Mit Docker Compose starten
docker-compose up -d
```

**Detaillierte Anleitung**: Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für vollständige Setup-Instruktionen, Updates und Troubleshooting.

### 💻 Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Prisma Client generieren
npx prisma generate

# Development Server starten
npm run dev
```

Die App läuft unter `http://localhost:3000`

## Umgebungsvariablen

Erstelle eine `.env` Datei im Projektroot:

```env
# PostgreSQL Verbindung
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
DIRECT_URL="postgresql://user:password@host:5432/dbname?schema=public"

# Environment
NODE_ENV="production"
```

## Datenbank Setup

```bash
# Migrationen ausführen
npx prisma migrate deploy

# Prisma Studio öffnen (optional)
npx prisma studio
```

## Verfügbare Scripts

```bash
npm run dev        # Development Server (Port 3000)
npm run build      # Production Build
npm run start      # Production Server starten
npm run lint       # ESLint ausführen
```

## Docker Commands Quick Reference

```bash
# Container starten
docker-compose up -d

# Container stoppen
docker-compose down

# Logs anzeigen
docker-compose logs -f

# Status prüfen
docker-compose ps

# Update durchführen
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

## Projektstruktur

```
.
├── app/                    # Next.js App Directory
│   ├── (dashboard)/       # Dashboard Routes
│   ├── api/               # API Routes
│   └── layout.tsx         # Root Layout
├── components/            # React Components
│   ├── features/         # Feature-spezifische Components
│   ├── layout/           # Layout Components
│   └── ui/               # UI Components (shadcn)
├── lib/                   # Utilities & Hooks
│   ├── api/              # API Client Functions
│   ├── hooks/            # Custom React Hooks
│   └── db.ts             # Prisma Client
├── prisma/               # Prisma Schema
├── public/               # Static Assets
├── Dockerfile            # Docker Build Configuration
├── docker-compose.yml    # Docker Compose Setup
└── DEPLOYMENT.md         # Deployment Guide
```

## Dokumentation

- [Deployment Guide](DEPLOYMENT.md) - Vollständige Anleitung für Docker/Unraid
- [Database Setup](DATABASE_SETUP.md) - Datenbank Schema & Migrationen
- [Project PRD](docs/prd-project.md) - Projektanforderungen

## Support

Bei Fragen oder Problemen:
- Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für Troubleshooting
- Öffne ein Issue auf GitHub

## Lizenz

Private Repository

---

**Repository**: https://github.com/Basically3011/content-intelligence

