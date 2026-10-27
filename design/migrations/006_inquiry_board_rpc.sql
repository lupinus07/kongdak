-- 문의 게시판을 브라우저에서 바로 읽기 (2026-10)
-- Supabase SQL Editor에서 한 번 실행한다. kongdak_schema.sql은 이 변경이 반영된 최종 모습이다.
-- inquiries 표는 그대로 잠가 두고(RLS, 정책 없음), 공개해도 되는 칸만 돌려주는 함수 두 개를 연다.
-- 결제내역처럼 브라우저가 Supabase에 바로 물어봐서, 서버(Vercel)를 거치지 않아 빠르다.

-- 목록: 문의번호·종류·날짜·답변 여부·내 글 여부만. 내용·비밀번호·연락처는 돌려주지 않는다.
create or replace function public.inquiry_list(p_offset int, p_limit int, p_mine boolean default false)
returns table (code text, category text, created_at timestamptz, answered boolean, mine boolean)
language sql stable security definer set search_path = public
as $$
  select i.code, i.category, i.created_at, i.answered_at is not null, coalesce(i.user_id = auth.uid(), false)
  from public.inquiries i
  where not p_mine or (auth.uid() is not null and i.user_id = auth.uid())
  order by i.created_at desc
  offset greatest(p_offset, 0)
  limit least(greatest(p_limit, 1), 50);
$$;

-- 글 하나: 로그인한 본인 글이면 내용·답변까지, 아니면 잠금 화면에 쓸 종류·날짜만 (내용은 null).
create or replace function public.inquiry_view(p_code text)
returns table (code text, category text, created_at timestamptz, mine boolean, content text, answer text, answered_at timestamptz)
language sql stable security definer set search_path = public
as $$
  select i.code, i.category, i.created_at, own, case when own then i.content end, case when own then i.answer end,
         case when own then i.answered_at end
  from public.inquiries i, lateral (select coalesce(i.user_id = auth.uid(), false) as own) o
  where i.code = upper(p_code)
  limit 1;
$$;

grant execute on function public.inquiry_list(int, int, boolean) to anon, authenticated;
grant execute on function public.inquiry_view(text) to anon, authenticated;
