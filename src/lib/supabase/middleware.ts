import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * ミドルウェア用の Supabase クライアントでセッションを更新し、
 * 更新後のレスポンスを返す。Cookie の書き換えをレスポンスに反映するために使う。
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // セッションを更新（トークンリフレッシュ）。Cookie が変わっていれば response に反映する
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ここで必要なら「未ログイン時は /auth/login にリダイレクト」などの制御ができる
  // 例: if (!user && request.nextUrl.pathname.startsWith('/app')) { return NextResponse.redirect(...) }

  return response;
}
