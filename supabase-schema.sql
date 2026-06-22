-- ════════════════════════════════════════════════════════
-- مخطط قاعدة البيانات — مركز فريق المعرض الطبي
-- نفّذه مرة واحدة في Supabase → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════

-- تأكيدات الحضور
create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  name text not null,
  role text,
  status text not null check (status in ('going','maybe','no')),
  updated_at timestamptz default now(),
  unique (event_id, name)
);

-- المهام والديدلاينات
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  owner_role text not null,
  title text not null,
  deadline date,
  status text not null default 'todo' check (status in ('todo','doing','done')),
  created_at timestamptz default now()
);

-- الإعلانات
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  author text,
  created_at timestamptz default now()
);

-- تفعيل التحديث اللحظي (Realtime)
alter publication supabase_realtime add table rsvps, tasks, announcements;

-- ───────────────────────────────────────────────
-- Row Level Security
-- ⚠️ سياسة v1 مفتوحة: أي شخص يملك رابط التطبيق يقرأ ويكتب.
--    مقبولة لفريق موثوق. لاحقاً: اربطها بمصادقة Supabase وضيّقها.
-- ───────────────────────────────────────────────
alter table rsvps enable row level security;
alter table tasks enable row level security;
alter table announcements enable row level security;

create policy "v1 open rsvps" on rsvps for all using (true) with check (true);
create policy "v1 open tasks" on tasks for all using (true) with check (true);
create policy "v1 open anns"  on announcements for all using (true) with check (true);
