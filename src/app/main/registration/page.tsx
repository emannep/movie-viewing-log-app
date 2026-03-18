
import { createClient } from "@/lib/supabase/server"; 
import RegisterForm from "./registerForm";

export default async function RegisterPage() {
  const supabase = await createClient();

  const { data: genres, error: genresError } = await supabase
    .from("genres")
    .select("id, name")
    .order("order_index", { ascending: true });

  if (genresError) {
    console.error(genresError);
  }

  return <RegisterForm genres={genres ?? []} />;
}