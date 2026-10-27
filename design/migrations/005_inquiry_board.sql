-- 문의 게시판: 휴대폰 뒷자리 대신 비밀번호로 열람 (2026-10)
-- Supabase SQL Editor에서 한 번 실행한다. kongdak_schema.sql은 이 변경이 반영된 최종 모습이다.
-- 목록은 누구나 보지만(종류·답변 상태·날짜만), 내용은 비밀번호나 본인 로그인으로만 연다.

alter table public.inquiries add column password_hash text;                              -- scrypt 해시 (원문은 저장하지 않음)
alter table public.inquiries add column failed_attempts smallint not null default 0;     -- 비밀번호 연속 실패 횟수
alter table public.inquiries add column locked_until timestamptz;                        -- 5번 틀리면 10분 잠금
alter table public.inquiries alter column phone_last4 drop not null;                     -- 예전 문의만 뒷자리로 열림
