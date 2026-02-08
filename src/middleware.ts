import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * 全リクエストで Supabase のセッション（Cookie）を更新する。
 * トークンリフレッシュやログイン状態の反映に必要。
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 以下を除くすべてのパスで実行:
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - 画像などの静的ファイル
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
