"use client";

import { useState } from "react";
import type { RestaurantRow, RestaurantInsert, CuisineCategory } from "@/lib/supabase/types";

type Restaurant = RestaurantRow;
type InsertRestaurant = RestaurantInsert;

const CUISINES: CuisineCategory[] = [
  "chinese", "malay", "indian", "western", "japanese",
  "korean", "thai", "fast_food", "cafe", "other",
];

interface Props {
  initial?: Restaurant;
  onSaved: (r: Restaurant) => void;
  onCancel: () => void;
}

export function RestaurantForm({ initial, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<InsertRestaurant>({
    name: initial?.name ?? "",
    cuisine_category: initial?.cuisine_category ?? "other",
    description: initial?.description ?? "",
    location_label: initial?.location_label ?? "",
    distance_km: initial?.distance_km ?? null,
    is_on_campus: initial?.is_on_campus ?? true,
    image_url: initial?.image_url ?? "",
    price_range: initial?.price_range ?? 1,
    tags: initial?.tags ?? [],
    is_active: initial?.is_active ?? true,
  });

  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof InsertRestaurant>(key: K, value: InsertRestaurant[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      set("tags", [...form.tags, tag]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    set("tags", form.tags.filter((t) => t !== tag));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = initial ? `/api/admin/restaurants/${initial.id}` : "/api/admin/restaurants";
    const method = initial ? "PATCH" : "POST";

    const body = {
      ...form,
      image_url: form.image_url || null,
      description: form.description || null,
      location_label: form.location_label || null,
      distance_km: form.is_on_campus ? null : Number(form.distance_km) || null,
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const { error } = await res.json();
      setError(error ?? "Failed to save");
      setSaving(false);
      return;
    }

    const { restaurant } = await res.json();
    onSaved(restaurant);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
      {/* Name */}
      <Field label="Name *">
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="input"
          placeholder="e.g. Nasi Lemak Wanjo"
        />
      </Field>

      {/* Cuisine */}
      <Field label="Cuisine *">
        <select
          value={form.cuisine_category}
          onChange={(e) => set("cuisine_category", e.target.value as CuisineCategory)}
          className="input"
        >
          {CUISINES.map((c) => (
            <option key={c} value={c}>{c.replace("_", " ")}</option>
          ))}
        </select>
      </Field>

      {/* Price range */}
      <Field label="Price range *">
        <div className="flex gap-2">
          {([1, 2, 3] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set("price_range", p)}
              className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-colors ${
                form.price_range === p
                  ? "border-brand bg-brand text-white"
                  : "border-border text-text-muted"
              }`}
            >
              {p === 1 ? "$ Budget" : p === 2 ? "$$ Mid" : "$$$ Pricey"}
            </button>
          ))}
        </div>
      </Field>

      {/* Campus toggle */}
      <Field label="Location">
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => set("is_on_campus", true)}
            className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-colors ${
              form.is_on_campus ? "border-brand bg-brand text-white" : "border-border text-text-muted"
            }`}
          >
            On campus
          </button>
          <button
            type="button"
            onClick={() => set("is_on_campus", false)}
            className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-colors ${
              !form.is_on_campus ? "border-brand bg-brand text-white" : "border-border text-text-muted"
            }`}
          >
            Off campus
          </button>
        </div>
        {form.is_on_campus ? (
          <input
            value={form.location_label ?? ""}
            onChange={(e) => set("location_label", e.target.value)}
            className="input"
            placeholder="Block/stall code e.g. A-103, D6"
          />
        ) : (
          <div className="flex gap-2">
            <input
              value={form.location_label ?? ""}
              onChange={(e) => set("location_label", e.target.value)}
              className="input flex-1"
              placeholder="Address / area"
            />
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.distance_km ?? ""}
              onChange={(e) => set("distance_km", parseFloat(e.target.value) as any)}
              className="input w-24"
              placeholder="km"
            />
          </div>
        )}
      </Field>

      {/* Description */}
      <Field label="Description">
        <textarea
          value={form.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          className="input resize-none h-20"
          placeholder="Short description (shown on card)"
        />
      </Field>

      {/* Image URL */}
      <Field label="Image URL">
        <input
          type="url"
          value={form.image_url ?? ""}
          onChange={(e) => set("image_url", e.target.value)}
          className="input"
          placeholder="https://…"
        />
      </Field>

      {/* Tags */}
      <Field label="Tags">
        <div className="flex gap-2 mb-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            className="input flex-1"
            placeholder="e.g. halal, spicy, open late"
          />
          <button type="button" onClick={addTag} className="px-4 py-2 bg-brand/10 text-brand rounded-xl text-sm font-semibold">
            Add
          </button>
        </div>
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {form.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-brand/10 text-brand text-xs rounded-full">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        )}
      </Field>

      {/* Active toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text">Show in app</span>
        <button
          type="button"
          onClick={() => set("is_active", !form.is_active)}
          className={`w-12 h-6 rounded-full transition-colors ${form.is_active ? "bg-brand" : "bg-border"}`}
        >
          <span
            className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${form.is_active ? "translate-x-6" : "translate-x-0"}`}
          />
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl border border-border text-text-muted font-semibold">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-brand text-white font-semibold disabled:opacity-60">
          {saving ? "Saving…" : initial ? "Save Changes" : "Add Restaurant"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-text">{label}</label>
      {children}
    </div>
  );
}
