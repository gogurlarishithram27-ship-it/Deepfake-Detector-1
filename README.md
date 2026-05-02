# Deepfake Detector PRO

A multimodal AI-powered web application for detecting synthetic and manipulated images. Built for the AMD Developer Hackathon.

## Features

- **Image Upload or Webcam Capture** — analyze any JPG or PNG image
- **Verdict** — REAL / FAKE / UNCERTAIN with a calibrated confidence score
- **Region Heatmap Overlay** — suspicion boxes drawn directly on the image, labeled by area (e.g. eye region, mouth blending)
- **Multimodal Explanation** — natural-language forensic write-up of the model's reasoning
- **Forensic Signals** — bullet-style cues that contributed to the verdict
- **Performance Telemetry** — inference time, GPU vs CPU speedup, device label
- **Recent Activity Feed** — history of past scans with aggregate stats
- **Download Report** — export full detection results

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS v4 |
| Routing | Wouter |
| Data Fetching | TanStack Query |
| Animations | Framer Motion |
| Backend | Express 5 (Node.js) |
| AI Vision | Anthropic Claude (multimodal) via Replit AI Integrations |
| API Contract | OpenAPI + Orval codegen |
| Validation | Zod |
| Monorepo | pnpm workspaces |

## Architecture

```
artifacts/
  deepfake-detector/   # React + Vite frontend  →  served at /
  api-server/          # Express API             →  served at /api
lib/
  api-spec/            # OpenAPI spec + codegen
  integrations-anthropic-ai/  # Anthropic client
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/detect` | Analyze an image for deepfake indicators |
| GET | `/api/detect/history` | Recent detection results (last 12) |
| GET | `/api/detect/stats` | Aggregate stats and performance metrics |
| GET | `/api/healthz` | Health check |

## Getting Started

This project runs on [Replit](https://replit.com). No local setup is required.

1. Fork or clone this Repl
2. The Replit AI Integration for Anthropic is pre-configured — no API key needed
3. Click **Run** — both the frontend and API server start automatically
4. Open the preview and upload an image to start detecting

## Local Development

```bash
# Install dependencies
pnpm install

# Type check all packages
pnpm run typecheck

# Regenerate API hooks from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

## Notes

- Detection history is stored in-memory. It resets when the server restarts.
- The `device` and `modelName` strings shown in the UI (AMD Instinct MI300X, etc.) are configured in `artifacts/api-server/src/lib/store.ts` and can be swapped for a real ROCm worker on AMD Developer Cloud.
- The AI backend uses Claude's vision capabilities to analyze images and return structured forensic output.

## License

MIT
