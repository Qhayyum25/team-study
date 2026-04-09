# Smart Study Group Finder

## Overview

A full-stack web application for KITS college students to find, create, and join study groups organized by subject.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/smart-study) with Tailwind CSS, Shadcn UI, React Query
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Session Auth**: express-session with cookie-based sessions
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Users (Demo)

- Rahul: rahul@kits.edu / 123 (student, pre-seeded)
- Priya: priya@kits.edu / 123 (student, pre-seeded)
- Admin: admin@kits.edu / admin (admin, fixed — cannot be overwritten via registration)
- New users can self-register via /register (must use @kits.edu email)

## Features

- User authentication via session cookies
- Dashboard with study group cards and subject filter
- Create study group form
- Join groups (no duplicates)
- Group detail page with members list and real-time chat (3s polling)
- Admin panel to delete groups

## Database Tables

- users (id, name, email, password, role)
- groups (id, name, subject, topic, exam_target, created_by)
- members (id, user_id, group_id)
- messages (id, group_id, user_id, message, timestamp)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## API Routes

All routes under `/api`:
- POST /auth/login — Login
- POST /auth/logout — Logout
- GET /auth/me — Current user
- GET /groups?subject= — List groups
- POST /groups — Create group
- GET /groups/:id — Group detail
- DELETE /groups/:id — Delete group (admin)
- POST /groups/:id/join — Join group
- GET /groups/:id/members — Group members
- GET /groups/:id/messages — Group messages
- POST /groups/:id/messages — Send message
