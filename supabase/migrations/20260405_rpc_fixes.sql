-- ============================================================
-- CodeRabbit 指摘対応: アトミック操作用 RPC 関数
-- ============================================================

-- 1. increment_user_points: ポイントのアトミック加算
--    read-then-write の競合状態を解消する
CREATE OR REPLACE FUNCTION increment_user_points(
  p_user_id uuid,
  p_points   integer
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO user_points (user_id, total_points, updated_at)
  VALUES (p_user_id, p_points, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_points = user_points.total_points + EXCLUDED.total_points,
    updated_at   = now();
$$;

-- 2. delete_movie_if_orphaned: 孤立映画のアトミック削除
--    他のユーザーが同じ映画を登録していない場合のみ movies から削除する
CREATE OR REPLACE FUNCTION delete_movie_if_orphaned(
  p_movie_id uuid
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM movies
  WHERE id = p_movie_id
    AND NOT EXISTS (
      SELECT 1 FROM user_movies WHERE movie_id = p_movie_id
    );
$$;

-- 3. 20260404_cumulative_points.sql の移行を安全にする
--    user_season_levels が存在する場合のみデータ移行を実行
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'user_season_levels'
  ) THEN
    INSERT INTO user_points (user_id, total_points)
    SELECT user_id, SUM(points)
    FROM user_season_levels
    GROUP BY user_id
    ON CONFLICT (user_id) DO UPDATE
      SET total_points = EXCLUDED.total_points,
          updated_at   = now();
  END IF;
END;
$$;
