-- 사용자별 비밀번호 컬럼 추가 (기본값: 0520, 관리자: 950520)
ALTER TABLE public.users ADD COLUMN password TEXT NOT NULL DEFAULT '0520';

-- 관리자 비밀번호 설정
UPDATE public.users SET password = '950520' WHERE id = 0;