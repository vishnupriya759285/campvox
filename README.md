# FIXMYCAMPUS
### Smart Campus Issue Reporting & Resolution Platform
> **"Report. Assign. Resolve. Improve."**

FixMyCampus is an enterprise-grade, full-stack campus operations platform designed to eliminate overlooked maintenance complaints, establish departmental accountability, and automate real-time status tracking from initial student submission through verification.

---

## Architecture

```mermaid
graph TD
    User([Students, Faculty, Staff, Admins]) -->|Next.js App Router| FE[Next.js Frontend / Tailwind CSS]
    FE -->|GraphQL Queries & Mutations| BE[NestJS Backend API :3001]
    
    subgraph NestJS Core Modules
        BE --> AuthMod[Auth Module / JWT]
        BE --> IssuesMod[Issues State Machine Module]
        BE --> DeptsMod[Departments Module]
        BE --> UsersMod[Users & RBAC Module]
        BE --> NotifMod[Notifications Module]
        BE --> AnalyticsMod[Analytics Aggregation]
        BE --> UploadsMod[Supabase Storage Bridge]
    end

    BE -->|Prisma ORM| DB[(Supabase PostgreSQL)]
    UploadsMod -->|Signed/Public Upload| Storage[(Supabase Storage: issue-images)]
```

---

## Technology Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Apollo Client, Lucide React, Recharts, date-fns.
- **Backend**: NestJS, TypeScript, Apollo GraphQL (`@nestjs/graphql`), Passport JWT, Class Validator, BcryptJS.
- **Database**: PostgreSQL (Supabase), Prisma ORM.
- **Object Storage**: Supabase Storage (`issue-images` bucket).
- **DevOps**: Docker, Docker Compose, Git.

---

## Repository Structure

```
fixmycampus/
├── frontend/                     # Next.js App Router Application
│   ├── app/                      # App router pages & layouts
│   │   ├── (auth)/login/         # Login with 1-click demo switcher
│   │   ├── (auth)/register/      # Account registration & role picker
│   │   ├── (dashboard)/          # Authenticated app shell (Sidebar & Topbar)
│   │   │   ├── dashboard/        # Student / reporter overview
│   │   │   ├── issues/           # Issue filterable table & search
│   │   │   │   ├── new/          # Issue reporting form with photo upload
│   │   │   │   └── [id]/         # Issue details, timeline, comments, actions
│   │   │   ├── maintenance/      # Maintenance assigned tasks & status actions
│   │   │   ├── admin/            # Admin operations dashboard & charts
│   │   │   │   ├── users/        # User management & role assignment
│   │   │   │   └── departments/  # Department management
│   │   │   │   └── analytics/    # Analytics, trends, & recurring hotspots
│   │   │   └── notifications/    # In-app notification center
│   │   ├── globals.css           # FixMyCampus Design Tokens & warm ivory palette
│   │   ├── layout.tsx            # Apollo Provider & Auth Provider
│   │   └── page.tsx              # High-impact Landing Page
│   ├── components/               # BrandLogo, Badges, Timeline, Modal, Card, etc.
│   ├── graphql/                  # Apollo queries & mutations
│   ├── lib/                      # Apollo client, Auth context, utilities
│   └── package.json
│
├── backend/                      # NestJS GraphQL Backend API
│   ├── src/
│   │   ├── auth/                 # JWT strategy, auth resolver, guards
│   │   ├── users/                # User management & RBAC resolvers
│   │   ├── departments/          # Department CRUD & issue counting
│   │   ├── issues/               # State machine, status history, assign
│   │   ├── comments/             # Discussion thread resolver
│   │   ├── notifications/        # In-app notifications service
│   │   ├── analytics/            # Dynamic SQL / database aggregations
│   │   ├── uploads/              # Supabase Storage client
│   │   ├── prisma/               # Prisma service & database store
│   │   ├── common/               # Enums, guards, decorators, GraphQL types
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma         # Models, enums, relations, indexes
│   │   └── seed.ts               # Database seeder
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
├── .env.example
└── README.md
```

---

## Design System & Visual Identity

The platform utilizes a warm, campus-focused aesthetic matching the official FixMyCampus reference:
- **Primary Sage Green**: `#5F8069`
- **Primary Dark**: `#45614F`
- **Deep Green**: `#294438`
- **Warm Ivory Background**: `#FAF8F4`
- **Cream Card Surface**: `#FFFDF9`
- **Border**: `#E2E6DF`

### Status Badge Tokens
- **Reported**: `#C69A5B` (Amber gold)
- **Assigned**: `#8B9AA6` (Slate gray)
- **In Progress**: `#9B8BB0` (Lavender purple)
- **Resolved**: `#8FA995` (Soft sage)
- **Verified**: `#5F8069` (Forest sage)
- **Reopened**: `#C77C72` (Terracotta coral)

---

## Status Lifecycle & State Machine

```
REPORTED
   ↓ (Admin assigns department & staff)
ASSIGNED
   ↓ (Maintenance technician starts work)
IN_PROGRESS
   ↓ (Maintenance marks resolved)
RESOLVED
   ↓
   ├──> VERIFIED  (Reporter confirms issue is fixed)
   └──> REOPENED  (Reporter flags issue as unresolved)
            ↓
        IN_PROGRESS
```

---

## Seed Accounts (Quick Demo Logins)

The application includes pre-configured demo credentials available directly via 1-click buttons on `/login`:

| Role | Email | Password | Description |
|---|---|---|---|
| **Administrator** | `admin@fixmycampus.edu` | `Admin@123` | Full control over issues, assignments, departments, and users |
| **Student** | `student@fixmycampus.edu` | `Student@123` | Submit issues, upload photos, track reports, verify resolutions |
| **Maintenance** | `maintenance@fixmycampus.edu` | `Maint@123` | View assigned tasks, click Start Work, Mark Resolved |
| **Faculty** | `faculty@fixmycampus.edu` | `Faculty@123` | Submit and track department equipment and classroom repairs |

---

## Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **npm**: v9+

### 2. Configure Environment Variables
Copy `.env.example` to `backend/.env` and `frontend/.env.local`:
```bash
# Backend (.env)
PORT=3001
FRONTEND_URL=http://localhost:3000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.your-project.supabase.co:5432/postgres"
JWT_SECRET="your-super-secret-jwt-key"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"

# Frontend (.env.local)
NEXT_PUBLIC_GRAPHQL_URL="http://localhost:3001/graphql"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 3. Install & Run Backend
```bash
cd backend
npm install
npx prisma generate
npm run start
```
*Backend runs on `http://localhost:3001/graphql`*

### 4. Install & Run Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## Verification Demo Workflow

You can test the complete end-to-end lifecycle in under 2 minutes:
1. Navigate to `http://localhost:3000/login` and click **👤 Student**.
2. Click **+ Report an Issue** and submit:
   - **Title**: *Broken Classroom Fan*
   - **Category**: *Equipment*
   - **Location**: *Block A - Room 204*
   - **Priority**: *High*
3. The issue is submitted with ticket `#FM...` and enters `REPORTED` state.
4. Log out and sign in as **🛡️ Admin** (`admin@fixmycampus.edu`).
5. Open the issue, click **Assign Staff & Department**, and dispatch it to *General Maintenance* / *Sajeev K.*.
6. Log out and sign in as **🔧 Maintenance** (`maintenance@fixmycampus.edu`).
7. Notice the new task in the queue. Click **Start Work** (status transitions to `IN_PROGRESS`).
8. Add a progress comment (*"Capacitor replaced, testing fan speed."*) and click **Mark Resolved** (status transitions to `RESOLVED`).
9. Sign in as **👤 Student** (`student@fixmycampus.edu`).
10. Check notifications bell. Click the issue and press **Verify Resolution** (status transitions to `VERIFIED`).
11. Visit `/admin/analytics` to view live recalculated metrics and charts.
