# DB Manager - Monorepo

A full-stack database management application with a modern React frontend and Express backend.

## 🚀 Quick Start

From the project root:

```bash
# Install dependencies for all packages
npm run install:all

# Start both backend and frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📁 Project Structure

```
1/
├── backend/          # Express + SQLite backend
├── frontend/         # React + HeroUI frontend
└── package.json      # Monorepo root configuration
```

## 🛠️ Available Scripts

- `npm run dev` - Start both backend and frontend concurrently
- `npm run backend` - Start only the backend server
- `npm run frontend` - Start only the frontend server
- `npm run install:all` - Install dependencies for all packages

## ✨ Features

- **Dynamic Table Management**: Create, edit, and delete database tables on the fly
- **Smart Data Entry**: Type-aware input fields (DatePicker for dates, Switch for booleans)
- **Global Search**: Full-text search across all your data with auto-suggestions
- **Configurable Search**: Choose which columns to index for search
- **Premium UI**: Built with HeroUI components for a modern, responsive experience

## 📦 Tech Stack

### Backend
- Express.js
- SQLite3
- TypeScript
- MiniSearch (for full-text search)

### Frontend
- React 18
- HeroUI 2.8
- TypeScript
- Vite
- React Router

## 🔧 Development

Each package (backend/frontend) can be developed independently:

```bash
# Backend only
cd backend
npm run dev

# Frontend only
cd frontend
npm run dev
```