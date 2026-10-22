-- 비회원 결제 + 포트원 전환 (2026-10)
-- Supabase SQL Editor에서 한 번 실행한다. kongdak_schema.sql은 이 변경이 반영된 최종 모습이다.

begin;

-- 1) PG와 상관없는 이름으로 (토스 → 포트원)
alter table public.orders rename column toss_order_id to payment_id;  -- 우리가 만들어 PG에 넘기는 결제 번호
alter table public.orders rename column payment_key to pg_tx_id;      -- 결제 후 PG가 주는 거래 번호
alter table public.orders add column pg_provider text;                -- 실제 처리한 PG (포트원 응답의 pgProvider)

-- 2) 비회원 주문: 회원 아이디 대신 휴대폰 뒷자리 4자리
alter table public.orders alter column user_id drop not null;
alter table public.orders add column phone_last4 text check (phone_last4 ~ '^[0-9]{4}$');
alter table public.orders add constraint orders_owner_check check (user_id is not null or phone_last4 is not null);

-- 3) 결과 링크용 비밀 값(추측 불가). 링크를 가진 사람만 결과를 연다.
alter table public.orders add column access_token text not null unique
  default replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');

-- 4) 화면에 보여주는 짧은 주문번호 (예: 1A2B3C4D). 뒷자리 4자리와 함께 결과 링크를 다시 찾을 때 쓴다.
alter table public.orders add column order_code text
  generated always as (upper(substr(replace(id::text, '-', ''), 1, 8))) stored;
create index orders_order_code_idx on public.orders (order_code);

alter table public.readings alter column user_id drop not null;

commit;
