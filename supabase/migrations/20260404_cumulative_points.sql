-- ============================================================
-- 累計ポイントテーブル作成 + 既存データ移行
-- Supabase SQL Editor にそのままコピペして実行できます
-- ============================================================

-- 1. 累計ポイントテーブル作成
CREATE TABLE IF NOT EXISTS user_points (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. RLS 有効化
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- 3. ポリシー（既存分を削除してから再作成）
DROP POLICY IF EXISTS "Users can view own points"   ON user_points;
DROP POLICY IF EXISTS "Users can insert own points" ON user_points;
DROP POLICY IF EXISTS "Users can update own points" ON user_points;

CREATE POLICY "Users can view own points"
  ON user_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own points"
  ON user_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own points"
  ON user_points FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. 既存の user_season_levels データを累計に変換して移行
INSERT INTO user_points (user_id, total_points)
SELECT user_id, SUM(points)
FROM user_season_levels
GROUP BY user_id
ON CONFLICT (user_id) DO UPDATE
  SET total_points = EXCLUDED.total_points,
      updated_at   = now();

-- 5. user_season_levels を削除（累計保存に移行したため不要）
DROP TABLE IF EXISTS user_season_levels;
