"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { SwipeDeck } from "@/components/swipe/SwipeDeck";
import type { RestaurantRow } from "@/lib/supabase/types";
import type { SwipeRecord } from "@/lib/scoring";

type Restaurant = RestaurantRow;

export function SwipeSession({ restaurants }: { restaurants: Restaurant[] }) {
  const router = useRouter();

  const handleComplete = useCallback(
    async (swipes: SwipeRecord[]) => {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ swipes }),
      });

      if (res.ok) {
        const { sessionId } = await res.json();
        router.push(`/results/${sessionId}`);
      }
    },
    [router]
  );

  if (restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-center px-8">
        <span className="text-5xl">🍽️</span>
        <h2 className="text-xl font-bold text-text">No restaurants yet</h2>
        <p className="text-text-muted text-sm">
          The admin hasn&apos;t added any options yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-bg overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-bg/80 backdrop-blur-sm">
        <span className="font-black text-xl text-brand tracking-tight">What To Eat?</span>
        <span className="text-xs text-text-muted">XMUM</span>
      </header>

      <div className="flex-1 overflow-hidden">
        <SwipeDeck restaurants={restaurants} onComplete={handleComplete} />
      </div>
    </div>
  );
}
