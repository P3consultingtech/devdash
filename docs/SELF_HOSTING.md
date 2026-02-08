# Self-Hosting Guide

## Requirements

- Docker and Docker Compose
- At least 1GB RAM
- PostgreSQL 17 (included in Docker Compose)

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/your-username/devdash.git
cd devdash/docker
```

2. Create a `.env` file:
```bash
JWT_SECRET=your-random-64-char-secret-here
JWT_REFRESH_SECRET=your-other-random-64-char-secret
CORS_ORIGIN=https://your-domain.com
```

3. Start the services:
```bash
docker compose up -d
```

4. Run migrations:
```bash
docker compose exec api npx prisma migrate deploy
```

5. (Optional) Seed demo data:
```bash
docker compose exec api npx prisma db seed
```

The app will be available at `http://localhost` (port 80).

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret for JWT access tokens | **required** |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | **required** |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost` |
| `DATABASE_URL` | PostgreSQL connection string | Set in docker-compose |

## HTTPS / Reverse Proxy

For production, put a reverse proxy (Caddy, Traefik, or nginx with Let's Encrypt) in front of the web container.

## Backups

PostgreSQL data is stored in a Docker volume. To backup:

```bash
docker compose exec postgres pg_dump -U devdash devdash > backup.sql
```

To restore:
```bash
cat backup.sql | docker compose exec -T postgres psql -U devdash devdash
```

## Updates

```bash
git pull
docker compose build
docker compose up -d
docker compose exec api npx prisma migrate deploy
```
