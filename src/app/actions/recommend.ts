"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ReviewSchema = z.object({
  movie_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  body: z.string().optional().nullable(),
});

export async function upsertReview(input: unknown) {
  const supabase = createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  const parsed = ReviewSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.message);

  const { error } = await supabase.from("reviews").upsert(
    {
      user_id: auth.user.id,
      ...parsed.data,
      body: parsed.data.body ?? null,
    },
    { onConflict: "user_id,movie_id" }
  );

  if (error) throw new Error(error.message);
}
