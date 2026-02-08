# DevDash

Self-hosted dashboard for freelancers and SMBs to manage clients, invoices, and finances. Built with Italian tax compliance in mind (P.IVA, ritenuta d'acconto, cassa previdenziale, bollo virtuale).

## Features

- **Client Management** - Full CRUD with Italian fiscal data (P.IVA, Codice Fiscale, SDI, PEC)
- **Invoice Management** - Progressive numbering, automatic tax calculations, status workflow
- **Italian Tax Engine** - IVA, ritenuta d'acconto, cassa previdenziale, bollo virtuale
- **PDF Generation** - Professional Italian invoice PDFs with all fiscal details
- **Dashboard** - Revenue charts, KPIs, top clients, invoice status overview
- **Multi-language** - Italian and English from day one (i18n)
- **Dark Mode** - Light, dark, and system theme support
- **Self-hosted** - Docker Compose for easy deployment

## Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand
- **Backend**: Node.js, Express, Prisma, PostgreSQL, JWT auth, PDFKit
- **Infrastructure**: Docker Compose, Nginx, GitHub Actions CI

## Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker (for PostgreSQL)

### Development

```bash
# Clone the repo
git clone https://github.com/your-username/devdash.git
cd devdash

# Install dependencies
pnpm install

# Start PostgreSQL
docker compose -f docker/docker-compose.dev.yml up -d

# Copy environment variables
cp .env.example apps/api/.env

# Run database migrations
pnpm db:migrate

# Seed demo data
pnpm db:seed

# Start development servers
pnpm dev
```

The app will be available at:
- Frontend: http://localhost:5173
- API: http://localhost:3001
- Demo login: `demo@devdash.dev` / `password123`

### Production (Docker)

```bash
cd docker
docker compose up -d
```

See [SELF_HOSTING.md](docs/SELF_HOSTING.md) for detailed production setup.

## Project Structure

```
devdash/
├── apps/
│   ├── web/          # React frontend (Vite)
│   └── api/          # Express backend (Prisma + PostgreSQL)
├── packages/
│   └── shared/       # Shared types and Zod schemas
├── docker/           # Docker Compose configs
└── docs/             # Documentation
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Self-Hosting Guide](docs/SELF_HOSTING.md)
- [Contributing](docs/CONTRIBUTING.md)

## License

MIT
