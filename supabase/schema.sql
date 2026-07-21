-- =========================================================
-- SCHEMA: Peminjaman Aset Komunikasi (HT) - QR Code + FSM
-- Jalankan di Supabase SQL Editor
-- =========================================================

-- ---------- ENUM TYPES ----------
create type asset_status as enum ('tersedia', 'dipinjam', 'rusak');
create type borrow_status as enum ('menunggu_persetujuan', 'disetujui', 'ditolak', 'dikembalikan');
create type return_condition as enum ('baik', 'rusak');

-- ---------- PROFILES (extends auth.users) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  nrp text unique,
  phone text,
  role text not null default 'petugas' check (role in ('petugas', 'admin')),
  created_at timestamptz not null default now()
);

-- auto-create profile saat user baru daftar
create function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, nrp)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Petugas'), new.raw_user_meta_data->>'nrp');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------- ASSETS ----------
create table assets (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,              -- di-encode ke QR
  name text not null,
  serial_number text unique not null,
  status asset_status not null default 'tersedia',
  qr_code_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- BORROW TRANSACTIONS ----------
create table borrow_transactions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id),
  user_id uuid not null references profiles(id),
  status borrow_status not null default 'menunggu_persetujuan',
  purpose text not null,
  borrowed_at timestamptz,
  due_at timestamptz,
  returned_at timestamptz,
  approved_by uuid references profiles(id),
  condition_on_return return_condition,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- ASSET STATE LOGS (audit trail FSM) ----------
create table asset_state_logs (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id),
  from_state asset_status,
  to_state asset_status not null,
  triggered_by uuid references profiles(id),
  reason text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- FSM GUARD: fungsi terpusat validasi transisi status aset
-- Aturan:
--   tersedia -> dipinjam   (saat transaksi disetujui)
--   dipinjam -> tersedia   (dikembalikan, kondisi baik)
--   dipinjam -> rusak      (dikembalikan, kondisi rusak)
--   tersedia -> rusak      (ditandai admin)
--   rusak    -> tersedia   (selesai diperbaiki, dikonfirmasi admin)
-- Transisi di luar daftar ini DITOLAK.
-- =========================================================
create function change_asset_status(
  p_asset_id uuid,
  p_to_state asset_status,
  p_triggered_by uuid,
  p_reason text default null
) returns void as $$
declare
  v_current asset_status;
  v_allowed boolean := false;
begin
  select status into v_current from assets where id = p_asset_id for update;

  if v_current is null then
    raise exception 'Aset tidak ditemukan';
  end if;

  -- daftar transisi valid
  if v_current = 'tersedia' and p_to_state = 'dipinjam' then v_allowed := true;
  elsif v_current = 'dipinjam' and p_to_state = 'tersedia' then v_allowed := true;
  elsif v_current = 'dipinjam' and p_to_state = 'rusak' then v_allowed := true;
  elsif v_current = 'tersedia' and p_to_state = 'rusak' then v_allowed := true;
  elsif v_current = 'rusak' and p_to_state = 'tersedia' then v_allowed := true;
  end if;

  if not v_allowed then
    raise exception 'Transisi status tidak valid: % -> %', v_current, p_to_state;
  end if;

  update assets set status = p_to_state, updated_at = now() where id = p_asset_id;

  insert into asset_state_logs (asset_id, from_state, to_state, triggered_by, reason)
  values (p_asset_id, v_current, p_to_state, p_triggered_by, p_reason);
end;
$$ language plpgsql security definer;

-- =========================================================
-- RPC: ajukan peminjaman (dipanggil dari mobile app setelah scan QR)
-- =========================================================
create function request_borrow(
  p_asset_id uuid,
  p_purpose text,
  p_due_at timestamptz
) returns uuid as $$
declare
  v_status asset_status;
  v_transaction_id uuid;
begin
  select status into v_status from assets where id = p_asset_id;

  if v_status is null then
    raise exception 'Aset tidak ditemukan';
  end if;

  if v_status <> 'tersedia' then
    raise exception 'Aset tidak tersedia (status saat ini: %)', v_status;
  end if;

  insert into borrow_transactions (asset_id, user_id, purpose, due_at, status)
  values (p_asset_id, auth.uid(), p_purpose, p_due_at, 'menunggu_persetujuan')
  returning id into v_transaction_id;

  return v_transaction_id;
end;
$$ language plpgsql security definer;

-- =========================================================
-- RPC: ajukan pengembalian (dipanggil dari mobile app)
-- =========================================================
create function request_return(
  p_transaction_id uuid,
  p_condition return_condition
) returns void as $$
declare
  v_asset_id uuid;
  v_user_id uuid;
  v_status borrow_status;
begin
  select asset_id, user_id, status into v_asset_id, v_user_id, v_status
  from borrow_transactions where id = p_transaction_id;

  if v_status is null then
    raise exception 'Transaksi tidak ditemukan';
  end if;

  if v_user_id <> auth.uid() then
    raise exception 'Bukan pemilik transaksi ini';
  end if;

  if v_status <> 'disetujui' then
    raise exception 'Transaksi belum berstatus disetujui';
  end if;

  update borrow_transactions
  set status = 'dikembalikan', returned_at = now(), condition_on_return = p_condition, updated_at = now()
  where id = p_transaction_id;

  perform change_asset_status(
    v_asset_id,
    case when p_condition = 'baik' then 'tersedia' else 'rusak' end,
    auth.uid(),
    'Pengembalian oleh petugas, kondisi: ' || p_condition
  );
end;
$$ language plpgsql security definer;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table profiles enable row level security;
alter table assets enable row level security;
alter table borrow_transactions enable row level security;
alter table asset_state_logs enable row level security;

-- profiles: user bisa lihat profil sendiri
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);

-- assets: semua user login bisa lihat (butuh buat cek saat scan)
create policy "assets_select_all" on assets for select using (auth.role() = 'authenticated');

-- borrow_transactions: user hanya lihat transaksi miliknya sendiri
create policy "borrow_select_own" on borrow_transactions for select using (auth.uid() = user_id);
create policy "borrow_insert_own" on borrow_transactions for insert with check (auth.uid() = user_id);

-- asset_state_logs: user login bisa lihat log (read-only, buat riwayat)
create policy "logs_select_all" on asset_state_logs for select using (auth.role() = 'authenticated');

-- Catatan: role admin (approve, tandai rusak) dieksekusi lewat Laravel admin panel
-- yang connect pakai service_role key (bypass RLS) atau lewat RPC terpisah dengan cek role.
