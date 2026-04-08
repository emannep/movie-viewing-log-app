import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserCollections } from "@/app/actions/collections";
import CollectionGallery from "./CollectionGallery";

export default async function CollectionPage() {
  const supabase = await createClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) redirect("/auth/login");

  const collections = await getUserCollections();

  return (
    <div className="w-full flex flex-col gap-5">
      <CollectionGallery collections={collections} />
    </div>
  );
}
