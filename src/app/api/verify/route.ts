
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  const token = new URL(req.url).searchParams.get('token');

  const { data } = await supabase
    .from('email_verifications')
    .select('*')
    .eq('token', token)
    .single();

  if (!data || new Date(data.expires_at) < new Date()) {
    return Response.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/signup?error=invalid`);
  }

  await supabase.from('email_verifications').delete().eq('token', token);

  return Response.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/main`);
}