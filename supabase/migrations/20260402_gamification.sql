-- ============================================================
-- Gamification: コレクション・レベル・王冠システム
-- ============================================================

-- 解放済みコレクション（ジャンル × 年代）
CREATE TABLE IF NOT EXISTS user_unlocked_collections (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  genre       text        NOT NULL,
  decade      integer     NOT NULL,  -- 例: 1990, 2000
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, genre, decade)
);
ALTER TABLE user_unlocked_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_collections" ON user_unlocked_collections
  FOR ALL USING (auth.uid() = user_id);

-- ジャンルごとの次コレクション解放に必要な本数
CREATE TABLE IF NOT EXISTS user_genre_progress (
  user_id       uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  genre         text    NOT NULL,
  next_unlock_at integer NOT NULL DEFAULT 3,
  PRIMARY KEY (user_id, genre)
);
ALTER TABLE user_genre_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_genre_progress" ON user_genre_progress
  FOR ALL USING (auth.uid() = user_id);

-- シーズン別ポイント・レベル履歴
CREATE TABLE IF NOT EXISTS user_season_levels (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_key text        NOT NULL,  -- 例: "2026-spring"
  points     integer     NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, season_key)
);
ALTER TABLE user_season_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_season_levels" ON user_season_levels
  FOR ALL USING (auth.uid() = user_id);
