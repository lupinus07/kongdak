-- 풀이 생성 중 표시 (2026-10)
-- Supabase SQL Editor에서 한 번 실행한다. kongdak_schema.sql은 이 변경이 반영된 최종 모습이다.
-- 탭을 닫아도 서버에서 풀이를 끝까지 만들고, 같은 주문의 풀이를 두 번 만들지 않도록 잠그는 데 쓴다.

alter table public.readings add column generating_at timestamptz;
