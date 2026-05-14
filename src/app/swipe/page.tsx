export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { SwipeSession } from "./SwipeSession";

function randomSort() {
  return Math.random() - 0.5;
}

export default async function SwipePage() {
  const supabase = await createClient();

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("*")
    .eq("is_active", true)
    .order("created_at");

  // Shuffle and cap at 20
  const shuffled = (restaurants ?? [])
    .sort(randomSort)
    .slice(0, 20);

  return <SwipeSession restaurants={shuffled} />;
}
