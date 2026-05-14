"use client";

import { useState } from "react";
import { Pencil, Trash2, MapPin } from "lucide-react";
import type { RestaurantRow } from "@/lib/supabase/types";

type Restaurant = RestaurantRow;

const CUISINE_EMOJI: Record<string, string> = {
  chinese: "🍜", malay: "🍛", indian: "🫓", western: "🍔",
  japanese: "🍱", korean: "🥘", thai: "🌶️", fast_food: "🍟", cafe: "☕", other: "🍽️",
};

interface Props {
  restaurant: Restaurant;
  onEdit: () => void;
  onDeleted: () => void;
  onToggle: (updated: Restaurant) => void;
}

export function RestaurantRowItem({ restaurant: r, onEdit, onDeleted, onToggle }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${r.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/admin/restaurants/${r.id}`, { method: "DELETE" });
    onDeleted();
  }

  async function handleToggle() {
    setToggling(true);
    const res = await fetch(`/api/admin/restaurants/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !r.is_active }),
    });
    if (res.ok) {
      const { restaurant } = await res.json();
      onToggle(restaurant);
    }
    setToggling(false);
  }

  return (
    <div className={`bg-surface rounded-xl p-3 shadow-sm border ${r.is_active ? "border-transparent" : "border-border opacity-60"}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{CUISINE_EMOJI[r.cuisine_category]}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text text-sm truncate">{r.name}</p>
          <p className="text-xs text-text-muted flex items-center gap-1">
            <span className="capitalize">{r.cuisine_category.replace("_", " ")}</span>
            <span>·</span>
            <MapPin size={11} />
            {r.is_on_campus
              ? (r.location_label ?? "On campus")
              : `${r.distance_km ?? "?"}km`}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {/* Active toggle */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            title={r.is_active ? "Deactivate" : "Activate"}
            className={`w-9 h-5 rounded-full transition-colors ${r.is_active ? "bg-brand" : "bg-border"}`}
          >
            <span
              className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${r.is_active ? "translate-x-4" : "translate-x-0"}`}
            />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-text-muted hover:text-brand rounded-lg"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-text-muted hover:text-red-500 rounded-lg"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
