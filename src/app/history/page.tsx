export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CUISINE_LABELS } from "@/app/admin/RestaurantForm";
import type { RestaurantRow, SessionRow } from "@/lib/supabase/types";

type HistorySession = SessionRow & {
  restaurants: RestaurantRow | null;
};

const CUISINE_EMOJI: Record<string, string> = {
  chinese: "🍜", malay: "🍛", indian: "🫓", indonesian: "🍲",
  vietnamese: "🍜", western: "🍔", italian: "🍝", mexican: "🌮",
  japanese: "🍱", korean: "🥘", thai: "🌶️", fast_food: "🍟",
  cafe: "☕", dessert: "🍨", other: "🍽️",
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data } = await supabase
    .from("sessions")
    .select("*, restaurants!top_restaurant_id(*)")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(20);

  const sessions = (data ?? []) as unknown as HistorySession[];

  return (
    <main className="min-h-screen bg-bg px-4 py-6">
      <div className="max-w-md mx-auto">
        <header className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text"
            aria-label="Back"
          >
            ←
          </Link>
          <h1 className="text-2xl font-black text-text tracking-tight">Your History</h1>
        </header>

        {sessions.length === 0 ? (
          <div className="bg-surface rounded-2xl p-6 text-center shadow-sm space-y-4">
            <p className="text-text-muted">You haven&apos;t swiped yet</p>
            <Link
              href="/swipe"
              className="inline-flex px-5 py-3 rounded-xl bg-brand text-white font-semibold"
            >
              Start now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const topCuisine = session.top_cuisine ?? "other";
              return (
                <Link
                  key={session.id}
                  href={`/results/${session.id}`}
                  className="block bg-surface rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-text-muted mb-1">
                        {formatDate(session.started_at)}
                      </p>
                      <h2 className="font-bold text-text truncate">
                        {session.restaurants?.name ?? "No match"}
                      </h2>
                      <p className="text-sm text-text-muted mt-1">
                        {session.total_yes}/{session.total_shown} liked
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-2xl">{CUISINE_EMOJI[topCuisine]}</p>
                      <p className="text-xs text-text-muted">
                        {CUISINE_LABELS[topCuisine as keyof typeof CUISINE_LABELS] ?? topCuisine}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
