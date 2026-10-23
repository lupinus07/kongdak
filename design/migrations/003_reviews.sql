-- 이용 후기 (2026-10)
-- Supabase SQL Editor에서 한 번 실행한다. kongdak_schema.sql은 이 변경이 반영된 최종 모습이다.
-- 유료 풀이 결과 화면 맨 아래에서 받는다. 결과 링크로 결제를 확인한 뒤 서버에서만 기록한다(구매 인증 후기).

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

-- 클라이언트 읽기·쓰기 정책 없음 → 서버만 읽고 쓴다 (주문 id가 밖으로 나가지 않게)
alter table public.reviews enable row level security;
