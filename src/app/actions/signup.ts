'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signupAction(formData: FormData) {
  const supabase = await createClient();

  const rawEmail = formData.get('email') as string | null;
  const rawPassword = formData.get('password') as string | null;
  const email = rawEmail?.trim() ?? null;
  const password = rawPassword ?? null;

  if (!email || !password) {
    return { error: "メールとパスワードは必須です" };
  }

  if (password.length < 8) {
    return { error: "パスワードは8文字以上で入力してください" };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { pendingEmail: email };
}
