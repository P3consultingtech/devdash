# Contributing to DevDash

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Start PostgreSQL: `docker compose -f docker/docker-compose.dev.yml up -d`
4. Copy env: `cp .env.example apps/api/.env`
5. Run migrations: `pnpm db:migrate`
6. Start dev servers: `pnpm dev`

## Project Structure

- `apps/web` - React frontend
- `apps/api` - Express API
- `packages/shared` - Shared types and schemas

## Guidelines

- Write TypeScript with strict mode
- Use Zod for validation (shared between FE/BE)
- Amounts always in cents (integer)
- Support both IT and EN locales
- Follow existing code patterns

## Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. Ensure `pnpm type-check` passes
4. Submit a PR with a clear description
