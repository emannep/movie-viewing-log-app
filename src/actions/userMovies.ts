
"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UpsertSchema = z.object({
  movie_id: z.string().uuid(),
  status: z.enum(["watched", "watchlist"]),
  watched_at: z.string().optional().nullable(), // yyyy-mm-dd
  memo: z.string().optional().nullable(),
});

export async function upsertUserMovie(input: unknown) {
  const supabase = createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  const parsed = UpsertSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.message);

  const { movie_id, status, watched_at, memo } = parsed.data;

  const { error } = await supabase.from("user_movies").upsert(
    {
      user_id: auth.user.id,
      movie_id,
      status,
      watched_at: status === "watched" ? watched_at ?? null : null,
      memo: memo ?? null,
    },
    { onConflict: "user_id,movie_id" }
  );

  if (error) throw new Error(error.message);
}