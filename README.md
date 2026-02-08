<p align="center">
  <img src="apps/web/public/favicon.svg" width="80" height="80" alt="DevDash logo" />
</p>

<h1 align="center">DevDash</h1>

<p align="center">
  <strong>Dashboard self-hosted per freelancer e PMI</strong><br/>
  Gestisci clienti, fatture e finanze con la fiscalità italiana integrata.
</p>

<p align="center">
  <a href="#features">Features</a> · <a href="#quick-start">Quick Start</a> · <a href="#tech-stack">Tech Stack</a> · <a href="#documentation">Docs</a> · <a href="#license">License</a>
</p>

---

> **Un progetto ideato da [P3consulting.tech](https://p3consulting.tech)**

---

## Features

- **Gestione Clienti** — CRUD completo con dati fiscali italiani (P.IVA, Codice Fiscale, Codice Destinatario SDI, PEC)
- **Gestione Fatture** — Numerazione progressiva automatica (`FT-1/2026`), workflow di stato (Bozza → Inviata → Pagata / Scaduta → Annullata)
- **Motore Fiscale Italiano** — Calcolo automatico di IVA, ritenuta d'acconto, cassa previdenziale, bollo virtuale. Importi in centesimi per evitare errori floating-point
- **Generazione PDF** — Fatture professionali con logo aziendale, header azienda, dati cliente, tabella righe, riepilogo fiscale completo e IBAN
- **Logo Azienda** — Upload del logo dall'area impostazioni, visualizzato automaticamente nel PDF delle fatture
- **Scadenza Automatica** — Le fatture inviate vengono marcate come "Scaduta" automaticamente quando superano la data di scadenza
- **Export CSV** — Esporta la lista clienti e fatture in formato CSV compatibile con Excel
- **Dashboard & Analytics** — KPI, grafico fatturato mensile, fatture per stato, top clienti, attività recente (Recharts)
- **Multi-lingua** — Italiano e Inglese dal giorno uno (i18n con 6 namespace)
- **Dark Mode** — Tema chiaro, scuro e automatico di sistema
- **Self-hosted** — Docker Compose per deploy in produzione con un solo comando

## Tech Stack

| Layer | Tecnologie |
|-------|-----------|
| **Frontend** | React 19, Vite 6, TypeScript, Tailwind CSS 4, shadcn/ui, TanStack Query 5, Zustand 5, React Hook Form + Zod, react-i18next, Recharts |
| **Backend** | Node.js, Express 5, Prisma 6, PostgreSQL 17, JWT auth (access + refresh), PDFKit, Zod validation |
| **Shared** | `packages/shared` — Tipi TypeScript e schemi Zod condivisi tra frontend e backend |
| **Infra** | Docker Compose, Nginx, GitHub Actions CI |

## Quick Start

### Prerequisiti

- Node.js >= 20
- pnpm >= 9
- Docker (per PostgreSQL)

### Development

```bash
# Clona il repository
git clone https://github.com/P3consultingtech/devdash.git
cd devdash

# Installa le dipendenze
pnpm install

# Avvia PostgreSQL
docker compose -f docker/docker-compose.dev.yml up -d

# Copia le variabili d'ambiente
cp .env.example apps/api/.env

# Esegui le migration del database
pnpm db:migrate

# Popola con dati demo
pnpm db:seed

# Avvia i server di sviluppo
pnpm dev
```

L'app sarà disponibile su:

| Servizio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3001 |
| **Demo login** | `demo@devdash.dev` / `password123` |

### Produzione (Docker)

```bash
cd docker
docker compose up -d
```

Consulta la [Guida al Self-Hosting](docs/SELF_HOSTING.md) per la configurazione completa in produzione.

## Project Structure

```
devdash/
├── apps/
│   ├── web/              # React frontend (Vite)
│   │   ├── public/locales/   # i18n (IT + EN, 6 namespace)
│   │   └── src/
│   │       ├── app/          # App, router, providers
│   │       ├── components/   # ui/ (shadcn), layouts/, shared/
│   │       ├── features/     # auth, dashboard, clients, invoices, settings
│   │       ├── stores/       # Zustand (auth, ui)
│   │       ├── hooks/        # useDebounce
│   │       └── lib/          # api-client, i18n, format, utils
│   └── api/              # Express backend
│       ├── prisma/           # Schema, migrations, seed
│       └── src/
│           ├── config/       # env, database, logger
│           ├── middleware/    # auth, validate, error-handler, cors, rate-limit
│           ├── modules/      # auth, clients, invoices, dashboard, settings, pdf
│           └── utils/        # password, jwt, pagination, italian-tax
├── packages/
│   └── shared/           # Tipi + Zod schemas condivisi FE/BE
├── docker/               # Docker Compose, Dockerfiles, Nginx
└── docs/                 # Documentazione
```

## Motore Fiscale Italiano

Il calcolo della fattura segue la normativa italiana:

```
Imponibile          = Somma righe (qtà × prezzo unitario)
Cassa previdenziale = % dell'imponibile (es. INPS 4%)
Base imponibile     = Imponibile + Cassa
IVA                 = % della base imponibile (es. 22%)
Bollo virtuale      = €2,00 fissi (se esente IVA e totale > €77,47)
Totale lordo        = Base imponibile + IVA + Bollo
Ritenuta d'acconto  = % della base imponibile (es. 20%)
Netto a pagare      = Totale lordo − Ritenuta
```

Tutti gli importi sono memorizzati in **centesimi** (interi) per evitare errori di arrotondamento. `12350` = €123,50.

## API Reference

Base URL: `/api/v1`

| Modulo | Endpoints |
|--------|-----------|
| **Auth** | `POST register, login, refresh, logout` · `GET me` |
| **Clients** | `GET list` (paginato, filtri, search) · `GET :id` · `POST` · `PUT :id` · `DELETE :id` (soft) · `GET export` (CSV) |
| **Invoices** | `GET list` · `GET :id` · `POST` · `PUT :id` (solo DRAFT) · `DELETE :id` (solo DRAFT) · `PATCH :id/status` · `POST :id/duplicate` · `GET :id/pdf` · `GET next-number` · `GET export` (CSV) |
| **Dashboard** | `GET summary, revenue, invoices-by-status, top-clients, recent-activity` |
| **Settings** | `GET/PUT profile, business, preferences` · `POST logo` · `DELETE logo` |

Consulta la [documentazione API completa](docs/API.md) per i dettagli.

## Documentation

- [Architettura](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Guida al Self-Hosting](docs/SELF_HOSTING.md)
- [Contributing](docs/CONTRIBUTING.md)

## Contributing

I contributi sono benvenuti! Leggi le [linee guida per contribuire](docs/CONTRIBUTING.md) prima di aprire una PR.

## License

Rilasciato sotto licenza [MIT](LICENSE).

**DevDash** è un progetto ideato e sviluppato da **[P3consulting.tech](https://p3consulting.tech)**.
