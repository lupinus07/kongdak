-- =========================================================
-- 콩닥 Supabase 스키마
-- 전제: 카카오 로그인은 Supabase Auth의 Kakao provider로 연동
--       (auth.users에 사용자가 생기고 auth.uid()로 본인 확인)
-- 결제·풀이 기록은 서버(Next.js API, service_role 키)에서만 씀
-- =========================================================


-- ---------------------------------------------------------
-- 1. 회원 (profiles)
--    auth.users와 1:1, 카카오 로그인 시 트리거로 자동 생성
-- ---------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  kakao_id        text unique,                 -- 카카오 회원번호
  nickname        text,
  email           text,                        -- 카카오 동의항목에서 받는 경우만
  -- 나의 연애운용 기본 정보 (한 번 입력하면 재사용)
  birth_date      date,
  birth_time      time,                        -- 모르면 null
  is_lunar        boolean not null default false,
  gender          text check (gender in ('F', 'M')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "본인 프로필 조회"
  on public.profiles for select
  using (auth.uid() = id);

create policy "본인 프로필 수정"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 카카오 로그인으로 auth.users가 생기면 profiles 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, kakao_id, nickname, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'provider_id',
    coalesce(
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'nickname'
    ),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------
-- 2. 상품 (products) — 궁합 990원, 나의 연애운 990원
-- ---------------------------------------------------------
create table public.products (
  code        text primary key,               -- 'compat', 'love'
  name        text not null,
  price       integer not null check (price >= 0),
  is_active   boolean not null default true
);

alter table public.products enable row level security;

create policy "상품은 누구나 조회"
  on public.products for select
  using (true);

insert into public.products (code, name, price) values
  ('compat', '우리 궁합 풀이', 990),
  ('love',   '나의 연애운',   990);


-- ---------------------------------------------------------
-- 3. 주문·결제 (orders) — 토스페이먼츠
--    클라이언트 쓰기 정책 없음 → 서버만 insert/update
-- ---------------------------------------------------------
create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles (id) on delete restrict,  -- 비회원 주문이면 null
  phone_last4     text check (phone_last4 ~ '^[0-9]{4}$'),                  -- 비회원 본인 확인용 휴대폰 뒷자리
  product_code    text not null references public.products (code),
  payment_id      text not null unique,       -- 우리가 만들어 포트원(PG)에 넘기는 결제 번호
  amount          integer not null,
  status          text not null default 'READY'
                  check (status in ('READY', 'DONE', 'CANCELED', 'REFUNDED', 'FAILED')),
  pg_tx_id        text unique,                -- 결제 후 PG가 주는 거래 번호
  pg_provider     text,                       -- 실제 처리한 PG
  method          text,                       -- 카드, 간편결제(카카오페이 등)
  approved_at     timestamptz,
  canceled_at     timestamptz,
  input           jsonb not null,             -- 결제 당시 입력값 (생년월일 등)
  -- 결과 링크용 비밀 값. 링크(?t=)를 가진 사람만 결과를 연다.
  access_token    text not null unique
                  default replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  -- 화면에 보여주는 짧은 주문번호. 뒷자리 4자리와 함께 결과 링크를 다시 찾을 때 쓴다.
  order_code      text generated always as (upper(substr(replace(id::text, '-', ''), 1, 8))) stored,
  created_at      timestamptz not null default now(),
  constraint orders_owner_check check (user_id is not null or phone_last4 is not null)
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_order_code_idx on public.orders (order_code);

alter table public.orders enable row level security;

create policy "본인 주문 조회"
  on public.orders for select
  using (auth.uid() = user_id);


-- ---------------------------------------------------------
-- 4. 풀이 결과 (readings) — 궁합·나의 연애운
--    opened_at: 처음 연 시각 (환불 기준: 열기 전에만 환불)
-- ---------------------------------------------------------
create table public.readings (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null unique references public.orders (id) on delete restrict,
  user_id         uuid references public.profiles (id) on delete cascade,  -- 비회원이면 null
  product_code    text not null references public.products (code),
  saju            jsonb,                      -- 계산한 사주 원국 (년월일시 간지 등)
  result          jsonb,                      -- AI가 만든 풀이 (챕터별)
  opened_at       timestamptz,                -- null이면 아직 안 열어봄
  created_at      timestamptz not null default now()
);

create index readings_user_id_idx on public.readings (user_id);

alter table public.readings enable row level security;

create policy "본인 풀이 조회"
  on public.readings for select
  using (auth.uid() = user_id);


-- ---------------------------------------------------------
-- 5. 타로 카드 (tarot_cards) — 78장, 누구나 읽기 가능
-- ---------------------------------------------------------
create table public.tarot_cards (
  id              smallint primary key,       -- 0~77 (0~21 메이저)
  arcana          text not null check (arcana in ('major', 'minor')),
  suit            text check (suit in ('wands', 'cups', 'swords', 'pentacles')),
  number          smallint,                   -- 메이저 0~21, 마이너 1~14
  name_en         text not null,              -- 'The Lovers'
  name_ko         text not null,              -- '연인'
  image_path      text not null,              -- Supabase Storage 경로
  keywords_up     text[] not null default '{}',  -- 정방향 키워드
  keywords_rev    text[] not null default '{}',  -- 역방향 키워드
  meaning_up      text not null,              -- 정방향 기본 의미
  meaning_rev     text not null               -- 역방향 기본 의미
);

alter table public.tarot_cards enable row level security;

create policy "타로 카드는 누구나 조회"
  on public.tarot_cards for select
  using (true);


-- ---------------------------------------------------------
-- 6. 타로 고민 카테고리 (tarot_topics)
-- ---------------------------------------------------------
create table public.tarot_topics (
  code        text primary key,
  name_ko     text not null,
  sort_order  smallint not null
);

alter table public.tarot_topics enable row level security;

create policy "고민 카테고리는 누구나 조회"
  on public.tarot_topics for select
  using (true);

insert into public.tarot_topics (code, name_ko, sort_order) values
  ('crush',       '짝사랑',            1),
  ('their_heart', '그 사람 속마음',     2),
  ('some',        '썸 진행 상황',       3),
  ('breakup',     '이별 · 재회',        4),
  ('confess',     '고백 타이밍',        5);


-- ---------------------------------------------------------
-- 7. 카테고리별 타로 풀이 (tarot_interpretations)
--    카드 78장 × 정/역 2 × 카테고리 5 = 780행
-- ---------------------------------------------------------
create table public.tarot_interpretations (
  card_id       smallint not null references public.tarot_cards (id) on delete cascade,
  topic_code    text not null references public.tarot_topics (code) on delete cascade,
  is_reversed   boolean not null,
  headline      text not null,                -- '마음이 서로를 향하고 있어요'
  message       text not null,                -- 카테고리별 풀이 2~3문장
  advice        text not null,                -- 콩닥 한마디
  primary key (card_id, topic_code, is_reversed)
);

alter table public.tarot_interpretations enable row level security;

create policy "타로 풀이는 누구나 조회"
  on public.tarot_interpretations for select
  using (true);
