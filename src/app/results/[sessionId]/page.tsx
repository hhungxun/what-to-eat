export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ResultsClient } from "./ResultsClient";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function ResultsPage({ params }: Props) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (!session) notFound();

  const { data: swipeEvents } = await supabase
    .from("swipe_events")
    .select("*, restaurants(*)")
    .eq("session_id", sessionId)
    .order("swipe_order");

  const { data: topRestaurant } = session.top_restaurant_id
    ? await supabase
        .from("restaurants")
        .select("*")
        .eq("id", session.top_restaurant_id)
        .single()
    : { data: null };

  return (
    <ResultsClient
      session={session}
      swipeEvents={swipeEvents ?? []}
      topRestaurant={topRestaurant}
    />
  );
}
