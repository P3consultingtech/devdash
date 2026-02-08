# API Reference

Base URL: `/api/v1`

All responses follow the format:
```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { "field": ["error"] }
  }
}
```

## Authentication

All endpoints except auth require `Authorization: Bearer <token>` header.

### POST /auth/register
Create a new account.
```json
{
  "email": "user@example.com",
  "password": "min8chars",
  "firstName": "Mario",
  "lastName": "Rossi",
  "locale": "it"
}
```

### POST /auth/login
```json
{ "email": "user@example.com", "password": "min8chars" }
```
Returns: `{ user, tokens: { accessToken, refreshToken } }`

### POST /auth/refresh
```json
{ "refreshToken": "..." }
```

### POST /auth/logout
Revokes all refresh tokens for the user.

### GET /auth/me
Returns current user profile.

## Clients

### GET /clients
Query params: `page`, `limit`, `search`, `type`, `sortBy`, `sortOrder`

### GET /clients/:id
### POST /clients
### PUT /clients/:id
### DELETE /clients/:id
Soft delete.

## Invoices

### GET /invoices
Query params: `page`, `limit`, `status`, `clientId`, `search`, `fromDate`, `toDate`, `sortBy`, `sortOrder`

### GET /invoices/:id
### POST /invoices
### PUT /invoices/:id
Only DRAFT invoices can be edited.

### DELETE /invoices/:id
Only DRAFT invoices can be deleted.

### PATCH /invoices/:id/status
```json
{ "status": "SENT" }
```
Valid transitions: DRAFT->SENT/CANCELLED, SENT->PAID/OVERDUE/CANCELLED, OVERDUE->PAID/CANCELLED, CANCELLED->DRAFT

### POST /invoices/:id/duplicate
Creates a new DRAFT invoice as a copy.

### GET /invoices/:id/pdf
Returns PDF binary.

### GET /invoices/next-number
Returns the next available invoice number.

## Dashboard

### GET /dashboard/summary?year=2026
### GET /dashboard/revenue?year=2026
### GET /dashboard/invoices-by-status?year=2026
### GET /dashboard/top-clients?year=2026
### GET /dashboard/recent-activity

## Settings

### GET /settings/profile
### PUT /settings/profile
### GET /settings/business
### PUT /settings/business
### GET /settings/preferences
### PUT /settings/preferences
