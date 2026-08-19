# 🚆 Tokyo Transit Live Board

A real-time status and incident monitoring dashboard for Tokyo metropolitan railway lines (JR East, Tokyo Metro, and Tokaido Shinkansen). Built with a modern full-stack architecture using FastAPI, Next.js, PostgreSQL, and Redis.

## ✨ Features
- **Live Status Monitoring:** Track train operation statuses and delay alerts in real-time.
- **Incident Reporting:** Community-driven system to report and resolve transit delays.
- **Interactive API Documentation:** Full OpenAPI/Swagger support for backend integration.

## 🛠️ Tech Stack
- **Backend:** Python, FastAPI, SQLAlchemy (Async), PostgreSQL, Redis
- **Frontend:** Next.js, React, Tailwind CSS
- **Containerization:** Docker, Docker Compose

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL & Redis (or Docker)

### Setup & Run
1. Clone the repository:
   ```bash
   git clone https://github.com/rafaelfelix853-commits/tokyo-transit-live-board.git
   cd tokyo-transit-live-board

2. Run backend & seed initial data:
```bash
cd backend
python -m app.seed
