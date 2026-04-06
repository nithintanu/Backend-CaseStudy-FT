# Zorvyn Backend Case Study

A TypeScript-first Express and PostgreSQL backend for authentication, role-based access control, financial records, and dashboard analytics.

## Overview

This project focuses on:

- API design and route structure
- business logic separation
- role-based access control
- validation and error handling
- relational data modeling
- dashboard-style aggregation APIs
- maintainability through TypeScript, tests, and documentation

The current version includes:

- TypeScript across the application, database bootstrap, and developer scripts
- layered architecture with typed controllers, services, models, middleware, and shared domain types
- fail-fast startup that initializes the database before serving traffic
- authorization enforced in both middleware and service logic
- unit and integration test coverage for key flows
- soft delete support for records
- lightweight SQL migration runner for schema evolution
- Swagger documentation for API review and demo

## Features

This project covers the core assignment requirements and a few useful extras:

- user management with roles and status changes
- record CRUD with filtering, pagination, search, and soft delete
- analytics endpoints for totals, category breakdowns, recent activity, and trends
- JWT authentication with middleware and service-layer authorization
- Joi validation with structured error responses
- PostgreSQL persistence with SQL migrations and seeded demo users
- unit and integration tests plus Swagger documentation

## Access Model

The role model used in this submission is intentionally explicit:

- `viewer`: can authenticate and access dashboard analytics only
- `analyst`: can read records, create records, manage their own records, and access analytics
- `admin`: full access to users, records, and analytics

This role model is stricter than the example in the brief: viewers can inspect dashboard-level information but cannot access raw records. Access rules are enforced in both middleware and service logic.

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Joi
- JWT
- Jest
- Supertest

## Project Structure

```text
Zorvyn/
|-- src/
|   |-- app.ts
|   |-- server.ts
|   |-- config/
|   |-- constants/
|   |-- controllers/
|   |-- docs/
|   |-- errors/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- services/
|   |-- types/
|   |-- utils/
|   `-- validation/
|-- database/
|   |-- init.ts
|   `-- migrations/
|-- scripts/
|-- tests/
|-- tsconfig.json
`-- jest.config.cjs
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+

### Install

```bash
npm install
```

### Configure

Create `.env` from `.env.example` and update the database values if needed.

### Environment Variables

The main configuration values are:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRY`
- `API_BASE_URL` optional

### Database Setup

```bash
npm run db:create
npm run db:init
npm run seed
```

`npm run db:init` bootstraps the migration table and applies all SQL migrations from `database/migrations`.

### Development

```bash
npm run dev
```

The API is available at `http://localhost:5000/api`.

Swagger UI is available at `http://localhost:5000/api-docs`.

## Review Flow

For a quick review:

1. Run `npm install`, configure `.env`, then execute `npm run db:create`, `npm run db:init`, and `npm run seed`.
2. Start the server with `npm run dev`.
3. Open Swagger at `http://localhost:5000/api-docs`.
4. Login with the seeded `admin`, `analyst`, and `viewer` accounts to compare access behavior.
5. Test record CRUD as `admin` or `analyst`, then verify analytics endpoints across roles.

## Build And Run

```bash
npm run build
npm start
```

## Deployment

### Render

This repository now includes a `render.yaml` blueprint for a Node web service plus PostgreSQL database.

Typical deployment flow:

1. Push the repository to GitHub.
2. In Render, create a new Blueprint from the repository.
3. Let Render provision the `zorvyn-backend` web service and `zorvyn-db` PostgreSQL database.
4. Open `/api-docs` and test with the seeded accounts after seeding data.

The Render service configuration uses:

- `npm ci && npm run build` as the build command
- `npm start` as the start command
- `/api/health` as the health check path

Migrations run during application startup, so a separate pre-deploy migration command is not required for the free Render web service tier.

### Docker

This repository also includes a production-ready `Dockerfile` and `.dockerignore`.

Build and run locally with Docker:

```bash
docker build -t zorvyn-backend .
docker run --env-file .env -p 5000:5000 zorvyn-backend
```

## Tests

```bash
npm test
```

Current automated test strength:

- 13 passing test suites
- 72 passing tests
- roughly 86 percent line coverage

Optional API smoke test against a running local server:

```bash
npm run test:api
```

## Seeded Users

```text
Admin:   admin / admin123
Analyst: analyst / analyst123
Viewer:  viewer / viewer123
```

## API Overview

All business endpoints are mounted under `/api`. A minimal review path is:

- `POST /api/auth/login` to obtain a JWT
- use `Authorize` in Swagger with `Bearer <token>`
- compare `viewer`, `analyst`, and `admin` behavior across `/analytics`, `/records`, and `/users`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users

- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `POST /api/users/:id/assign-role`
- `POST /api/users/:id/change-status`

### Records

- `GET /api/records`
- `POST /api/records`
- `GET /api/records/:id`
- `PUT /api/records/:id`
- `DELETE /api/records/:id`
- `GET /api/records/summary`
- `GET /api/records/admin/all`

### Analytics

- `GET /api/analytics/summary`
- `GET /api/analytics/income`
- `GET /api/analytics/expenses`
- `GET /api/analytics/balance`
- `GET /api/analytics/categories`
- `GET /api/analytics/recent`
- `GET /api/analytics/trends`
- `GET /api/analytics/admin/dashboard`

## Record Listing Features

The records API supports:

- filtering by `type`
- filtering by `category`
- filtering by `startDate` and `endDate`
- lightweight text search with `query`
- pagination with `page` and `limit`

Delete behavior is implemented as soft delete, so removed records are excluded from normal queries and analytics while preserving historical integrity.

## Implementation Notes

- startup no longer initializes the database during the first request
- non-admin profile access is restricted to self in the service layer
- record deletion and record ownership rules are enforced in service logic
- record listing supports pagination and search
- validation strips unknown fields and returns structured error payloads
- scripts and app code share the same typed configuration and database helpers
- schema evolution is migration-driven instead of being spread across ad hoc database changes

## Requirement Mapping

- User and role management: user CRUD-style management, role assignment, and status updates are exposed through `/users` routes with role checks.
- Financial records management: records support create, read, update, delete, date/category/type filters, pagination, and query search.
- Dashboard summary APIs: analytics endpoints provide income, expenses, net balance, category totals, recent activity, and trends.
- Access control: JWT authentication plus role/permission middleware and service-level authorization checks.
- Validation and error handling: Joi request validation and typed error responses via `AppError`.
- Data persistence: PostgreSQL with migration-driven schema setup, soft delete support, and seed scripts.

## Assumptions And Tradeoffs

- Authentication uses JWT for simplicity instead of refresh-token or session-based flows.
- The chosen role model is slightly stricter and more explicit than the assignment examples for viewers.
- Records are soft-deleted so dashboards and admin review can evolve without losing historical data.
- PostgreSQL setup is migration-first. The initialization command is a bootstrap step that ensures migrations can run cleanly on a fresh database.
- The project prioritizes clarity and maintainability over introducing extra infrastructure such as refresh tokens, ORM abstractions, or production-grade rate limiting.

## Main Scripts

```bash
npm run dev
npm run build
npm start
npm run db:create
npm run db:init
npm run db:migrate
npm run seed
npm test
npm run test:api
```
