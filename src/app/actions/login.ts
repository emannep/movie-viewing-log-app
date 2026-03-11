'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function loginAction(formData: FormData) {
  const supabase = await createClient();

  const rawEmail = formData.get('email') as string | null;
  const rawPassword = formData.get('password') as string | null;
  const email = rawEmail?.trim() ?? null;
  const password = rawPassword ?? null;

  if (!email || !password) {
    return { error: "メールとパスワードは必須です" };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/main")
}

export async function signupAction(formData: FormData) {
  const supabase = await createClient();

  const rawEmail = formData.get('email') as string | null;
  const rawPassword = formData.get('password') as string | null;
  const email = rawEmail?.trim() ?? null;
  const password = rawPassword ?? null;

  if (!email || !password) {
    return { error: "メールとパスワードは必須です" };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/main")
}

export async function authAction(formData: FormData) {
  const mode = (formData.get("mode") as string | null) ?? "login";

  if (mode === "signup") {
    return signupAction(formData);
  }

  return loginAction(formData);
}
