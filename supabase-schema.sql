-- Supabase SQL Editor에서 실행하세요
-- (Supabase Dashboard → SQL Editor → New Query → 아래 내용 붙여넣기 → Run)

-- 구성원 테이블
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  title TEXT,
  department TEXT,
  note TEXT,
  persona JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 미팅 테이블
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id),
  member_name TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled',
  agenda_items JSONB DEFAULT '[]',
  internal_memo TEXT,
  transcript TEXT,
  summary JSONB,
  coaching JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 롤플레이 세션 테이블
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  persona_seed JSONB,
  messages JSONB DEFAULT '[]',
  feedback JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책 (데모용 - 모든 접근 허용)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to members" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to meetings" ON meetings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to practice_sessions" ON practice_sessions FOR ALL USING (true) WITH CHECK (true);
