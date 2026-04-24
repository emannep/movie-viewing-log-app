
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const rawNext = searchParams.get("next") ?? "/main/settings";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/main/settings";

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as "email_change" | "signup" | "recovery" });
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    } else {
      console.error("OTP verification failed:", error.message);
    }
  }

  return NextResponse.redirect(new URL("/main/settings?error=email_confirm_failed", origin));
}
