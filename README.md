# CareSynq

**Live:** [https://caresynq-cvmk.onrender.com/](https://caresynq-cvmk.onrender.com/)

CareSynq is a **patient chart documentation review** UI: you upload an image of a visit chart and get a structured checklist-style report framed around **CMS-oriented completeness** (demographics, medical necessity, coding, payer-ready provider details, and related sections).

## How it works

1. **Upload** — Drag and drop or choose an image (PNG, JPG, HEIC). The app shows a preview of your file.
2. **Analysis** — The client calls `analyzeUploadedChart()` in `src/lib/chart-analysis.ts`. In the current build this is a **demo**: it simulates a short delay and returns **fixed sample findings** so you can see the full UI. The file bytes are not sent to a server; swap in OCR or a model when you want real extraction.
3. **Results** — Findings appear grouped by section (e.g. demographics, vitals) with severity labels (missing, incomplete, review). You can step through validation and review states in the workspace.

The hero area includes a **Spline** 3D scene for visual polish; it loads from the URL in `src/lib/spline-config.ts`.

**Stack:** [Next.js](https://nextjs.org) (App Router), React, TypeScript, Tailwind CSS.

## Run locally

From the project root:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The page hot-reloads when you edit files.

Other package managers:

```bash
yarn install && yarn dev
# or
pnpm install && pnpm dev
```

## Scripts

| Command        | Description                    |
| -------------- | ------------------------------ |
| `npm run dev`  | Development server (port 3000) |
| `npm run build`| Production build               |
| `npm run start`| Run production server          |
| `npm run lint` | ESLint                         |
