# Clinch CRM - Production AI CRM SaaS System

> **Tagline:** *"Turn every customer interaction into your next opportunity."*

Clinch CRM is a full-stack, multi-tenant Customer Relationship Management (CRM) application built with **Java 21, Spring Boot 3.2, MySQL 8.0, Flyway, Redis, React 18, TypeScript, Vite**, and **Tailwind CSS**.

---

## Key Features

- **Multi-Tenant Security**: Strict database tenant isolation (`organization_id` context binding & JWT filtering).
- **Role-Based Access Control (RBAC)**: Support for `OWNER`, `ADMIN`, `SALES_MANAGER`, `SALES_REP`, and `VIEWER` roles.
- **Authentication & Security**: JWT Access Tokens, Refresh Token rotation, BCrypt hashing, Password reset flow, and Email verification tokens.
- **Core CRM Domain**:
  - **Leads**: AI lead scoring (0–100 with explanation), source attribution, and conversion flow to Contact + Company + Deal with duplicate checks.
  - **Contacts & Companies**: Full interaction timeline aggregator, firmographics, and contact relationship tracking.
  - **Pipeline & Deals**: Drag-and-drop Kanban deal board, customizable stages, win probabilities, and mandatory Lost Reason modal for Closed Lost deals.
  - **Activities & Tasks**: Chronological interaction logging, overdue task badges, and priority tracking.
  - **Calendar & Meetings**: Meeting scheduler and AI transcript action item extractor.
- **AI Intelligence & RAG Knowledge Base**:
  - AI Contact & Account Summaries.
  - AI Deal Risk Detector (HIGH / MEDIUM / LOW risk level with reasoning).
  - AI Email Generator with tone picker (Professional, Friendly, Concise, Persuasive).
  - AI Sales Forecasting Engine.
  - RAG Knowledge Base PDF/TXT document indexing & vector similarity search with document citations.
- **Analytics & Audit Logs**: Interactive Recharts visualizations and immutable security audit trail (`audit_logs`).

---

## Tech Stack

### Backend
- **Java 21** & **Spring Boot 3.2.x**
- **Spring Security** (Stateless JWT authentication & `@PreAuthorize` RBAC)
- **Spring Data JPA & Hibernate**
- **MySQL 8.0** with **Flyway** schema migrations
- **Apache PDFBox** for text extraction
- **Lombok** & **Bean Validation**

### Frontend
- **React 18**, **TypeScript**, **Vite**
- **Tailwind CSS** with Glassmorphism SaaS aesthetics
- **Lucide Icons** & **Recharts**
- **TanStack Query** & **Axios** with automatic JWT interceptors

---

## Project Structure

```
AICRM/
├── docker-compose.yml
├── backend/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       ├── main/java/com/nexusai/crm/
│       │   ├── config/ (Security, Web, Jwt, Redis)
│       │   ├── controller/ (Auth, Lead, Contact, Company, Deal, Activity, Task, Meeting, Ai, Document, Dashboard, Audit)
│       │   ├── dto/ (Request & Response DTOs)
│       │   ├── entity/ (MySQL Entities & Enums)
│       │   ├── exception/ (Global Exception Handler & Error Format)
│       │   ├── repository/ (Tenant-aware Spring Data Repositories)
│       │   ├── security/ (JwtProvider, TenantContextFilter, SecurityUtils)
│       │   └── service/ (Auth, Lead, Deal, Ai, Rag, Dashboard, Audit)
│       └── main/resources/
│           ├── application.yml
│           └── db/migration/ (V1__init_schema.sql, V2__seed_initial_data.sql)
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── api/ (Axios client & endpoint modules)
        ├── components/ (Sidebar, Topbar, AppLayout, GlobalSearchModal, KanbanBoard)
        ├── context/ (AuthContext)
        ├── pages/ (Login, Register, Dashboard, Leads, LeadDetail, Contacts, Companies, Deals, Activities, Tasks, Calendar, AiAssistant, KnowledgeBase, Analytics, Settings, AuditLogs)
        └── types/ (TypeScript DTO interfaces)
```

---

## Quick Start (Docker Compose)

To run the complete production stack (MySQL, Redis, Backend, and Frontend):

```bash
docker-compose up --build
```

Access the application at:
- **Frontend App**: `http://localhost:80` (or `http://localhost:5173` in local dev mode)
- **Backend API**: `http://localhost:8080/api/v1`
