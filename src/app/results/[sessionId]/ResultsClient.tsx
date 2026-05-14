"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Share2, RotateCcw, Trophy, ChefHat } from "lucide-react";
import type { SessionRow, RestaurantRow, SwipeEventRow } from "@/lib/supabase/types";
import { CUISINE_LABELS } from "@/app/admin/RestaurantForm";

type Session = SessionRow;
type Restaurant = RestaurantRow;
type SwipeEvent = SwipeEventRow & {
  restaurants: Restaurant | null;
};

interface Props {
  session: Session;
  swipeEvents: SwipeEvent[];
  topRestaurant: Restaurant | null;
}

const CUISINE_EMOJI: Record<string, string> = {
  chinese: "🍜", malay: "🍛", indian: "🫓", indonesian: "🍲",
  vietnamese: "🍜", western: "🍔", italian: "🍝", mexican: "🌮",
  japanese: "🍱", korean: "🥘", thai: "🌶️", fast_food: "🍟",
  cafe: "☕", dessert: "🍨", other: "🍽️",
};

const FOOD_PERSONALITY: Record<string, { label: string; desc: string }> = {
  chinese:    { label: "Noodle Addict",      desc: "Comfort food is your love language." },
  malay:      { label: "Kampung Soul",        desc: "Rich flavours, no apologies." },
  indian:     { label: "Spice Chaser",        desc: "The hotter, the better." },
  indonesian: { label: "Nasi Lover",          desc: "You believe every meal should come with rice." },
  vietnamese: { label: "Pho Real",            desc: "Light, fresh, and completely addictive." },
  western:    { label: "Brunch Energy",       desc: "You know what you want and you want it fast." },
  italian:    { label: "Pasta Purist",        desc: "Simple ingredients, big feelings." },
  mexican:    { label: "Taco Tuesday Every Day", desc: "Life's too short for bland food." },
  japanese:   { label: "Precision Eater",     desc: "Aesthetic presentation matters." },
  korean:     { label: "K-Food Stan",         desc: "You'd eat tteokbokki every day if you could." },
  thai:       { label: "Street Food Lover",   desc: "Bold, punchy, and a little chaotic." },
  fast_food:  { label: "Speed Runner",        desc: "Time is precious. Food should be instant." },
  cafe:       { label: "Café Hopper",         desc: "Every meal is a vibe." },
  dessert:    { label: "Sweet Tooth",         desc: "Dessert isn't the ending — it's the point." },
  other:      { label: "Wild Card",           desc: "You keep everyone guessing." },
};

export function ResultsClient({ session, swipeEvents, topRestaurant }: Props) {
  const router = useRouter();

  const yesEvents = swipeEvents.filter((e) => e.decision);
  const noEvents = swipeEvents.filter((e) => !e.decision);
  const topCuisine = session.top_cuisine ?? "other";
  const personality = FOOD_PERSONALITY[topCuisine] ?? FOOD_PERSONALITY.other;

  // Ranked yes restaurants
  const rankedYes = [...yesEvents].sort((a, b) => b.session_score - a.session_score);

  async function handleShare() {
    const text = `I just used What To Eat and my #1 pick is ${topRestaurant?.name ?? "something delicious"} 🔥 — ${personality.label}`;
    if (navigator.share) {
      await navigator.share({ title: "What To Eat", text });
    } else {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-brand text-white px-6 pt-12 pb-8"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <p className="text-white/70 text-sm font-medium mb-1">You are a…</p>
        <h1 className="text-4xl font-black tracking-tight mb-1">{personality.label}</h1>
        <p className="text-white/80 text-sm mb-6">{personality.desc}</p>

        {topRestaurant && (
          <div className="bg-white/15 rounded-2xl p-4">
            <p className="text-white/70 text-xs font-medium mb-1 flex items-center gap-1">
              <Trophy size={12} /> Your #1 pick
            </p>
            <p className="font-bold text-lg">{topRestaurant.name}</p>
            <p className="text-white/70 text-sm">
              {CUISINE_LABELS[topRestaurant.cuisine_category] ?? topRestaurant.cuisine_category} ·{" "}
              {topRestaurant.is_on_campus
                ? topRestaurant.location_label ?? "On campus"
                : `${topRestaurant.distance_km ?? ""}km away`}
            </p>
          </div>
        )}

        <div className="mt-4 flex gap-3 text-sm">
          <span className="bg-white/20 rounded-full px-3 py-1">
            {session.total_yes}/{session.total_shown} liked
          </span>
          <span className="bg-white/20 rounded-full px-3 py-1 flex items-center gap-1">
            {CUISINE_EMOJI[topCuisine]} {CUISINE_LABELS[topCuisine as keyof typeof CUISINE_LABELS] ?? topCuisine}
          </span>
        </div>
      </motion.div>

      {/* Ranked list */}
      {rankedYes.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4 mt-6"
        >
          <h2 className="font-bold text-text mb-3 flex items-center gap-2">
            <ChefHat size={18} className="text-brand" /> Your picks, ranked
          </h2>
          <div className="flex flex-col gap-2">
            {rankedYes.map((event, i) => (
              <div
                key={event.id}
                className="flex items-center gap-3 bg-surface rounded-xl p-3 shadow-sm"
              >
                <span className="text-xl font-black text-text-muted w-6 text-center">
                  {i + 1}
                </span>
                <span className="text-2xl">
                  {CUISINE_EMOJI[event.cuisine_category]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text text-sm truncate">
                    {event.restaurants?.name ?? "Unknown"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {CUISINE_LABELS[event.cuisine_category as keyof typeof CUISINE_LABELS] ?? event.cuisine_category}
                  </p>
                </div>
                <div className="w-10 h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full"
                    style={{ width: `${event.session_score * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* No swipes */}
      {noEvents.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="px-4 mt-6"
        >
          <h2 className="font-bold text-text mb-3 text-sm text-text-muted">
            Not today ({noEvents.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {noEvents.map((event) => (
              <span
                key={event.id}
                className="px-3 py-1 rounded-full bg-border text-text-muted text-sm"
              >
                {event.restaurants?.name ?? "Unknown"}
              </span>
            ))}
          </div>
        </motion.section>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-bg/90 backdrop-blur-sm border-t border-border flex gap-3"
      >
        <button
          onClick={() => router.push("/swipe")}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-brand text-brand font-semibold"
        >
          <RotateCcw size={18} /> Try Again
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand text-white font-semibold"
        >
          <Share2 size={18} /> Share
        </button>
      </motion.div>
    </div>
  );
}
