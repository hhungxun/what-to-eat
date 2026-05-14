"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef } from "react";
import type { RestaurantRow } from "@/lib/supabase/types";
import { MapPin } from "lucide-react";

type Restaurant = RestaurantRow;

const SWIPE_THRESHOLD = 80; // px to count as a swipe
const ROTATION_FACTOR = 0.08;

const PRICE_LABELS: Record<number, string> = { 1: "Budget", 2: "Mid", 3: "Pricey" };
const PRICE_DOTS = (range: number) =>
  Array.from({ length: 3 }, (_, i) => (
    <span key={i} className={i < range ? "text-brand" : "text-border"}>•</span>
  ));

interface SwipeCardProps {
  restaurant: Restaurant;
  onSwipe: (decision: boolean, timeToDecide: number) => void;
  isTop: boolean;
  stackIndex: number; // 0 = top card
}

export function SwipeCard({ restaurant, onSwipe, isTop, stackIndex }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const yesOpacity = useTransform(x, [20, 80], [0, 1]);
  const noOpacity = useTransform(x, [-80, -20], [1, 0]);
  const startTimeRef = useRef<number>(Date.now());

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (!isTop) return;
    const elapsed = Date.now() - startTimeRef.current;

    if (info.offset.x > SWIPE_THRESHOLD) {
      animate(x, 600, { duration: 0.25 }).then(() => onSwipe(true, elapsed));
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      animate(x, -600, { duration: 0.25 }).then(() => onSwipe(false, elapsed));
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
    }
  }

  // Stack visual offset
  const stackY = stackIndex * 6;
  const stackScale = 1 - stackIndex * 0.04;

  if (stackIndex > 2) return null;

  return (
    <motion.div
      className="absolute inset-0 touch-none select-none"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        y: stackY,
        scale: stackScale,
        zIndex: 10 - stackIndex,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
    >
      <div className="relative h-full rounded-[var(--radius-card)] overflow-hidden bg-surface shadow-xl">
        {/* Food image */}
        <div className="relative h-[55%] bg-brand-light/20">
          {restaurant.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl">
              {cuisineEmoji(restaurant.cuisine_category)}
            </div>
          )}

          {/* YES / NO overlays */}
          {isTop && (
            <>
              <motion.div
                className="absolute top-6 left-6 border-4 border-green-500 text-green-500 font-black text-2xl px-3 py-1 rounded-lg rotate-[-12deg]"
                style={{ opacity: yesOpacity }}
              >
                YUM!
              </motion.div>
              <motion.div
                className="absolute top-6 right-6 border-4 border-red-500 text-red-500 font-black text-2xl px-3 py-1 rounded-lg rotate-[12deg]"
                style={{ opacity: noOpacity }}
              >
                NOPE
              </motion.div>
            </>
          )}
        </div>

        {/* Card info */}
        <div className="p-4 flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-bold text-text leading-tight">{restaurant.name}</h2>
            <div className="flex items-center gap-0.5 text-lg shrink-0 mt-0.5">
              {PRICE_DOTS(restaurant.price_range)}
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-text-muted">
            <span className="capitalize">{restaurant.cuisine_category.replace("_", " ")}</span>
            {restaurant.is_on_campus ? (
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                {restaurant.location_label ?? "On campus"}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                {restaurant.distance_km
                  ? `${restaurant.distance_km} km away`
                  : restaurant.location_label ?? "Off campus"}
              </span>
            )}
          </div>

          {restaurant.description && (
            <p className="text-sm text-text-muted mt-1 line-clamp-2">{restaurant.description}</p>
          )}

          {restaurant.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {restaurant.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function cuisineEmoji(cuisine: string): string {
  const map: Record<string, string> = {
    chinese: "🍜",
    malay: "🍛",
    indian: "🫓",
    western: "🍔",
    japanese: "🍱",
    korean: "🥘",
    thai: "🌶️",
    fast_food: "🍟",
    cafe: "☕",
    other: "🍽️",
  };
  return map[cuisine] ?? "🍽️";
}
