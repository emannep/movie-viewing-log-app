"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateDisplayName(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return { error: "認証が必要です" };

  const displayName = (formData.get("displayName") as string)?.trim();
  if (!displayName) return { error: "名前を入力してください" };

  const { error } = await supabase.auth.updateUser({
    data: { display_name: displayName },
  });

  if (error) return { error: error.message };
  revalidatePath("/main/settings");
  revalidatePath("/main/profile");
  return { success: true };
}

export async function updateEmail(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return { error: "認証が必要です" };

  const email = (formData.get("email") as string)?.trim();
  if (!email) return { error: "メールアドレスを入力してください" };
  if (email === user.email) return { error: "現在と同じメールアドレスです" };

  const headersList = await headers();
  const origin = headersList.get("origin") ?? headersList.get("x-forwarded-host") ?? "http://localhost:3000";
  const emailRedirectTo = `${origin}/auth/callback?next=/main/settings`;

  const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo });
  if (error) return { error: error.message };
  return { success: true, message: "確認メールを送信しました。新しいアドレスで確認してください。" };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return { error: "認証が必要です" };

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password) return { error: "パスワードを入力してください" };
  if (password.length < 6) return { error: "パスワードは6文字以上にしてください" };
  if (password !== confirmPassword) return { error: "パスワードが一致しません" };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return { error: "認証が必要です" };

  const file = formData.get("avatar") as File;
  if (!file || file.size === 0) return { error: "ファイルを選択してください" };

  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) return { error: "ファイルサイズは2MB以下にしてください" };

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) return { error: "JPG / PNG / WebP / GIF のみ対応しています" };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadErr) return { error: uploadErr.message };

  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(path);

  // cache busting
  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: updateErr } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl },
  });

  if (updateErr) return { error: updateErr.message };
  revalidatePath("/main/settings");
  revalidatePath("/main/profile");
  return { success: true, url: avatarUrl };
}
