# Trello Clone - Full Stack Kanban

A Kanban-style project management app inspired by Trello UI/UX patterns, with drag-and-drop board workflows, detailed cards, filters, and PostgreSQL-backed API.

## Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind + Zustand + @hello-pangea/dnd
- Backend: Node.js + Express
- Database: PostgreSQL
- Deployment target: Vercel (SPA + serverless API endpoint)

## Features

### Core (Must Have)

- Board management
- Create board
- View board with all lists and cards

- List management
- Create list
- Edit list title
- Delete list
- Drag-and-drop reorder lists

- Card management
- Create card
- Edit card title + description
- Delete card
- Archive card
- Drag-and-drop cards between lists
- Drag-and-drop reorder cards inside list

- Card details
- Add/remove labels
- Set/remove due date
- Add checklist and checklist items
- Mark checklist items complete/incomplete
- Assign members to cards

- Search and filter
- Search by card title
- Filter by labels
- Filter by members
- Filter by due date (overdue/today/week)

### Good To Have (Implemented)

- Responsive desktop/tablet/mobile layout
- Multiple boards
- Comments and activity on cards
- Card covers (color + image URL)
- Card attachments (link attachments with add/remove + open)
- Board background customization (solid + gradients)

## Project Structure

- Frontend app: `src/`
- API server: `server/`
- Vercel API entry: `api/index.js`
- Database schema: `db/schema.sql`
- Seed data: `db/seed.sql`

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and update values:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/trello_clone
DATABASE_SSL=false
PORT=4000
```

### 3. Create schema + seed sample data

```bash
npm run db:reset
```

### 4. Run frontend + backend

```bash
npm run dev:full
```

Frontend runs on `http://localhost:8080` and proxies `/api` to `http://localhost:4000`.

## Backend API Overview

### Health

- `GET /api/health`

### Members

- `GET /api/members`
- `POST /api/members`

### Boards

- `GET /api/boards`
- `POST /api/boards`
- `GET /api/boards/:boardId`
- `PATCH /api/boards/:boardId`
- `DELETE /api/boards/:boardId`

### Lists

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

### Labels, Members, Checklists, Comments

- `POST /api/cards/:cardId/labels`
- `DELETE /api/cards/:cardId/labels/:labelId`
- `PUT /api/cards/:cardId/members`
- `POST /api/cards/:cardId/checklists`
- `DELETE /api/checklists/:checklistId`
- `POST /api/checklists/:checklistId/items`
- `PATCH /api/checklist-items/:itemId`
- `DELETE /api/checklist-items/:itemId`
- `POST /api/cards/:cardId/comments`
- `POST /api/cards/:cardId/attachments`
- `DELETE /api/attachments/:attachmentId`

## Database Design

Main entities and relationships:

- `boards` 1:N `lists`
- `lists` 1:N `cards`
- `cards` M:N `labels` via `card_labels`
- `cards` M:N `members` via `card_members`
- `cards` 1:N `checklists`
- `checklists` 1:N `checklist_items`
- `cards` 1:N `comments`
- `cards` 1:N `card_attachments`

Schema includes ordering columns (`position`) for Trello-like drag/reorder behavior.

## Frontend Data Behavior

- Frontend uses Zustand local persistence for fast UX/offline-like behavior.
- On app load, it attempts API hydration from `/api` (boards + members).
- If API is unavailable, it falls back to seeded local in-browser data.

## Vercel Deployment

This repository is deployable on Vercel:

- Frontend served as SPA
- API exposed through `api/index.js` (Express handler)
- Route rewrites configured in `vercel.json`

Deployment steps:

1. Import repo in Vercel.
2. Set environment variables (`DATABASE_URL`, `DATABASE_SSL`).
3. Ensure PostgreSQL instance is reachable from Vercel.
4. Run schema/seed against your deployed database.

## Assumptions

- No authentication required; a default user context is assumed.
- Initial sample members, board, lists, and cards are provided via `db/seed.sql`.
- Attachments are stored as link metadata (name + URL); binary file upload storage is intentionally deferred.

## Notes on Originality

UI is Trello-inspired in layout and interaction patterns but implemented with original component structure and code in this repository.
