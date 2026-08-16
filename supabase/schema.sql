-- CommunityFix database schema
-- Run this whole file in the Supabase SQL editor (Project → SQL Editor → New query).

-- Enable PostGIS
create extension if not exists postgis;

-- Reports table
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('pothole', 'streetlight', 'waste', 'drainage', 'other')),
  description text,
  photo_url text,
  status text not null default 'reported' check (status in ('reported', 'in_progress', 'resolved')),
  location geography(Point, 4326) not null,
  -- Generated plain-number columns so the frontend never has to parse WKB/GeoJSON.
  lat double precision generated always as (st_y(location::geometry)) stored,
  lng double precision generated always as (st_x(location::geometry)) stored,
  reporter_contact text, -- optional, nullable
  upvotes int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Spatial index for fast map queries
create index if not exists reports_location_idx on reports using gist (location);

-- Keep updated_at current on every row change
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reports_set_updated_at on reports;
create trigger reports_set_updated_at
  before update on reports
  for each row execute function set_updated_at();

-- Atomic, RLS-bypassing upvote increment so anonymous visitors can upvote
-- without being granted general update access to the row.
create or replace function increment_upvotes(report_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update reports set upvotes = upvotes + 1 where id = report_id;
end;
$$;

-- Row Level Security
alter table reports enable row level security;

drop policy if exists "Public read access" on reports;
create policy "Public read access"
  on reports for select
  using (true);

drop policy if exists "Public insert access" on reports;
create policy "Public insert access"
  on reports for insert
  with check (true);

-- Only authenticated admins can update status (upvotes go through the RPC above instead)
drop policy if exists "Admin update access" on reports;
create policy "Admin update access"
  on reports for update
  using (auth.role() = 'authenticated');

-- Storage bucket for report photos (public read, public upload since there's no login)
insert into storage.buckets (id, name, public)
values ('report-photos', 'report-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public read photos" on storage.objects;
create policy "Public read photos"
  on storage.objects for select
  using (bucket_id = 'report-photos');

drop policy if exists "Public upload photos" on storage.objects;
create policy "Public upload photos"
  on storage.objects for insert
  with check (bucket_id = 'report-photos');
