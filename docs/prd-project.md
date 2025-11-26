# Content Intelligence Interface - PRD (Iterative MVP)

## 1. Vision & Goals

### Product Vision
**"Spotify for Content"** - A content analytics platform that helps B2B marketing teams discover gaps, optimize performance, and plan campaigns through an intuitive, data-driven interface.

### Core Mental Model
- **DISCOVER** → Strategic planning & gap analysis (Browse)
- **LIBRARY** → Smart content repository (Your Library) 
- **ANALYTICS** → Performance insights (Wrapped)
- **RADIO** → AI recommendations (Radio)

### Success Metrics
- Reduce content gap identification time by 80%
- Improve content quality scores by 20%
- Accelerate campaign planning by 50%

### Target Users
- **Primary**: Content Managers, Marketing Operations
- **Secondary**: Marketing Leadership, Campaign Managers

---

## 2. Technical Foundation

### Core Stack
```yaml
Framework: Next.js 14+ (App Router)
Language: TypeScript
Database: PostgreSQL (existing schema)
ORM: Prisma
Styling: Tailwind CSS
Components: shadcn/ui
State: Zustand
Data Fetching: TanStack Query
Charts: Recharts
Icons: Lucide React
```

### Initial Setup Commands
```bash
# Create project
npx create-next-app@latest content-intelligence --typescript --tailwind --app

# Install core dependencies
npm install @tanstack/react-query zustand prisma @prisma/client
npm install recharts lucide-react date-fns clsx tailwind-merge
npm install @radix-ui/react-slot class-variance-authority

# Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card tabs badge command dialog
npx shadcn-ui@latest add select input form table sheet
npx shadcn-ui@latest add skeleton toast sonner scroll-area
```

### Directory Structure
```
/app
  /(dashboard)
    /layout.tsx         # Main dashboard layout with sidebar
    /page.tsx          # Executive dashboard (overview)
    /discover
      /page.tsx        # Gap analysis & planning
    /library
      /page.tsx        # Content browser
    /analytics  
      /page.tsx        # Performance insights
    /assistant
      /page.tsx        # AI recommendations
  /api
    /content/
    /analytics/
    /recommendations/
/components
  /ui/                 # shadcn components
  /layout/
    sidebar.tsx
    header.tsx
    navigation.tsx
  /features/
    /discover/
    /library/
    /analytics/
/lib
  /db.ts              # Database connection
  /utils.ts           # Utilities
  /hooks/             # Custom hooks
  /stores/            # Zustand stores
  /types.ts           # TypeScript types
```

### Database Connection
```typescript
// Existing PostgreSQL schema
interface ContentItem {
  inventory_id: number;
  language_node_id: string;  // e.g., "5186_en"
  title: string;
  url: string;
  persona_mapping?: PersonaMapping;
  scoring?: ContentScoring;
  seo_score?: number;
  // ... see data PRD for full schema
}
```

---

## 3. Navigation & Layout

### Information Architecture
```
Dashboard (/)
├── Discover (/discover)
│   ├── Coverage Heatmap
│   ├── Gap Analysis
│   └── Campaign Builder
├── Library (/library)
│   ├── Browse & Search
│   ├── Filters
│   └── Content Details
├── Analytics (/analytics)
│   ├── Performance Quadrant
│   ├── Health Scores
│   └── Trends
└── Assistant (/assistant)
    ├── Recommendations
    └── Ask AI
```

### Layout Components

#### Dashboard Shell
```tsx
<div className="flex h-screen">
  {/* Sidebar - Fixed */}
  <aside className="w-64 border-r">
    <Logo />
    <Navigation />
    <UserMenu />
  </aside>
  
  {/* Main Content - Scrollable */}
  <main className="flex-1 overflow-auto">
    <Header />
    <div className="p-6">
      {children}
    </div>
  </main>
  
  {/* AI Assistant - Collapsible */}
  <AIAssistantPanel />
</div>
```

#### Navigation Items
```typescript
const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: Home,
    description: 'Executive overview'
  },
  { 
    name: 'Discover', 
    href: '/discover', 
    icon: Compass,
    description: 'Find gaps & plan'
  },
  { 
    name: 'Library', 
    href: '/library', 
    icon: Library,
    description: 'Browse content'
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: TrendingUp,
    description: 'Performance insights'
  },
  { 
    name: 'Assistant', 
    href: '/assistant', 
    icon: Sparkles,
    description: 'AI recommendations'
  }
];
```

---

## 4. Design System

### Color Palette
```javascript
// tailwind.config.js
{
  theme: {
    extend: {
      colors: {
        // Brand colors (Spotify-inspired but enterprise)
        brand: {
          DEFAULT: '#1DB954',  // Spotify green adapted
          dark: '#1AA34A',
          light: '#21E065'
        },
        
        // Semantic colors
        surface: {
          DEFAULT: 'hsl(var(--card))',
          hover: 'hsl(var(--muted))'
        },
        
        // Status colors
        success: '#10B981',   // Green
        warning: '#F59E0B',   // Amber
        error: '#EF4444',     // Red
        info: '#3B82F6',      // Blue
        
        // Quadrant colors
        quadrant: {
          stars: '#10B981',      // Top performers
          rising: '#3B82F6',     // Improving
          hidden: '#F59E0B',     // Hidden gems
          needswork: '#EF4444'   // Needs attention
        }
      }
    }
  }
}
```

### Component Styling Patterns

#### Card Pattern
```tsx
// Hoverable content card with metrics
<Card className="hover:shadow-lg transition-all cursor-pointer">
  <CardHeader>
    <div className="flex justify-between items-start">
      <Badge>{category}</Badge>
      <ScoreBadge score={score} />
    </div>
  </CardHeader>
  <CardContent>
    <h3 className="font-semibold">{title}</h3>
    <MetricRow items={metrics} />
  </CardContent>
</Card>
```

#### Metric Display
```tsx
// Consistent metric display
<div className="flex items-center gap-2">
  <Icon className="h-4 w-4 text-muted-foreground" />
  <span className="text-sm font-medium">{label}</span>
  <span className="text-sm text-muted-foreground">{value}</span>
</div>
```

#### Empty States
```tsx
<div className="flex flex-col items-center justify-center h-64">
  <Icon className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold">No data available</h3>
  <p className="text-sm text-muted-foreground">{description}</p>
</div>
```

### Interaction Patterns
- **Loading**: Skeleton screens for all data fetching
- **Errors**: Toast notifications with retry options
- **Success**: Brief success toasts (auto-dismiss after 3s)
- **Hover**: Cards elevate on hover with shadow
- **Selection**: Checkbox pattern for multi-select
- **Navigation**: Highlight active page in sidebar

---

## 5. Features (High-Level)

### Phase 1: Foundation (Week 1)

#### F1.1: Dashboard Layout
**User Story**: As a user, I want to navigate between different sections easily
**Implementation**:
- Responsive sidebar with navigation
- Header with breadcrumbs and user menu
- Content area with consistent padding
- Collapsible AI assistant panel

#### F1.2: Data Connection
**User Story**: As a developer, I need to connect to the existing database
**Implementation**:
- Prisma schema matching existing PostgreSQL
- Type definitions for all entities
- Basic CRUD operations
- Mock data for development

### Phase 2: Discover (Week 2)

#### F2.1: Coverage Heatmap
**User Story**: As a content manager, I want to see where content gaps exist across personas and buying stages
**Implementation**:
- Visual grid: Personas (Y) × Buying Stages (X)
- Color intensity: Red (0%) → Yellow (50%) → Green (100%)
- Click cell → Show specific gap details
- Language selector to filter view

#### F2.2: Gap Analysis List
**User Story**: As a marketer, I want to see prioritized content gaps
**Implementation**:
- Table with: Persona, Stage, Priority, Impact Score
- Sort by priority/impact
- Filter by persona/stage/language
- "Fill this gap" action button

#### F2.3: Campaign Builder (Simple)
**User Story**: As a campaign manager, I want to plan content sequences
**Implementation**:
- Select target persona & journey
- Drag content onto stage slots
- Visual gap indicators
- Save as template

### Phase 3: Library (Week 3)

#### F3.1: Content Browser
**User Story**: As a user, I want to find specific content quickly
**Implementation**:
- Grid/List/Table view toggle
- Content cards with key metrics
- Multi-select for batch actions
- Infinite scroll pagination

#### F3.2: Smart Search & Filters
**User Story**: As a user, I want to filter content by multiple criteria
**Implementation**:
- Natural language search box
- Faceted filters: Persona, Stage, Language, Score, Type
- Save filter combinations
- Clear all filters option

#### F3.3: Content Detail View
**User Story**: As a user, I want to see detailed content information
**Implementation**:
- Slide-over panel (not new page)
- Tabs: Overview, Performance, SEO, Recommendations
- Related content suggestions
- Quick actions: Edit, Archive, Share

### Phase 4: Analytics (Week 4)

#### F4.1: Performance Quadrant
**User Story**: As a manager, I want to identify top performers and content needing attention
**Implementation**:
- Scatter plot: SEO Score (X) vs Engagement (Y)
- Four quadrants with labels
- Hover for details
- Click to filter library

#### F4.2: Health Dashboard
**User Story**: As a manager, I want to see overall content health
**Implementation**:
- Summary cards: Total content, Avg score, Coverage %
- Score distribution charts
- Trend lines over time
- Top 5 / Bottom 5 lists

#### F4.3: Executive Summary
**User Story**: As a leader, I want a one-page overview
**Implementation**:
- Single page, print-friendly layout
- Key metrics in large cards
- Progress vs goals
- Export as PDF

### Phase 5: Assistant (Week 5)

#### F5.1: Smart Recommendations
**User Story**: As a user, I want AI-powered content suggestions
**Implementation**:
- Recommendation cards with reasoning
- Priority: High/Medium/Low
- Effort estimate
- Accept/Dismiss actions

#### F5.2: Natural Language Query
**User Story**: As a user, I want to ask questions about my content
**Implementation**:
- Chat-like interface
- Example queries provided
- Context-aware responses
- Copy response option

---

## 6. API Structure (Simplified)

### RESTful Endpoints
```typescript
// Content
GET    /api/content          → List with pagination
GET    /api/content/:id      → Single item detail
POST   /api/content/search   → Advanced search

// Analytics
GET    /api/analytics/coverage   → Heatmap data
GET    /api/analytics/gaps       → Gap list
GET    /api/analytics/health     → Health metrics
GET    /api/analytics/quadrant   → Performance data

// Recommendations
GET    /api/recommendations       → AI suggestions
POST   /api/recommendations/query → Natural language
```

### Data Fetching Pattern
```typescript
// Using TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['content', filters],
  queryFn: () => fetchContent(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

---

## 7. Development Approach

### Iteration Strategy
```
Week 1: Foundation
├── Setup & Configuration
├── Layout & Navigation
├── Database Connection
└── Mock Data

Week 2: Discover
├── Coverage Heatmap
├── Gap Analysis
└── Basic Campaign Builder

Week 3: Library
├── Content Browser
├── Search & Filters
└── Detail Views

Week 4: Analytics
├── Performance Quadrant
├── Health Dashboard
└── Executive Summary

Week 5: Assistant
├── Recommendations
└── Natural Language Query

Week 6: Polish
├── Performance Optimization
├── Error Handling
├── Mobile Responsiveness
└── Documentation
```

### Definition of Done
- [ ] Feature works as described
- [ ] Loading and error states implemented
- [ ] Responsive on desktop/tablet
- [ ] TypeScript types complete
- [ ] Basic keyboard navigation works

### MVP Success Criteria
- Core navigation working
- Can view content coverage gaps
- Can browse and search content
- Can see performance metrics
- Basic AI recommendations functional

---

## 8. Implementation Notes

### For Cursor/Claude Development
1. **Start with mock data** - Don't wait for real API
2. **Build components in isolation** - Use Storybook pattern
3. **Progressive enhancement** - Basic first, then add features
4. **Type everything** - TypeScript interfaces first
5. **Use shadcn/ui** - Don't reinvent the wheel

### Component Creation Pattern
```typescript
// 1. Define types
interface ComponentProps {
  data: DataType;
  onAction: (item: DataType) => void;
}

// 2. Create component
export function Component({ data, onAction }: ComponentProps) {
  // 3. Add loading state
  if (isLoading) return <Skeleton />;
  
  // 4. Add error state
  if (error) return <ErrorState />;
  
  // 5. Implement feature
  return <div>...</div>;
}
```

### Quick Start Checklist
- [ ] Project setup with Next.js
- [ ] Install all dependencies
- [ ] Create layout with sidebar
- [ ] Add navigation routing
- [ ] Create first feature component
- [ ] Connect mock data
- [ ] Add loading states
- [ ] Test responsiveness

---

*Version: 1.0.0 - Iterative MVP*
*Last Updated: November 2024*
*Focus: Progressive development from foundation to features*