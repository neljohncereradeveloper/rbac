Perfect — we can make a **Cursor Rule / ESLint-like guideline** for your **feature-based Next.js structure** with **React Query + React Hook Form** and **minimal context**.

This will enforce **who can import what** and **where certain logic lives**, so your code stays clean.

---

# 🏹 Feature-based Cursor Rules for Next.js HRIS

## 1️⃣ Folder structure rule

```
features/
└─ <feature>/
   ├─ <item>/          ← one CRUD entity (Branch, JobTitle, Department)
   │   ├─ <item>.api.ts
   │   ├─ <item>.types.ts
   │   ├─ <item>.logic.ts
   │   ├─ use<Item>.ts (optional, only UI orchestration)
   │   ├─ <Item>Table.tsx
   │   ├─ <Item>Form.tsx
   │   ├─ <Item>Context.tsx (optional)
   │   ├─ <Item>Provider.tsx (optional, only UI state)
   │   └─ index.ts
```

**Rule:**

- 1 feature = 1 domain (employee201, payroll, leave)
- 1 item folder = 1 CRUD entity (Branch, JobTitle, etc.)

---

## 2️⃣ Dependency / import rules

| From                          | Can Import                 | Cannot Import                       |
| ----------------------------- | -------------------------- | ----------------------------------- |
| Component (`BranchTable.tsx`) | hooks, api, types, context | logic, other feature components     |
| Hook (`useBranch.ts`)         | api, logic, types          | UI components                       |
| Logic (`branch.logic.ts`)     | types                      | api, UI, hooks                      |
| API (`branch.api.ts`)         | types                      | logic, components, hooks            |
| Context / Provider            | hooks, types               | api, logic, components from feature |
| Page                          | everything in the feature  | other feature internals             |

✅ **Rule:** Data and business logic flow **down**, UI consumes **up**, **never reverse**.

---

## 3️⃣ React Query / RHF rules

1. **Data fetching** → React Query (`useQuery`, `useMutation`)
2. **Forms** → React Hook Form (`useForm`)
3. **UI components** → consume React Query directly (or via minimal hooks)
4. **Provider / Context** → only **UI state** like selected item or modal visibility

**Forbidden:**

- Fetching in provider
- Logic inside form component
- Component accessing API directly without React Query

---

## 4️⃣ File responsibility rules

| File                 | Responsibility                                                   |
| -------------------- | ---------------------------------------------------------------- |
| `<item>.api.ts`      | API calls, returns Promises only                                 |
| `<item>.types.ts`    | Types & interfaces only                                          |
| `<item>.logic.ts`    | Business rules, validation, mapping                              |
| `use<Item>.ts`       | Optional orchestration (fetch + logic + local state), but not UI |
| `<Item>Table.tsx`    | Rendering only                                                   |
| `<Item>Form.tsx`     | Rendering + RHF only                                             |
| `<Item>Context.tsx`  | Context shape only                                               |
| `<Item>Provider.tsx` | Holds UI state, wraps children, no API/logic                     |

---

## 5️⃣ Suggested cursor pattern for imports

- Always use **index.ts** for public exports:

```ts
export * from "./BranchTable";
export * from "./BranchForm";
export * from "./BranchProvider";
```

- Import from **feature folder** only:

```ts
import { BranchTable, BranchForm } from "@/features/employee201/branch";
```

- Do **not import internal files directly** from another feature.

---

## 6️⃣ Optional: ESLint / TS enforcement

- **No relative imports outside folder**:

```json
"no-restricted-imports": [
  "error",
  {
    "patterns": ["../*/*"]
  }
]
```

- **Hooks start with `use`**
- **Components start with uppercase**
- **Logic / API / types lowercase**

---

### 🔑 TL;DR Cursor Rule

1. **Feature = self-contained folder**
2. **Item folder = one CRUD entity**
3. **UI → hooks → logic → types → API**
4. **Provider / Context = only UI state**
5. **React Query handles fetch/mutation**
6. **RHF handles forms**
7. **No component calls API or logic directly**
8. **Import via index.ts only**

---

If you want, I can **turn this into a visual “cursor flow diagram”** showing **how Branch, JobTitle, Department should connect**, with **React Query + RHF + context arrows**, so your team will never break these rules.

Do you want me to make that diagram?
