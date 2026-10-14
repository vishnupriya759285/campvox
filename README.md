# 🏛️ CAMPVOX (FixMyCampus)
### Smart Campus Issue Reporting, Maintenance Dispatch & Workflow Platform
> *"Your Campus. Better, Every Day."*

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS 10](https://img.shields.io/badge/NestJS-10.0-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![Apollo GraphQL](https://img.shields.io/badge/GraphQL-Apollo-311C87?style=for-the-badge&logo=graphql)](https://graphql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=postgresql)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Production%20Ready-000000?style=for-the-badge&logo=vercel)](https://campvox.vishnupriyamv.in/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## 🌐 Live Production Application

- **Primary Production URL**: [https://campvox.vishnupriyamv.in/](https://campvox.vishnupriyamv.in/)
- **Vercel Cloud Production**: [https://frontend-peach-tau-92.vercel.app/](https://frontend-peach-tau-92.vercel.app/)
- **Repository**: [https://github.com/vishnupriya759285/campvox.git](https://github.com/vishnupriya759285/campvox.git)

---

## 📌 Executive Summary

**CAMPVOX** is an enterprise-grade, full-stack campus operations platform built to solve the systemic challenges of facility and infrastructure management across college campuses. 

In traditional campus environments, maintenance grievances are reported through informal verbal complaints, physical logbooks, or fragmented messaging groups. This leads to lost tickets, lack of accountability, no turnaround time tracking, and poor student-administration trust.

CAMPVOX delivers an automated, transparent, and multi-role solution:
- **Public Campus Portal**: Instant access to facility maintenance directories across Academic Blocks, Hostels, Staff Quarters, and Guest Houses without compulsory authentication.
- **Student Care Centre**: One-click grievance filing with automatic GPS location tagging, facility zone chips, priority escalation, and photo uploads.
- **Admin Command Portal**: Real-time ticket dispatch, worker allocation across registered technicians, and one-click status transitions.
- **Technician Operations**: Department-segregated task queues with immediate status progression and audit trail history.
- **Analytics & Governance**: Department performance metrics, recurring incident hotspots, and resolution timeline tracking.

---

## 📸 Visual Showcase & Interface Gallery

### 1. Student Dashboard & Campus Overview
Personalized student command center displaying live ticket resolution metrics, recent issue status chips, quick action shortcuts, and official campus circulars.

![Student Dashboard](screenshots/01-student-dashboard.png)

---

### 2. Issue Reporting with Location & Zone Selection
Intuitive submission interface with category selectors, quick campus facility chips (Academic Blocks, Hostels, Quarters, Guest House), priority indicators, and photo upload dropzone.

![Report Campus Issue](screenshots/02-report-issue-form.png)

---

### 3. Issue Details & Admin Quick Actions
Comprehensive ticket details page showing chronological status timeline, category metadata, reporter identity, and role-guarded Admin Quick Actions.

![Issue Details Admin Quick Actions](screenshots/03-issue-details-admin.png)

---

### 4. Technician Allocation & Worker Dispatch Modal
Departmental allocation interface with 12 pre-registered technicians across Electrical, Plumbing, IT, and Facilities, complete with direct contact numbers and live dispatch status.

![Worker Assignment Modal](screenshots/04-worker-assignment-modal.png)

---

### 5. In-Progress Task & Technician Dispatch Card
Live status progression view reflecting technician assignment, technician phone badge, and one-click resolution triggers.

![Issue In Progress State](screenshots/05-issue-in-progress-assigned.png)


---

## 🏗️ System Architecture

CAMPVOX adopts a modern **Backend-for-Frontend (BFF) / Clean Micro-Service Architecture** enabling seamless high-speed local development and zero-cold-start edge cloud deployment.

```mermaid
graph TD
    User([Students, Faculty, Staff, Admins, Visitors]) -->|HTTPS / Next.js 14 App Router| FE[CampVox Web Client / Tailwind CSS]
    
    subgraph Client & Edge Layer
        FE -->|GraphQL Queries & Mutations| EdgeBFF[Next.js API Edge Route /api/graphql]
        EdgeBFF --> AuthGuard[JWT Verification & RBAC Guards]
    end

    subgraph Core Services Layer
        AuthGuard --> BE[NestJS Core API Service :3001]
        BE --> AuthMod[Authentication Module / Bcrypt]
        BE --> IssuesMod[6-Stage State Machine Engine]
        BE --> WorkersMod[Worker Allocation & Directory]
        BE --> DeptsMod[Departments Service]
        BE --> NotifsMod[Notification Center]
        BE --> AnalyticsMod[SQL Aggregations & Hotspots]
    end

    subgraph Data & Storage Layer
        BE -->|Prisma 5 ORM Client| DB[(PostgreSQL Supabase Database)]
        FE -->|Multipart / Public CDN| Storage[(Supabase Storage: issue-images)]
    end
```

---

## 🗄️ Database Schema & Entity Relationship Model

The relational architecture is modeled with **Prisma ORM** targeting **PostgreSQL (Supabase)**:

```mermaid
erDiagram
    User ||--o{ Issue : reports
    User ||--o{ Issue : assigned_to
    User ||--o{ Comment : writes
    User ||--o{ Notification : receives
    Department ||--o{ Issue : categorizes
    Department ||--o{ User : employs
    Issue ||--o{ StatusHistory : tracks
    Issue ||--o{ Comment : contains

    User {
        string id PK
        string email UK
        string name
        string role "STUDENT | FACULTY | STAFF | MAINTENANCE | ADMIN"
        string departmentId FK
        string phone
        datetime createdAt
    }

    Department {
        string id PK
        string name UK
        string description
        string headId FK
    }

    Issue {
        string id PK
        string title
        string description
        string category
        string priority "LOW | MEDIUM | HIGH | CRITICAL"
        string status "REPORTED | ASSIGNED | IN_PROGRESS | RESOLVED | VERIFIED | REOPENED"
        string location
        string campusZone "INSTITUTION | HOSTEL | STAFF_QUARTERS | GUEST_HOUSE"
        string imageUrl
        string reporterId FK
        string departmentId FK
        string assignedToId FK
        datetime createdAt
        datetime updatedAt
    }

    StatusHistory {
        string id PK
        string issueId FK
        string fromStatus
        string toStatus
        string changedById FK
        string notes
        datetime createdAt
    }

    Comment {
        string id PK
        string issueId FK
        string userId FK
        string content
        datetime createdAt
    }

    Notification {
        string id PK
        string userId FK
        string title
        string message
        boolean isRead
        datetime createdAt
    }
```

---

## 🔄 Issue Lifecycle & State Machine

Every campus grievance transitions through a deterministic, auditable 6-stage lifecycle:

```
    ┌──────────────┐
    │   REPORTED   │ ◄── Student files issue with photo & zone
    └──────┬───────┘
           │ (Admin dispatches department & technician)
           ▼
    ┌──────────────┐
    │   ASSIGNED   │
    └──────┬───────┘
           │ (Technician reviews task & begins work)
           ▼
    ┌──────────────┐
    │ IN_PROGRESS  │ ◄─────────────────────────┐
    └──────┬───────┘                           │
           │ (Work completed on site)          │ (Reporter flags
           ▼                                   │  issue as unresolved)
    ┌──────────────┐                           │
    │   RESOLVED   │                           │
    └──────┬───────┘                           │
           │                                   │
           ├─────────────────┐                 │
           ▼                 ▼                 │
    ┌──────────────┐  ┌──────────────┐         │
    │   VERIFIED   │  │   REOPENED   ├─────────┘
    └──────────────┘  └──────────────┘
    (Reporter confirms  (Admin / Tech
     satisfaction)       re-evaluates)
```

---

## 👥 Pre-Configured Campus Technicians Directory

CAMPVOX includes 12 active campus technicians categorized into 4 core operational departments:

| Department | Technician Name | Designation | Contact Number | Status |
|---|---|---|---|---|
| **Electrical** | Rajesh Kumar | Senior Campus Electrician | `+91 98450 11111` | Ready to Dispatch |
| **Electrical** | Suresh M. | Assistant Electrician | `+91 98450 11112` | Ready to Dispatch |
| **Electrical** | Anand P. | Electrical Maintenance Tech | `+91 98450 11113` | Ready to Dispatch |
| **Plumbing** | Ramesh Babu | Senior Plumber | `+91 98450 22221` | Ready to Dispatch |
| **Plumbing** | Manjunath V. | Water Lines & Sanitation | `+91 98450 22222` | Ready to Dispatch |
| **Plumbing** | Shiva Kumar | General Plumbing Tech | `+91 98450 22223` | Ready to Dispatch |
| **IT & Network** | Karthik S. | Network Systems Engineer | `+91 98450 33331` | Ready to Dispatch |
| **IT & Network** | Vignesh R. | Wi-Fi & Hardware Specialist | `+91 98450 33332` | Ready to Dispatch |
| **IT & Network** | Deepa N. | Smart Classroom Tech Support | `+91 98450 33333` | Ready to Dispatch |
| **Facilities & Civil**| Sajeev K. | Campus Maintenance Staff | `+91 98450 00000` | Ready to Dispatch |
| **Facilities & Civil**| Govind R. | Carpenter & Civil Works | `+91 98450 44442` | Ready to Dispatch |
| **Facilities & Civil**| Venkatesh M.| Grounds & Structural Tech | `+91 98450 44443` | Ready to Dispatch |

---

## 🔐 Role-Based Access Control (RBAC) Matrix

| Capability | Guest / Public | Student | Faculty / Staff | Maintenance | Administrator |
|---|:---:|:---:|:---:|:---:|:---:|
| Browse Public Facility Zones | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit New Maintenance Ticket | ❌ | ✅ | ✅ | ❌ | ✅ |
| Upload Issue Photos | ❌ | ✅ | ✅ | ❌ | ✅ |
| View Own Submissions | ❌ | ✅ | ✅ | ❌ | ✅ |
| Verify Resolution / Reopen | ❌ | ✅ (Own) | ✅ (Own) | ❌ | ✅ |
| View Assigned Work Queue | ❌ | ❌ | ❌ | ✅ | ✅ |
| Update Status to In-Progress / Resolved | ❌ | ❌ | ❌ | ✅ (Assigned) | ✅ |
| Allocate Registered Workers | ❌ | ❌ | ❌ | ❌ | ✅ |
| Execute 1-Click Status Overrides | ❌ | ❌ | ❌ | ❌ | ✅ |
| Access Analytics Dashboard & Hotspots | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 💻 Tech Stack & Engineering Tools

### Frontend
- **Framework**: Next.js 14+ (App Router architecture)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS & Modern Glassmorphic Design Tokens
- **State & Data**: Apollo Client 3.x, React Context API
- **Icons & Charts**: Lucide React, Recharts
- **Forms & Validation**: Controlled React hooks, client-side bounds checking

### Backend & API
- **API Engine**: NestJS 10 (Apollo GraphQL code-first schema)
- **Authentication**: Passport JWT, BcryptJS password hashing
- **Data Access**: Prisma 5 ORM with connection pooling
- **Validation**: `class-validator`, `class-transformer`
- **Edge BFF**: Next.js App Router GraphQL Route Handler (`/api/graphql`)

### Cloud & Infrastructure
- **Database**: Supabase PostgreSQL
- **Media Storage**: Supabase S3-compatible Object Storage (`issue-images` bucket)
- **Deployment Platform**: Vercel Cloud (Edge-accelerated production)
- **Containers**: Docker & Docker Compose

---

## 🚀 Getting Started & Local Setup

### 1. Prerequisites
- **Node.js**: `v18.x` or `v20.x`
- **npm**: `v9.x` or higher
- **PostgreSQL / Supabase** account

### 2. Clone the Repository
```bash
git clone https://github.com/vishnupriya759285/campvox.git
cd campvox
```

### 3. Configure Environment Variables
Copy `.env.example` to `backend/.env` and `frontend/.env.local`:

```bash
# backend/.env
PORT=3001
FRONTEND_URL=http://localhost:3000
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
JWT_SECRET="campvox-enterprise-jwt-super-secret-key"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# frontend/.env.local
NEXT_PUBLIC_GRAPHQL_URL="http://localhost:3001/graphql"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 4. Install & Launch Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```
*Backend runs on `http://localhost:3001/graphql`*

### 5. Install & Launch Frontend
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

### 6. Using Docker Compose (Single Command)
```bash
docker-compose up --build -d
```

---

## 🧪 Automated Testing & Verification

The repository includes end-to-end automated validation scripts:

```bash
# 1. Verify complete authentication, login token issuance & role restrictions
node test_auth_flow.js

# 2. Verify ticket reporting, payload validation & database storage
node test_issue_creation.js

# 3. Complete 6-stage lifecycle smoke verification (Reported -> Assigned -> Resolved -> Verified)
node verify_demo_flow.js
```

---

## 📁 Repository Directory Structure

```
campvox/
├── frontend/                          # Next.js 14 App Router Application
│   ├── app/                           # Routes and Layouts
│   │   ├── (auth)/login/              # Role-guarded Login Portal
│   │   ├── (auth)/register/           # User Registration Portal
│   │   ├── (dashboard)/               # Authenticated Dashboard Shell
│   │   │   ├── dashboard/             # Student / Staff Personal Dashboard
│   │   │   ├── issues/                # Searchable Issue Directory
│   │   │   │   ├── new/               # New Issue Reporting Form
│   │   │   │   └── [id]/              # Details, Timeline & Admin Quick Actions
│   │   │   ├── maintenance/           # Maintenance Assigned Queue
│   │   │   ├── admin/                 # Administration Operations Portal
│   │   │   │   ├── users/             # User Management & Roles
│   │   │   │   └── analytics/         # Resolution Trends & Department Charts
│   │   │   └── notifications/         # Notification Center
│   │   ├── api/graphql/route.ts       # Edge BFF GraphQL Engine
│   │   ├── globals.css                # CAMPVOX Design Tokens & Palette
│   │   ├── layout.tsx                 # Root Apollo & Auth Providers
│   │   └── page.tsx                   # Public Campus Landing Page
│   ├── components/                    # UI Components (BrandLogo, Timeline, Badges)
│   ├── lib/                           # Apollo Client, Workers Directory & Auth Context
│   └── package.json
│
├── backend/                           # NestJS 10 GraphQL Service
│   ├── src/
│   │   ├── auth/                      # JWT Strategy, Bcrypt & Guards
│   │   ├── issues/                    # 6-Stage Lifecycle State Machine
│   │   ├── departments/               # Department Management
│   │   ├── comments/                  # Issue Discussion Threads
│   │   ├── notifications/             # Notification Event Handlers
│   │   ├── analytics/                 # Aggregated Metric Services
│   │   └── prisma/                    # Database Service Bridge
│   ├── prisma/
│   │   ├── schema.prisma              # Database Schema & Index Definitions
│   │   └── seed.ts                    # Demo Data Seeder
│   └── package.json
│
├── screenshots/                       # High-Resolution Showcase Images
│   ├── 01-student-dashboard.png
│   ├── 02-report-issue-form.png
│   ├── 03-issue-details-admin.png
│   ├── 04-worker-assignment-modal.png
│   └── 05-issue-in-progress-assigned.png
│
├── docker-compose.yml                 # Multi-Container Orchestration
├── test_auth_flow.js                  # Authentication Integration Test
├── test_issue_creation.js             # Ticket Ingestion Test
├── verify_demo_flow.js                # Full Lifecycle State Machine Test
└── README.md                          # Master Project Documentation
```

---

## 🎓 Academic Relevance & Project Credits

This project was developed as a comprehensive engineering capstone project adhering to formal university standards:
- **Demonstrable Production Software**: Fully deployed on public cloud infrastructure ([campvox.vishnupriyamv.in](https://campvox.vishnupriyamv.in/)).
- **Relational Integrity**: Complete third-normal-form (3NF) relational database with foreign key cascades and audit histories.
- **Enterprise Software Principles**: Single-responsibility services, state machine pattern, and role-based access control.

---

## 📄 License

This project is licensed under the **MIT License**. Free for educational and campus institutional deployment.
