
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

export async function POST(req: Request) {
  const { email } = await req.json();

  const token = randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 30);

  const { error: insertError } = await supabase
    .from('email_verifications')
    .insert({ email, token, expires_at: expires });

  if (insertError) {
    console.error(insertError);
    return Response.json({ error: 'DB登録失敗' }, { status: 500 });
  }

  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'メールアドレスの確認',
    html: `<p>こちらは「あなたの映画博物館」の新規アカウント作成確認メールです。</p>
    <p>もし心当たりがない場合は、このメールは無視してください。</p>
    <p><a href="${verifyUrl}">登録を完了するにはこちらをクリックしてください</a></p>
    `,
  });

  if (error) {
    console.error(error);
    return Response.json({ error: 'メール送信失敗' }, { status: 500 });
  }

  return Response.json({ message: 'sent' });
}