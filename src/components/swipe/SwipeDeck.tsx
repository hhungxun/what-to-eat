"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { SwipeCard } from "./SwipeCard";
import { SwipeButtons } from "./SwipeButtons";
import type { RestaurantRow } from "@/lib/supabase/types";
import type { SwipeRecord } from "@/lib/scoring";

type Restaurant = RestaurantRow;

interface SwipeDeckProps {
  restaurants: Restaurant[];
  onComplete: (swipes: SwipeRecord[]) => void;
}

export function SwipeDeck({ restaurants, onComplete }: SwipeDeckProps) {
  const [remaining, setRemaining] = useState(restaurants);
  const [swipes, setSwipes] = useState<SwipeRecord[]>([]);
  const cardStartTime = useRef<number>(0);

  useEffect(() => {
    cardStartTime.current = Date.now();
  }, []);

  const handleSwipe = useCallback(
    (decision: boolean, timeToDecide: number) => {
      const current = remaining[0];
      if (!current) return;

      const record: SwipeRecord = {
        restaurantId: current.id,
        cuisineCategory: current.cuisine_category,
        decision,
        timeToDecide,
      };

      const newSwipes = [...swipes, record];
      const newRemaining = remaining.slice(1);

      setSwipes(newSwipes);
      setRemaining(newRemaining);
      cardStartTime.current = Date.now();

      if (newRemaining.length === 0) {
        onComplete(newSwipes);
      }
    },
    [remaining, swipes, onComplete]
  );

  const handleButton = useCallback(
    (decision: boolean) => {
      const elapsed = Date.now() - cardStartTime.current;
      handleSwipe(decision, elapsed);
    },
    [handleSwipe]
  );

  const handleUndo = useCallback(() => {
    if (swipes.length === 0) return;
    const lastSwipe = swipes[swipes.length - 1];
    const lastRestaurant = restaurants.find((r) => r.id === lastSwipe.restaurantId);
    if (!lastRestaurant) return;

    setSwipes(swipes.slice(0, -1));
    setRemaining([lastRestaurant, ...remaining]);
    cardStartTime.current = Date.now();
  }, [remaining, restaurants, swipes]);

  if (remaining.length === 0) return null;

  const progress = swipes.length / restaurants.length;

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-xs text-text-muted mt-1 text-right">
          {swipes.length} / {restaurants.length}
        </p>
      </div>

      {/* Card stack */}
      <div className="relative flex-1 mx-4">
        <AnimatePresence>
          {remaining.slice(0, 3).map((r, i) => (
            <SwipeCard
              key={r.id}
              restaurant={r}
              isTop={i === 0}
              stackIndex={i}
              onSwipe={handleSwipe}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <SwipeButtons
        onNo={() => handleButton(false)}
        onUndo={handleUndo}
        canUndo={swipes.length > 0}
        onYes={() => handleButton(true)}
      />
    </div>
  );
}
