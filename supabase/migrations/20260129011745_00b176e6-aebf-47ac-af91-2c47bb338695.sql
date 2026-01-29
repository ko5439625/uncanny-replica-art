-- 사용자 테이블
CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '😊',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 가용성 (날짜별 참여 가능 여부)
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, user_id)
);

-- 규칙
CREATE TABLE public.rules (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  order_num INTEGER NOT NULL DEFAULT 1,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 밸런스 게임
CREATE TABLE public.balance_games (
  id SERIAL PRIMARY KEY,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- 밸런스 게임 투표
CREATE TABLE public.balance_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id INTEGER NOT NULL REFERENCES public.balance_games(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('A', 'B')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_id, user_id)
);

-- 익명 TMI 포스트
CREATE TABLE public.anonymous_posts (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  author_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 익명 포스트 좋아요
CREATE TABLE public.anonymous_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id INTEGER NOT NULL REFERENCES public.anonymous_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- 사용자 TMI 포스트
CREATE TABLE public.user_posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 사용자 포스트 리액션
CREATE TABLE public.user_post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id INTEGER NOT NULL REFERENCES public.user_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (emoji IN ('👍', '🔥', '😂', '❤️')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, emoji)
);

-- 공지사항
CREATE TABLE public.announcement (
  id INTEGER PRIMARY KEY DEFAULT 1,
  text TEXT NOT NULL DEFAULT '',
  visible BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 공지사항 초기 데이터
INSERT INTO public.announcement (id, text, visible) VALUES (1, '', false);

-- 관리자 계정 추가
INSERT INTO public.users (id, name, nickname, emoji, is_admin) VALUES (0, '관리자', '이끄는 이', '👑', true);

-- 기본 사용자 추가
INSERT INTO public.users (name, nickname, emoji) VALUES
  ('사용자1', '토끼', '🐰'),
  ('사용자2', '곰돌이', '🐻'),
  ('사용자3', '여우', '🦊'),
  ('사용자4', '냥이', '🐱'),
  ('사용자5', '멍멍이', '🐶'),
  ('사용자6', '판다', '🐼'),
  ('사용자7', '사자', '🦁'),
  ('사용자8', '호랑이', '🐯'),
  ('사용자9', '코알라', '🐨'),
  ('사용자10', '개구리', '🐸');

-- 기본 규칙 추가
INSERT INTO public.rules (text, order_num) VALUES
  ('야, 너 금지 ❌', 1),
  ('닉네임 뒤에 님 붙이기 ✨', 2),
  ('울기 없기 😤', 3);

-- RLS 활성화 (공개 앱이므로 모든 사용자가 읽기/쓰기 가능)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement ENABLE ROW LEVEL SECURITY;

-- 모든 테이블에 공개 접근 허용 (비밀번호 기반 로그인이므로 Supabase Auth 미사용)
CREATE POLICY "Public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Public delete users" ON public.users FOR DELETE USING (true);

CREATE POLICY "Public read availability" ON public.availability FOR SELECT USING (true);
CREATE POLICY "Public insert availability" ON public.availability FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete availability" ON public.availability FOR DELETE USING (true);

CREATE POLICY "Public read rules" ON public.rules FOR SELECT USING (true);
CREATE POLICY "Public insert rules" ON public.rules FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update rules" ON public.rules FOR UPDATE USING (true);
CREATE POLICY "Public delete rules" ON public.rules FOR DELETE USING (true);

CREATE POLICY "Public read balance_games" ON public.balance_games FOR SELECT USING (true);
CREATE POLICY "Public insert balance_games" ON public.balance_games FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update balance_games" ON public.balance_games FOR UPDATE USING (true);

CREATE POLICY "Public read balance_votes" ON public.balance_votes FOR SELECT USING (true);
CREATE POLICY "Public insert balance_votes" ON public.balance_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update balance_votes" ON public.balance_votes FOR UPDATE USING (true);
CREATE POLICY "Public delete balance_votes" ON public.balance_votes FOR DELETE USING (true);

CREATE POLICY "Public read anonymous_posts" ON public.anonymous_posts FOR SELECT USING (true);
CREATE POLICY "Public insert anonymous_posts" ON public.anonymous_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete anonymous_posts" ON public.anonymous_posts FOR DELETE USING (true);

CREATE POLICY "Public read anonymous_post_likes" ON public.anonymous_post_likes FOR SELECT USING (true);
CREATE POLICY "Public insert anonymous_post_likes" ON public.anonymous_post_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete anonymous_post_likes" ON public.anonymous_post_likes FOR DELETE USING (true);

CREATE POLICY "Public read user_posts" ON public.user_posts FOR SELECT USING (true);
CREATE POLICY "Public insert user_posts" ON public.user_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete user_posts" ON public.user_posts FOR DELETE USING (true);

CREATE POLICY "Public read user_post_reactions" ON public.user_post_reactions FOR SELECT USING (true);
CREATE POLICY "Public insert user_post_reactions" ON public.user_post_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete user_post_reactions" ON public.user_post_reactions FOR DELETE USING (true);

CREATE POLICY "Public read announcement" ON public.announcement FOR SELECT USING (true);
CREATE POLICY "Public update announcement" ON public.announcement FOR UPDATE USING (true);

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.availability;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.balance_games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.balance_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_post_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcement;