# Workspace

## Overview

Deepfake Detector PRO — a multimodal AI web app for detecting synthetic / manipulated images. Users can upload an image or capture from a webcam, then receive a verdict (REAL / FAKE / UNCERTAIN), confidence score, region heatmap overlaid on the image, a natural-language explanation, contributing forensic signals, and performance telemetry.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind v4 + wouter + TanStack Query + framer-motion
- **API framework**: Express 5
- **Validation**: Zod (`zod/v4`)
- **API codegen**: Orval (from OpenAPI spec)
- **Vision AI**: Anthropic Claude (via Replit AI Integrations — multimodal vision)

## Artifacts

- `artifacts/deepfake-detector` — React + Vite frontend at `/`
- `artifacts/api-server` — Express API at `/api`
- `artifacts/mockup-sandbox` — design canvas at `/__mockup`

## API surface (`/api`)

- `GET /healthz` — health check
- `POST /detect` — run deepfake analysis on a base64 image; returns label, confidence, regions, signals, explanation, and performance metrics.
- `GET /detect/history` — recent detections (in-memory, last 12 of 50)
- `GET /detect/stats` — aggregate dashboard stats (totals, averages, GPU vs CPU speedup)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas

## Notes

- Detection state is in-memory (no database). Restart clears history.
- The `device` and `modelName` strings reported to the UI are configured in `artifacts/api-server/src/lib/store.ts`.
- The system prompt that constrains the Claude vision response to the JSON schema lives in `artifacts/api-server/src/routes/detect.ts`.
