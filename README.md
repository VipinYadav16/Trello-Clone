# Trello Clone

Trello-style Kanban application with drag-and-drop lists/cards, detailed card workflows, filters, and PostgreSQL-backed persistence.

# Demo Images

<img width="1917" height="869" alt="Screenshot 2026-03-13 194223" src="https://github.com/user-attachments/assets/a9a442cd-e635-441b-be79-59fa8884c509" />

<img width="1919" height="869" alt="Screenshot 2026-03-13 194303" src="https://github.com/user-attachments/assets/73952577-7385-4723-bdf7-7df9ed5b7bcc" />

## Stack

- Frontend: React, TypeScript, Vite, Tailwind, Zustand, @hello-pangea/dnd
- Backend: Node.js, Express
- Database: PostgreSQL
- Deployment: Vercel (SPA + serverless API entry)

## Key Features

### Core

- Board create/view
- List create/edit/delete/reorder
- Card create/edit/delete/archive
- Drag cards within list and across lists
- Card details: labels, due date, checklists, members
- Search and filters (label/member/due date)

### Extended

- Responsive layout (desktop/tablet/mobile)
- Multiple boards
- Card comments and activity
- Card covers (solid, gradient, image URL)
- Attachments (link + binary upload)
- Board background customization

## Quick Start

### 1) Install

```bash
npm install
```

### 2) Configure env

Create `.env`:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/trello_clone
DATABASE_SSL=false
PORT=4000
```

### 3) Initialize database

```bash
npm run db:reset
```

### 4) Run app (frontend + backend)

```bash
npm run dev:full
```

Frontend runs on Vite dev server and proxies `/api` to backend (`PORT`, default `4000`).

## Useful Scripts

- `npm run dev` - Frontend only
- `npm run dev:server` - Backend only
- `npm run dev:full` - Frontend + backend
- `npm run db:schema` - Apply schema
- `npm run db:seed` - Seed data
- `npm run db:reset` - Recreate schema + seed
- `npm run build` - Production build
- `npm test` - Run tests

## Project Layout

- `src/` - Frontend code
- `server/` - Express API
- `api/index.js` - Vercel API entry
- `db/schema.sql` - PostgreSQL schema
- `db/seed.sql` - Sample data

## API Summary

### Boards and Lists

- `GET /api/boards`
- `POST /api/boards`
- `GET /api/boards/:boardId`
- `PATCH /api/boards/:boardId`
- `DELETE /api/boards/:boardId`
- `POST /api/boards/:boardId/lists`
- `PATCH /api/lists/:listId`
- `DELETE /api/lists/:listId`
- `POST /api/boards/:boardId/lists/reorder`

### Cards

- `POST /api/lists/:listId/cards`
- `PATCH /api/cards/:cardId`
- `DELETE /api/cards/:cardId`
- `POST /api/lists/:listId/cards/reorder`
- `POST /api/cards/:cardId/move`

### Card Details

- `POST /api/cards/:cardId/labels`
- `DELETE /api/cards/:cardId/labels/:labelId`
- `PUT /api/cards/:cardId/members`
- `POST /api/cards/:cardId/checklists`
- `DELETE /api/checklists/:checklistId`
- `POST /api/checklists/:checklistId/items`
- `PATCH /api/checklist-items/:itemId`
- `DELETE /api/checklist-items/:itemId`
- `POST /api/cards/:cardId/comments`

### Attachments

- `POST /api/cards/:cardId/attachments` (link attachment)
- `POST /api/cards/:cardId/attachments/upload` (binary upload)
- `GET /api/attachments/:attachmentId/file`
- `DELETE /api/attachments/:attachmentId`

### Members and Health

- `GET /api/members`
- `POST /api/members`
- `DELETE /api/members/:memberId`
- `GET /api/health`

## Database Model (High Level)

- `boards` 1:N `lists`
- `lists` 1:N `cards`
- `cards` M:N `labels` via `card_labels`
- `cards` M:N `members` via `card_members`
- `cards` 1:N `checklists` -> `checklist_items`
- `cards` 1:N `comments`
- `cards` 1:N `card_attachments`
- `card_attachments` 1:1 `card_attachment_files`

Ordering is preserved with `position` fields for Trello-like drag behavior.

## Vercel Deployment

1. Import repository in Vercel.
2. Set `DATABASE_URL` and `DATABASE_SSL`.
3. Ensure PostgreSQL is reachable from Vercel.
4. Apply `db/schema.sql` and `db/seed.sql` to production DB.

## Assumptions

- No authentication (single default workspace context).
- Seeded sample board/lists/cards/members are provided.
- Uploaded attachments are stored in PostgreSQL.

## Originality

The UI is Trello-inspired, but implementation and code structure are original to this repository.
