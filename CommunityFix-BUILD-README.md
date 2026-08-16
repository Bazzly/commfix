# CommunityFix — Agentic Build Guide

**Purpose of this document:** Give an autonomous coding agent (e.g. Claude Code) everything needed to build CommunityFix end-to-end with no human intervention beyond providing API keys. Follow the steps in order. Do not skip verification steps.

**Project summary:** A public, no-login-required web map where anyone can report local infrastructure issues (potholes, broken streetlights, illegal waste dumps, broken drainage) by dropping a pin, adding a photo and description. Anyone can browse the map, filter by category/status, and see report counts. An admin can update status (Reported → In Progress → Resolved).

**Stack:** Next.js (App Router) + Supabase (Postgres/PostGIS, Storage, Auth) + Leaflet.js, deployed free on Vercel.

---

## 0. Prerequisites (human-provided, agent should ask if missing)
- A Supabase account + new project (free tier) → need `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- A Vercel account connected to GitHub
- A GitHub repo (empty, agent will push to it)
- Node.js 20+ installed locally / in sandbox

---

## 1. Initialize the project

```bash
npx create-next-app@latest communityfix --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd communityfix
```

Install dependencies:
```bash
npm install @supabase/supabase-js leaflet react-leaflet
npm install -D @types/leaflet
```

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Verification:** `npm run dev` should serve the default Next.js page at localhost:3000.

---

## 2. Supabase database schema

Run this in the Supabase SQL editor:

```sql
-- Enable PostGIS
create extension if not exists postgis;

-- Reports table
create table reports (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('pothole', 'streetlight', 'waste', 'drainage', 'other')),
  description text,
  photo_url text,
  status text not null default 'reported' check (status in ('reported', 'in_progress', 'resolved')),
  location geography(Point, 4326) not null,
  reporter_contact text, -- optional, nullable
  upvotes int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Spatial index for fast map queries
create index reports_location_idx on reports using gist (location);

-- Row Level Security
alter table reports enable row level security;

-- Anyone can read reports
create policy "Public read access"
  on reports for select
  using (true);

-- Anyone can insert a report (no login required)
create policy "Public insert access"
  on reports for insert
  with check (true);

-- Only authenticated admins can update status (handled via admin policy below)
create policy "Admin update access"
  on reports for update
  using (auth.role() = 'authenticated');
```

Create a Storage bucket named `report-photos`, set to **public** read access, authenticated or anonymous write (match the insert policy above).

**Verification:** Insert a test row manually in the Supabase table editor and confirm it appears via `select * from reports;`.

---

## 3. Supabase client setup

`src/lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 4. Build the map component

`src/components/Map.tsx` — a client component (`'use client'`) that:
- Renders a Leaflet map centered on a configurable default (e.g. Abeokuta: `[7.1475, 3.3619]`)
- Fetches all rows from `reports` on mount via Supabase client
- Renders each report as a colored marker by category (define a category→color map)
- On marker click, shows a popup with photo, description, category, status, and "report submitted" date
- Accepts an `onMapClick` prop used by the report form to capture a new pin's coordinates

Import Leaflet CSS in the root layout: `import 'leaflet/dist/leaflet.css'`. Note Leaflet requires `window`, so dynamically import the Map component with `next/dynamic` and `ssr: false` wherever it's used.

**Verification:** Map renders with test row's marker visible and popup working.

---

## 5. Build the report submission form

`src/components/ReportForm.tsx`:
- Step 1: user clicks map to drop a pin (capture lat/lng)
- Step 2: form fields — category (select), description (textarea), photo (file input, optional), contact (optional text input)
- On submit:
  1. If photo provided, upload to Supabase Storage bucket `report-photos`, get public URL
  2. Insert row into `reports` with `location` as `POINT(lng lat)` — use Supabase's PostGIS-compatible insert: `location: \`SRID=4326;POINT(${lng} ${lat})\`` or use the `st_makepoint` RPC if direct WKT insert fails
  3. On success, show confirmation and refresh map data
- Client-side validation: category required, pin required, photo size limit (e.g. 5MB)

**Verification:** Submit a report end-to-end through the UI and confirm it appears on the map without a page reload.

---

## 6. Build filters

`src/components/Filters.tsx`:
- Checkbox/dropdown filters for category and status
- Filtered state lifted to the page level, passed down to Map to control which markers render

---

## 7. Build the report count / share feature

- Each report detail popup includes an upvote button ("232 people confirmed this is still an issue") that increments the `upvotes` column via a Supabase RPC or direct update
- Each report has a shareable URL: `/report/[id]` — a simple page showing that single report's details and location, for sharing on WhatsApp/social

---

## 8. Build the admin panel

`src/app/admin/page.tsx`:
- Protect with Supabase Auth (simple email/password login for admin/moderators)
- List all reports in a table, sortable by date/status
- Allow status update (Reported → In Progress → Resolved) via a dropdown per row, writes to `reports.status`
- Do NOT expose this route publicly in navigation — direct link only

**Verification:** Log in as admin, change a report's status, confirm the public map reflects the new status/color immediately.

---

## 9. Landing/homepage

`src/app/page.tsx`:
- Hero section: what CommunityFix is, one-line value prop, "Report an Issue" CTA
- Embedded map (default view, all reports)
- Footer: attribution ("Built by GeoTechieX"), link to admin login (small, unobtrusive)

---

## 10. Deploy

```bash
git init
git add .
git commit -m "Initial CommunityFix build"
git remote add origin <repo-url>
git push -u origin main
```

Connect the repo in Vercel dashboard (or `vercel` CLI), set environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in Vercel project settings, deploy.

**Verification checklist before calling this done:**
- [ ] Public map loads with no login required
- [ ] Report submission works end-to-end including photo upload
- [ ] Filters work correctly
- [ ] Admin login works and status updates reflect on public map
- [ ] Site is live on a Vercel URL and mobile-responsive
- [ ] No API keys or secrets committed to the repo (`.env.local` in `.gitignore`)

---

## 11. Nice-to-have extensions (only after MVP is fully verified)
- Rate limiting on report submission (prevent spam) via Supabase Edge Function or simple IP-based throttling
- Email/WhatsApp notification to admin on new report
- Heatmap view toggle for report density
- PWA support for offline pin-dropping in low-connectivity areas
