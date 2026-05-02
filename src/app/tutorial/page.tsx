import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import TutorialClient from "./TutorialClient"

export default async function TutorialPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect("/auth/login")

  // チュートリアル完了済みならメインへ
  const cookieStore = await cookies()
  if (cookieStore.get("tutorial_done")?.value) redirect("/main")

  return <TutorialClient />
}
