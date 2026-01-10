# TECH STACK HARD CONSTRAINTS

## Architecture Overview
- **Monorepo Strategy:** Turborepo or simple npm workspaces.
- **API Communication:** REST (internal) & WebSocket (client-facing).
- **Data Source of Truth:** `packages/database/prisma/schema.prisma`.

## Component Specifics

### 🟢 Node.js Backend (`apps/api-core`)
- **Framework:** NestJS (Standard mode).
- **Language:** TypeScript 5.0+.
- **Database Access:** Prisma ORM.
- **Queues:** BullMQ (Redis) for dispatching jobs to Python.

### 🔵 Python AI Worker (`apps/ai-worker`)
- **Framework:** FastAPI.
- **Type Checking:** Pydantic (Strict).
- **AI Logic:** LangChain (Latest stable).
- **Vector Search:** `pgvector` (via SQLAlchemy).

### 🟠 Frontend Inbox (`apps/web-inbox`)
- **Framework:** Next.js 14+ (App Router).
- **UI Library:** Shadcn/UI + TailwindCSS.
- **State:** React Query (Server state), Zustand (Client state).

### 🔴 Infrastructure
- **Local:** Docker Compose (Postgres 16, Redis 7).
- **Production:** Kubernetes (Helm Charts).
- **Secret Management:** Environment variables loaded via `dotenv`.
