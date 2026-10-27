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
-- 2. 상품 (products) — 궁합 1,980원, 나의 연애운 990원
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
  ('compat', '우리 궁합 풀이', 1980),
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
  payment_id      text not null unique,       -- 우리가 만들어 토스에 넘기는 주문번호(orderId)
  amount          integer not null,
  status          text not null default 'READY'
                  check (status in ('READY', 'DONE', 'CANCELED', 'REFUNDED', 'FAILED')),
  pg_tx_id        text unique,                -- 결제 후 토스가 주는 paymentKey
  pg_provider     text,                       -- 결제대행사 (tosspayments)
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
  generating_at   timestamptz,                -- 풀이 생성을 시작한 시각 (중복 생성 방지용 잠금)
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


-- ---------------------------------------------------------
-- 8. 이용 후기 (reviews) — 유료 풀이 결과 화면 맨 아래에서 받음
--    결과 링크로 결제를 확인한 뒤 서버에서만 기록 (구매 인증 후기)
--    클라이언트 읽기·쓰기 정책 없음 → 서버만 읽고 쓴다
-- ---------------------------------------------------------
create table public.reviews (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null unique references public.orders (id) on delete cascade,  -- 주문 하나에 후기 하나
  product_code    text not null references public.products (code),
  rating          smallint not null check (rating between 1 and 5),   -- 하트 1~5개
  comment         text check (char_length(comment) <= 100),           -- 한 줄 후기 (선택)
  nickname        text check (char_length(nickname) <= 10),           -- 닉네임 (선택, 화면에는 일부를 가려서 보여줌)
  hidden          boolean not null default false,                     -- true면 공개 목록에서 숨김 (욕설·실명 등)
  created_at      timestamptz not null default now()
);

create index reviews_visible_idx on public.reviews (created_at desc) where not hidden;

alter table public.reviews enable row level security;


-- ---------------------------------------------------------
-- 9. 1:1 문의 (inquiries) — 문의 게시판에서 받고 관리자 화면에서 답함
--    목록은 종류·답변 상태·날짜만 공개, 내용은 비밀번호(또는 로그인한 본인)로만 연다
--    클라이언트 읽기·쓰기 정책 없음 → 서버만 읽고 쓴다
-- ---------------------------------------------------------
create table public.inquiries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles (id) on delete set null,  -- 로그인한 채로 문의했으면 기록
  category        text not null check (category in ('환불', '결제', '풀이 오류', '기타')),
  order_code      text check (order_code ~ '^[0-9A-F]{8}$'),                 -- 관련 주문번호 (선택)
  phone_last4     text check (phone_last4 ~ '^[0-9]{4}$'),                 -- 예전 문의용 (지금은 비밀번호 사용)
  password_hash   text,                       -- 열람 비밀번호 scrypt 해시 (원문은 저장하지 않음)
  failed_attempts smallint not null default 0,
  locked_until    timestamptz,                -- 비밀번호 5번 틀리면 10분 잠금
  content         text not null check (char_length(content) between 5 and 1000),
  answer          text check (char_length(answer) <= 2000),
  answered_at     timestamptz,
  -- 화면에 보여주는 짧은 문의번호 (게시판 주소에 쓴다)
  code            text generated always as (upper(substr(replace(id::text, '-', ''), 1, 8))) stored,
  created_at      timestamptz not null default now()
);

create index inquiries_code_idx on public.inquiries (code);
create index inquiries_open_idx on public.inquiries (created_at desc) where answered_at is null;

alter table public.inquiries enable row level security;
