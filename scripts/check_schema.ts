import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from("movies").select("*").limit(1);
  if (error) {
    console.error("Error fetching movies:", error);
  } else {
    console.log("Movies Table Schema (from first row):");
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]));
      console.log(data[0]);
    } else {
      console.log("Table is empty but fetch succeeded.");
    }
  }
}

main();
