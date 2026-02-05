# RBAC Web

A Next.js web application for Role-Based Access Control (RBAC) management. Users can manage permissions, roles, and user assignments with authentication.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Data fetching:** TanStack React Query
- **Forms:** React Hook Form + Zod
- **UI:** Tailwind CSS, Radix UI, shadcn/ui
- **Icons:** Lucide React

## Project Structure

The project follows a **feature-based** structure. Each feature is self-contained; shared code lives in `shared/`.

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes (login)
│   ├── (protected)/        # Protected routes (requires auth)
│   │   └── rbac/           # RBAC section (users, roles, permissions)
│   └── providers/          # App-level providers (auth, query)
├── features/               # Feature modules
│   ├── auth/               # Authentication
│   │   └── login/          # Login flow
│   └── rbac/               # RBAC management
│       ├── permissions/     # Permissions CRUD
│       ├── roles/          # Roles CRUD + role-permission assignment
│       └── users/          # Users CRUD + user-role/user-permission assignment
├── layout/                 # App shell (sidebar, breadcrumb, page shell)
├── shared/                 # Reusable code (2+ features)
│   ├── api-client/         # API client & types
│   ├── ui/                 # UI primitives (button, card, table, search-form, etc.)
│   ├── hooks/              # Shared hooks (use-mobile, use-table-search-params)
│   ├── utils/              # Utilities (cn, error-utils)
│   ├── react-query/        # Query keys & options
│   └── constants/          # Shared constants (ROUTES)
└── types/                  # Global types
```

### Feature Structure

Each feature item (e.g. `users`, `roles`, `permissions`) follows this pattern:

| File          | Responsibility                                |
| ------------- | --------------------------------------------- |
| `*.api.ts`    | API calls only, returns Promises              |
| `*.types.ts`  | Types & interfaces                            |
| `*.logic.ts`  | Business rules, validation, mapping           |
| `use*.ts`     | Orchestration (fetch + logic + state), not UI |
| `*Table.tsx`  | Table rendering                               |
| `*Dialog.tsx` | Modal forms (Create, Update, Assign, etc.)    |
| `index.ts`    | Public exports                                |

**Import rules:** Components → hooks, api, types. Hooks → api, logic, types. Logic → types only. API → types only.

## Use Cases

### Auth

- **Login** — Authenticate with username/email and password. Redirects to `/rbac/users` on success.

### RBAC

- **Permissions** — View paginated list of permissions (resource + action). Read-only.
- **Roles** — View paginated list of roles. View permissions assigned to each role.
- **Users** — Manage users with full CRUD:
  - Create, update, archive, restore users
  - Assign roles to users
  - Grant, deny, or remove permission overrides
  - Reset password
  - Search and filter (active/archived)

## Routes

| Route               | Description                |
| ------------------- | -------------------------- |
| `/`                 | Redirects to `/login`      |
| `/login`            | Login page                 |
| `/rbac`             | Redirects to `/rbac/users` |
| `/rbac/users`       | Users management           |
| `/rbac/roles`       | Roles management           |
| `/rbac/permissions` | Permissions list           |

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (see `server/`)

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to `/login` by default.

### Build

```bash
npm run build
npm start
```

### Scripts

| Script          | Description             |
| --------------- | ----------------------- |
| `npm run dev`   | Start dev server        |
| `npm run build` | Production build        |
| `npm run start` | Start production server |
| `npm run lint`  | Run ESLint              |

## Environment

Copy `.env.example` to `.env.local` and configure:

| Variable          | Description                                        |
| ----------------- | -------------------------------------------------- |
| `API_BACKEND_URL` | Backend API URL (default: `http://localhost:3220`) |

The frontend calls `/api/v1/*` (same origin); Next.js rewrites to the backend.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack React Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [shadcn/ui](https://ui.shadcn.com/)
