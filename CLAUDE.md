# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository

React 17 front end (create-react-app / `react-scripts`) for SMT, a manufacturing production control & management system (component tracking, production lines, defects, machine repairs, ready/returned product transactions, QA, board flow / QR tracking, hourly plans, etc). It consumes a separate ASP.NET Core Web API backend that lives in a sibling `SMT/` repository (not part of this git repo) — changes to API routes or DTO shapes require corresponding changes here in `src/services/*.js`.

## Commands

```
npm install
npm start          # dev server (react-scripts), http://localhost:3000
npm run build       # production build
npm test            # react-scripts test (Jest + React Testing Library), watch mode
```

Run a single test file: `npm test -- src/App.test.js` (add `CI=true` to run once non-interactively instead of watch mode).

There is no lint script defined; ESLint runs via `react-scripts`' built-in config (`eslintConfig.extends: ["react-app", "react-app/jest"]` in `package.json`) during `start`/`build`.

## Architecture

Class-component-based React app (React 17, react-router-dom v6, MUI + Bootstrap for UI, Chart.js for charts, react-i18next for translations).

- `src/App.js` — top-level route table; every feature page is registered here as a `<Route>`. Auth state is read once in `componentDidMount` via `jwt-decode` on the `token` stored in `localStorage` (no context/redux — auth is just a decoded JWT passed down as a prop where needed).
- `src/services/*.js` — one file per backend entity (`lineService.js`, `machineService.js`, etc.), each a thin wrapper around `httpService` building URLs from `config.json`'s `apiUrl` + a REST path (`get/get-by-id/add/update/delete`), mirroring the backend's per-entity controller structure. `src/services/board-flow/` holds the board-flow/QR-tracking feature's services (v1 and v2 variants coexist — e.g. `qrReaderService.js` vs `qrReaderV2Service.js`, `boardV2Service.js` — v2 components live under `src/components/board-flow/v2/`).
- `src/services/httpService.js` — the shared axios wrapper; a global response interceptor toasts (`react-toastify`, message via i18n key `common:errors.unexpected`) on unexpected (non-4xx-class) errors and rejects the promise either way — callers still need their own `.catch`/try-catch for expected (4xx) errors.
- `src/config.json` — hardcoded API base URLs. Each deployment target has a numbered pair: `apiUrl`/`fileUrl` (primary), `apiUrl2`/`fileUrl2`, `apiUrl3`/`fileUrl3` (alternate LAN targets). Services import `apiUrl`/`fileUrl` directly — **to point the app at a different backend, edit this file and repoint which numbered pair is used**; there's no `.env`-based environment switching.
- `src/i18n/` — react-i18next setup. `i18n.js` statically imports every namespace JSON for all three supported languages (`en`, `ru`, `uz`) and registers them; `languageStorage.js` persists the chosen language. Initial language resolution order: stored preference → browser language → `en` fallback. Translation files are split by feature-area namespace under `src/i18n/locales/<lang>/<namespace>.json` (`common`, `navbar`, `forms`, `tables`, `reports`, `statics`, `store`, `boardFlow`, `readyProduct`, `returnProduct`, `machines`). When adding a new namespace, it must be registered in all three language blocks in `i18n.js` plus the `ns` array, or lookups silently fall back to the key string.
- `src/components/forms/` — one form component per entity (add/edit), `src/components/tables/` — matching list/table components, `src/components/reports/`, `src/components/statics/`, `src/components/ready-product/`, `src/components/return-product/`, `src/components/board-flow/` (with a `v2/` subfolder for the newer board-flow UI), `src/components/store/` — feature-area groupings that mirror the backend's domain areas. `src/components/common/` holds generic reusable UI (table, pagination, select, badges, etc.) modeled after the standard "Mosh Hamedani" React course table/pagination pattern.
- `src/utils/paginate.js` — client-side pagination helper used by the common table components.
