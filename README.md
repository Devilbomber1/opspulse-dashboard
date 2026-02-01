# OpsPulse Monitoring Dashboard

A lightweight monitoring dashboard demo for tracking service health and latency. Built with Node.js, Express, and SQLite.

## Features
- Health/latency metrics table
- Simple REST API for metrics
- Seed data for quick demos

## Quickstart
```bash
npm install
npm start
```
Open: http://localhost:3001

## API
- `GET /api/metrics` → list latest metrics
- `POST /api/metrics` → add metric `{ service, status, latency_ms }`
- `GET /health`

## Data Model
`metrics`: service, status, latency_ms, created_at

## Screenshots
_Add screenshots here._

## Notes
- SQLite DB stored at `data/opspulse.db`.
- Minimal styling intended for demo usage.
