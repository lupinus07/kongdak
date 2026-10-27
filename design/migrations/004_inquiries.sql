-- 1:1 문의 (2026-10)
-- Supabase SQL Editor에서 한 번 실행한다. kongdak_schema.sql은 이 변경이 반영된 최종 모습이다.
-- 사이트의 문의하기에서 받고, 관리자 화면(/admin)에서 답한다. 문의한 사람은 문의번호 + 휴대폰 뒷자리로 답변을 본다.

create table public.inquiries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles (id) on delete set null,  -- 로그인한 채로 문의했으면 기록
  category        text not null check (category in ('환불', '결제', '풀이 오류', '기타')),
  order_code      text check (order_code ~ '^[0-9A-F]{8}$'),                 -- 관련 주문번호 (선택)
  phone_last4     text not null check (phone_last4 ~ '^[0-9]{4}$'),         -- 답변 확인용 휴대폰 뒷자리
  content         text not null check (char_length(content) between 5 and 1000),
  answer          text check (char_length(answer) <= 2000),
  answered_at     timestamptz,
  -- 화면에 보여주는 짧은 문의번호. 뒷자리와 함께 답변을 확인할 때 쓴다.
  code            text generated always as (upper(substr(replace(id::text, '-', ''), 1, 8))) stored,
  created_at      timestamptz not null default now()
);

create index inquiries_code_idx on public.inquiries (code);
create index inquiries_open_idx on public.inquiries (created_at desc) where answered_at is null;

-- 클라이언트 읽기·쓰기 정책 없음 → 서버만 읽고 쓴다
alter table public.inquiries enable row level security;
