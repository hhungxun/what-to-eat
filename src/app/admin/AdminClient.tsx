"use client";

import { useState } from "react";
import type { RestaurantRow } from "@/lib/supabase/types";
import { RestaurantForm } from "./RestaurantForm";
import { RestaurantRowItem } from "./RestaurantRow";
import { Plus, LayoutGrid, Search, Trash2, Loader2 } from "lucide-react";

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
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

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
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function openEdit(r: Restaurant) {
    setEditing(r);
    setShowForm(true);
  }

  function toggleSelection(id: string, selected: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function selectAllFiltered() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filtered.forEach((r) => next.add(r.id));
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} selected restaurant${ids.length === 1 ? "" : "s"}? This cannot be undone.`)) return;

    setBulkDeleting(true);
    const results = await Promise.all(
      ids.map(async (id) => {
        const res = await fetch(`/api/admin/restaurants/${id}`, { method: "DELETE" });
        return { id, ok: res.ok };
      })
    );
    const deletedIds = new Set(results.filter((result) => result.ok).map((result) => result.id));

    setRestaurants((prev) => prev.filter((r) => !deletedIds.has(r.id)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      deletedIds.forEach((id) => next.delete(id));
      return next;
    });
    setBulkDeleting(false);

    const failed = results.length - deletedIds.size;
    if (failed > 0) alert(`${failed} restaurant${failed === 1 ? "" : "s"} could not be deleted.`);
  }

  const selectedCount = selectedIds.size;
  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id));

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

        <div className="flex items-center justify-between gap-2 bg-surface rounded-xl border border-border px-3 py-2">
          <div>
            <p className="text-sm font-semibold text-text">
              {selectedCount > 0 ? `${selectedCount} selected` : "Bulk select"}
            </p>
            <p className="text-xs text-text-muted">
              {selecting ? "Choose restaurants to delete" : "Select multiple restaurants"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selecting && (
              <>
                <button
                  type="button"
                  onClick={allFilteredSelected ? clearSelection : selectAllFiltered}
                  disabled={bulkDeleting || filtered.length === 0}
                  className="px-3 py-2 rounded-lg border border-border text-text-muted text-sm font-semibold disabled:opacity-50"
                >
                  {allFilteredSelected ? "Clear" : "Select all"}
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting || selectedCount === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {bulkDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  Delete
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setSelecting((prev) => !prev);
                if (selecting) clearSelection();
              }}
              disabled={bulkDeleting}
              className="px-3 py-2 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-50"
            >
              {selecting ? "Done" : "Select"}
            </button>
          </div>
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
                selectable={selecting}
                selected={selectedIds.has(r.id)}
                onSelect={(selected) => toggleSelection(r.id, selected)}
                disabled={bulkDeleting}
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
