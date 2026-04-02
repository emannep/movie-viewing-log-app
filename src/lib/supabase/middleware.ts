import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/*セッションを更新、更新後のレスポンスを返す*/
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

  const { pathname } = request.nextUrl;

  const isLoginPage = pathname.startsWith("/auth/login");
  const isMainPage = pathname.startsWith("/main");

  if (!user && isMainPage) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/main/movies", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/main/:path*", "/auth/login"],
};