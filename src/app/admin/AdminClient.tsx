"use client";

import { useState } from "react";
import type { RestaurantRow } from "@/lib/supabase/types";
import { RestaurantForm } from "./RestaurantForm";
import { RestaurantRowItem } from "./RestaurantRow";
import { Plus, LayoutGrid, Search } from "lucide-react";

type Restaurant = RestaurantRow;

interface Props {
  restaurants: Restaurant[];
}

export function AdminClient({ restaurants: initial }: Props) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = restaurants.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine_category.includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "active" && r.is_active) ||
      (filter === "inactive" && !r.is_active);
    return matchSearch && matchFilter;
  });

  function handleSaved(restaurant: Restaurant) {
    setRestaurants((prev) => {
      const idx = prev.findIndex((r) => r.id === restaurant.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = restaurant;
        return next;
      }
      return [restaurant, ...prev];
    });
    setShowForm(false);
    setEditing(null);
  }

  function handleDeleted(id: string) {
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  }

  function openEdit(r: Restaurant) {
    setEditing(r);
    setShowForm(true);
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-brand text-white px-4 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-black text-2xl tracking-tight">WTE Admin</h1>
            <p className="text-white/70 text-sm">{restaurants.length} restaurants</p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-white text-brand font-semibold px-4 py-2 rounded-xl text-sm"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Search + filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search restaurants…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <LayoutGrid size={40} className="mx-auto mb-3 opacity-30" />
            <p>No restaurants found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((r) => (
              <RestaurantRowItem
                key={r.id}
                restaurant={r}
                onEdit={() => openEdit(r)}
                onDeleted={() => handleDeleted(r.id)}
                onToggle={(updated) => handleSaved(updated)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-text">
                {editing ? "Edit Restaurant" : "Add Restaurant"}
              </h2>
              <button
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="text-text-muted hover:text-text"
              >
                ✕
              </button>
            </div>
            <RestaurantForm
              initial={editing ?? undefined}
              onSaved={handleSaved}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
