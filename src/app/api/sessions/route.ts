import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scoreSession, rankCategories, rankRestaurants } from "@/lib/scoring";
import type { SwipeRecord } from "@/lib/scoring";

export async function POST(req: Request) {
  const { swipes }: { swipes: SwipeRecord[] } = await req.json();

  if (!swipes?.length) {
    return NextResponse.json({ error: "No swipes provided" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const scored = scoreSession(swipes);
  const rankedCategories = rankCategories(scored);
  const rankedRestaurants = rankRestaurants(scored);

  const yesSwipes = scored.filter((s) => s.decision);
  const yesTimes = yesSwipes.map((s) => s.timeToDecide);
  const tYesAvg = yesTimes.length
    ? yesTimes.reduce((a, b) => a + b, 0) / yesTimes.length
    : null;
  const tYesSd =
    yesTimes.length > 1
      ? Math.sqrt(
          yesTimes.reduce((a, b) => a + (b - tYesAvg!) ** 2, 0) / yesTimes.length
        )
      : null;

  const { data: session, error: sessionErr } = await supabase
    .from("sessions")
    .insert({
      user_id: user?.id ?? null,
      total_shown: swipes.length,
      total_yes: yesSwipes.length,
      top_cuisine: rankedCategories[0]?.category as any ?? null,
      top_restaurant_id: rankedRestaurants[0]?.id ?? null,
      t_yes_avg: tYesAvg,
      t_yes_sd: tYesSd,
    })
    .select("id")
    .single();

  if (sessionErr || !session) {
    console.error(sessionErr);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

  const swipeRows = scored.map((s, i) => ({
    session_id: session.id,
    user_id: user?.id ?? null,
    restaurant_id: s.restaurantId,
    cuisine_category: s.cuisineCategory as any,
    decision: s.decision,
    time_to_decide: s.timeToDecide,
    swipe_order: i,
    session_score: s.sessionScore,
    time_enthusiasm: s.timeEnthusiasm ?? null,
  }));

  const { error: swipeErr } = await supabase.from("swipe_events").insert(swipeRows);

  if (swipeErr) {
    console.error(swipeErr);
    return NextResponse.json({ error: "Failed to save swipes" }, { status: 500 });
  }

  return NextResponse.json({ sessionId: session.id });
}
