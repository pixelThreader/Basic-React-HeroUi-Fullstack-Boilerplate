# DB Manager - Frontend

React frontend for the DB Manager full-stack starter template.

## Tech Stack

- React 18
- HeroUI 2.8
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Framer Motion

## Features

- Dynamic table and data management UI
- Type-aware input components (DatePicker, Switch, etc.)
- Global search with auto-suggestions
- Responsive design
- Keyboard shortcuts (Ctrl+K for search)

## Development

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`.

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── config/         # Site configuration
├── layouts/        # Page layouts
├── pages/          # Route pages
├── services/       # API service layer
└── types/          # TypeScript types
```

## API Configuration

The backend API URL is configured in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3001/api';
```

Update this if your backend runs on a different port.
