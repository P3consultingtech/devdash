# Architecture

## Overview

DevDash is a monorepo using pnpm workspaces and Turborepo. It consists of three packages:

- `apps/web` - React SPA (Vite)
- `apps/api` - Express REST API
- `packages/shared` - Shared TypeScript types and Zod schemas

## Key Design Decisions

### Amounts in Cents (Integer)

All monetary amounts are stored as integers in cents to avoid floating-point errors.
- `12350` = EUR 123.50
- Calculations are done in cents, displayed with `formatCurrency()`

### Italian Tax Engine

The invoice calculation engine in `packages/shared/src/utils/italian-tax.ts` handles:
1. **Subtotal** = sum of line items (qty * unit price)
2. **Cassa previdenziale** = % of subtotal (e.g. INPS 4%)
3. **Taxable base** = subtotal + cassa
4. **IVA** = % of taxable base (e.g. 22%)
5. **Bollo virtuale** = EUR 2.00 flat (when IVA-exempt)
6. **Gross total** = taxable base + IVA + bollo
7. **Ritenuta d'acconto** = % of taxable base (e.g. 20%)
8. **Net payable** = gross total - ritenuta

### Progressive Invoice Numbering

Invoices use atomic sequence numbering within a Prisma transaction:
- Format: `FT-{n}/{year}` (e.g. `FT-3/2026`)
- Unique constraint: `(userId, year, sequenceNumber)`

### Feature-Based Frontend Structure

Each feature (auth, clients, invoices, dashboard, settings) contains:
- `pages/` - Route components
- `api.ts` - API calls
- Optional `components/`, `hooks/`

### Auto-Overdue Invoices

SENT invoices past their `dueDate` are automatically marked as OVERDUE via:
- A check that runs before every `listInvoices` query (ensures fresh data on page load)
- A background hourly `setInterval` in the API server (catches overdue invoices without user interaction)

### CSV Export

Both clients and invoices can be exported as CSV files (`GET /clients/export`, `GET /invoices/export`). Files include a UTF-8 BOM for Excel compatibility.

### Company Logo

Users can upload a company logo (max 2MB, PNG/JPG/SVG/WebP) which is stored in `uploads/logos/`. When present, the logo is rendered in the PDF invoice header.

### Shared Validation

Zod schemas in `packages/shared` are used on both frontend (react-hook-form) and backend (Express middleware).

## Database Schema

See `apps/api/prisma/schema.prisma` for the full schema.

Key models: User, BusinessProfile, Client, Invoice, InvoiceItem, UserSettings, RefreshToken.

## Authentication

- JWT access tokens (15min expiry)
- Refresh tokens stored in DB (7 day expiry)
- Automatic token refresh via Axios interceptor
- Zustand store persisted to localStorage
