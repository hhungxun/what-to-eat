"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { SwipeDeck } from "@/components/swipe/SwipeDeck";
import type { RestaurantRow } from "@/lib/supabase/types";
import type { SwipeRecord } from "@/lib/scoring";

type Restaurant = RestaurantRow;

export function SwipeSession({ restaurants }: { restaurants: Restaurant[] }) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [filters, setFilters] = useState({ halal: false, vegetarian: false, vegan: false });

  const filteredRestaurants = restaurants.filter(
    (r) =>
      (!filters.halal || r.is_halal) &&
      (!filters.vegetarian || r.is_vegetarian) &&
      (!filters.vegan || r.is_vegan)
  );

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
        <Link href="/" className="font-black text-xl text-brand tracking-tight">
          What To Eat?
        </Link>
        <span className="text-xs text-text-muted">XMUM</span>
      </header>

      <div className="flex-1 overflow-hidden">
        {started ? (
          <SwipeDeck restaurants={filteredRestaurants} onComplete={handleComplete} />
        ) : (
          <div className="h-full flex items-center justify-center px-6">
            <div className="w-full max-w-sm space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-text tracking-tight">Any preferences?</h1>
                <p className="text-text-muted text-sm">We&apos;ll filter the deck for you.</p>
              </div>

              <div className="space-y-3">
                <FilterToggle
                  label="Halal"
                  checked={filters.halal}
                  onChange={() => setFilters((prev) => ({ ...prev, halal: !prev.halal }))}
                />
                <FilterToggle
                  label="Vegetarian"
                  checked={filters.vegetarian}
                  onChange={() => setFilters((prev) => ({ ...prev, vegetarian: !prev.vegetarian }))}
                />
                <FilterToggle
                  label="Vegan"
                  checked={filters.vegan}
                  onChange={() => setFilters((prev) => ({ ...prev, vegan: !prev.vegan }))}
                />
              </div>

              <p className="text-text-muted text-sm text-center">
                {filteredRestaurants.length} restaurants ready
              </p>

              <button
                type="button"
                onClick={() => setStarted(true)}
                disabled={filteredRestaurants.length === 0}
                className="w-full py-4 rounded-2xl bg-brand text-white font-bold disabled:opacity-50 active:scale-95 transition-transform"
              >
                {filteredRestaurants.length === 0 ? "No matches — adjust filters" : "Start Swiping →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="w-full flex items-center justify-between bg-surface rounded-2xl px-4 py-3 shadow-sm"
    >
      <span className="font-semibold text-text">{label}</span>
      <span className={`w-12 h-6 rounded-full transition-colors ${checked ? "bg-brand" : "bg-border"}`}>
        <span
          className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 mt-0.5 ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
