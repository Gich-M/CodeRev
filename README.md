# Code Review Hub
**A Collaborative Platform for Team Code Reviews**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

## Features
- Real-time collaborative code reviews
- Multi-language syntax highlighting
- Threaded markdown discussions
- Review progress tracking dashboard
- User reputation/achievement system
- Secure JWT authentication

## Tech Stack
### Frontend
- React 18 + TypeScript
- Vite Build System
- Tailwind CSS
- React Query (Data Fetching)

### Backend & Database
- Supabase (PostgreSQL)
- Row-Level Security (RLS) Policies
- PostgreSQL Functions

### Tooling
- ESLint + TypeScript type checking
- PostCSS + Autoprefixer

## Installation
```bash
# Clone repository
git clone https://github.com/Gich-M/CodeReview

# Install dependencies
npm install
```

## Configuration
### Supabase Setup
1. Create new project at Supabase Dashboard
2. Enable Email/Password authentication
3. Apply database migrations:
    ```bash
    # Install Supabase CLI if not installed
    npm install supabase --save-dev

    # Link to your Supabase project
    supabase link --project-ref <your-project-ref>

    # Run migrations
    supabase db push
    ```

    Migration files are in `supabase/migrations` directory.
4. Enable Row-Level Security (RLS)

### Environment Variables
Add to `.env`:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Development Scripts
```bash
# Start dev server (http://localhost:5173)
npm run dev

# Create production build
npm run build

# Lint codebase
npm run lint

# Preview production build locally
npm run preview
```

## Project Structure
```
src/
├── components/       # Reusable UI (AuthInput, Header, etc.)
├── hooks/           # Custom hooks (auth, data fetching)
├── lib/             # Supabase client & utilities
├── pages/           # Route components (13 pages)
├── types/           # TypeScript definitions
├── constants/       # Config/static data
├── App.tsx          # Root component
└── main.tsx         # Entry point
```

## Contributing
1. Fork the repository
2. Create feature branch:
    ```bash
    git checkout -b feat/your-feature
    ```
3. Commit changes using provided script
4. Push to your fork
5. Open a Pull Request

## License
MIT License © 2024 Gich-M.
