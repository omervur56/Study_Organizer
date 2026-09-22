-- In der Supabase SQL-Konsole ausführen, um die Todo-Tabelle anzulegen.
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'todo' check (status in ('todo', 'inProgress', 'done')),
  created_at timestamptz not null default now()
);

alter table public.todos enable row level security;

-- Einfache Policy: jeder mit dem anon/authenticated Key darf lesen und schreiben.
create policy "Allow all access to todos" on public.todos
  for all using (true) with check (true);
