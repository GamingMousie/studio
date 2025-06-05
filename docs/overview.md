# Codebase Overview

This document summarizes the overall structure and key concepts of the **ShipShape** application.

## Project Structure

```
src/
 ├ ai/                 – Genkit AI configuration
 ├ app/                – Next.js routes and pages
 ├ components/         – Reusable UI components (buttons, dialogs, cards, etc.)
 ├ contexts/           – React context for managing data
 ├ hooks/              – Custom React hooks
 ├ lib/                – Utility functions
 └ types/              – TypeScript interfaces and types
```

Important configuration files:

- `next.config.ts` – Next.js settings
- `tailwind.config.ts` – Tailwind CSS configuration
- `package.json` – Node.js dependencies and scripts

## Key Concepts

1. **WarehouseContext** – Stores trailers, shipments, and quiz reports in browser `localStorage` via the `useLocalStorageState` hook. It exposes operations for creating, updating, and deleting records.
2. **Pages** – Implemented under `src/app/`. Notable routes include the trailer dashboard (`/`), shipments list (`/shipments`), trailer detail pages (`/trailers/[trailerId]`), label generation (`/labels/generate-shipment-labels`), stock-check quiz (`/quiz/stock-check`), and report pages (`/reports`).
3. **Components** – Located in `src/components/`, built with Radix UI primitives and Tailwind styling.
4. **State Management** – Data persistence relies on `useLocalStorageState`, allowing the demo to function entirely client-side.
5. **Utilities** – Minimal Genkit AI setup lives in `src/ai/` and a simple `cn` class name helper resides in `src/lib/utils.ts`.
6. **Layout** – `src/app/layout.tsx` wraps every page with the `WarehouseProvider` and shared header.

## Development Notes

- Install dependencies with `npm install`.
- Start the dev server with `npm run dev`.
- Data is stored in the browser; clear storage to reset.

Further design ideas are available in [`docs/blueprint.md`](blueprint.md).
