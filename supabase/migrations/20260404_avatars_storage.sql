-- ============================================================
-- avatars ストレージバケット作成 + RLS ポリシー設定
-- Supabase SQL Editor にそのままコピペして実行できます
-- 何度実行しても安全（冪等）
-- ============================================================

-- 1. バケット作成
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. 既存ポリシーを削除（再実行時のエラー防止）
DROP POLICY IF EXISTS "Users can upload their own avatar"  ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar"  ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar"  ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars"            ON storage.objects;

-- 3. ポリシー作成
-- アップロード: 自分のフォルダ（/{user_id}/）のみ
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 上書き: 自分のファイルのみ
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 削除: 自分のファイルのみ
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 閲覧: 全員（公開バケット）
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
