create table if not exists public.work_google_tokens (
  user_id text primary key references public.work_users (user_id) on delete cascade,
  access_ciphertext text not null,
  access_iv text not null,
  access_tag text not null,
  refresh_ciphertext text,
  refresh_iv text,
  refresh_tag text,
  expires_at timestamptz,
  key_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);




