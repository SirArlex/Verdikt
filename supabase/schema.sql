-- ConsensusAI — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  token_address text not null,
  trust_score integer not null check (trust_score between 0 and 100),
  momentum_score integer not null check (momentum_score between 0 and 100),
  volatility_score integer not null check (volatility_score between 0 and 100),
  liquidity_score integer not null check (liquidity_score between 0 and 100),
  consensus_score integer not null check (consensus_score between 0 and 100),
  decision text not null check (decision in ('STRONG BUY', 'BUY', 'HOLD', 'AVOID')),
  summary text not null,
  created_at timestamptz not null default now()
);

create index if not exists analyses_created_at_idx
  on public.analyses (created_at desc);

-- Row Level Security.
-- This is a public demo with no auth, so we allow anonymous read + insert.
-- Tighten these policies before any real deployment.
alter table public.analyses enable row level security;

drop policy if exists "Allow anonymous read" on public.analyses;
create policy "Allow anonymous read"
  on public.analyses for select
  to anon
  using (true);

drop policy if exists "Allow anonymous insert" on public.analyses;
create policy "Allow anonymous insert"
  on public.analyses for insert
  to anon
  with check (true);
