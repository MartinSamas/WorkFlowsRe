# AI Agent Instructions for WorkFlowsRe

## Architecture & Project Structure
This is a holiday request management system built with Next.js (App Router), React 19, and Tailwind CSS.
- **Frontend**: Next.js App Router (`app/`), using shadcn/ui components (`components/ui/`), React Hook Form, and Zod for validation.
- **Backend/API**: Next.js Route Handlers (`app/api/`), interacting with a database abstraction layer (`backend/db/`).
- **Database**: SQLite using `better-sqlite3` (`backend/db/sqlite.ts`), with an adapter pattern (`DatabaseAdapter` in `database.ts`) that allows switching to other databases. The database file is stored at `backend/data/workflows.db`.
- **Integrations**: Google Calendar (`backend/lib/google-calendar.ts`), Google Groups (`backend/lib/google-groups.ts`), and Nodemailer (`backend/lib/mailer.ts`).

## Critical Developer Workflows
- **Migrations**: Modifying the database requires three steps:
  1. Update `backend/db/schema.sql`.
  2. Update TypeScript interfaces and `DatabaseAdapter` in `backend/db/database.ts`.
  3. Implement the changes in `backend/db/sqlite.ts`.
  Note: The `initialize()` method in `sqlite.ts` runs `CREATE TABLE IF NOT EXISTS`, so adding tables is idempotent.

## Project-Specific Conventions
- **Authentication**: Custom JWT-based authentication using `jose`, with utils in `lib/auth-utils.ts` and middleware in `app/api/middleware/` or Next.js middleware.
- **Routing**: Protected routes are placed under the `app/(authenticated)/` route group.
- **Database Pattern**: Never use `better-sqlite3` directly in API routes. Always instantiate via `backend/lib/db.ts` to use the configured database adapter.
- **Component Styling**: Use Tailwind CSS with `cn()` utility (usually in `lib/utils.ts`) mixing `clsx` and `tailwind-merge` for class names.

## Guidelines for AI Agents
- Always inspect `backend/db/database.ts` before modifying any API route that interacts with data.
- When creating charts or complex data visualizations, leverage `recharts`.
- When adding new environment variables, check if they dictate infrastructure choices (like `DATABASE_TYPE`).

