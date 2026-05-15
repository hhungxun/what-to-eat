"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { RestaurantRow, RestaurantInsert, CuisineCategory } from "@/lib/supabase/types";

type Restaurant = RestaurantRow;
type InsertRestaurant = RestaurantInsert;

export const CUISINE_LABELS: Record<CuisineCategory, string> = {
  chinese:    "Chinese",
  malay:      "Malay",
  indian:     "Indian",
  indonesian: "Indonesian",
  vietnamese: "Vietnamese",
  western:    "Western",
  italian:    "Italian",
  mexican:    "Mexican",
  japanese:   "Japanese",
  korean:     "Korean",
  thai:       "Thai",
  fast_food:  "Fast Food",
  cafe:       "Café",
  dessert:    "Dessert",
  other:      "Other",
};

const PRICE_TRACK_MAX = 150;

function priceRangeFromMinMax(min: number, max: number): 1 | 2 | 3 {
  if (max <= 15) return 1;
  if (max <= 35) return 2;
  return 3;
}

interface PriceSliderProps {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}

function PriceSlider({ min, max, onChange }: PriceSliderProps) {
  const leftPct = ((min - 1) / (PRICE_TRACK_MAX - 1)) * 100;
  const rightPct = ((PRICE_TRACK_MAX - max) / (PRICE_TRACK_MAX - 1)) * 100;

  function setMin(raw: number) {
    const v = Math.max(1, Math.min(raw, max - 1));
    onChange(v, max);
  }
  function setMax(raw: number) {
    const v = Math.min(PRICE_TRACK_MAX, Math.max(raw, min + 1));
    onChange(min, v);
  }

  const label = max >= PRICE_TRACK_MAX ? `RM ${min}+` : `RM ${min} – RM ${max}`;
  const tier = priceRangeFromMinMax(min, max);
  const tierLabel = tier === 1 ? "Budget" : tier === 2 ? "Mid-range" : "Pricey";

  return (
    <div className="space-y-3">
      {/* Track */}
      <div className="relative h-7 flex items-center">
        <div className="absolute w-full h-1.5 bg-border rounded-full">
          <div
            className="absolute h-full bg-brand rounded-full"
            style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
          />
        </div>
        <input
          type="range" min={1} max={PRICE_TRACK_MAX} value={min}
          onChange={(e) => setMin(+e.target.value)}
          className="price-thumb"
        />
        <input
          type="range" min={1} max={PRICE_TRACK_MAX} value={max}
          onChange={(e) => setMax(+e.target.value)}
          className="price-thumb"
        />
      </div>

      {/* Editable inputs */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-sm text-text-muted shrink-0">RM</span>
          <input
            type="number" min={1} max={max - 1} value={min}
            onChange={(e) => setMin(+e.target.value)}
            className="input text-sm text-center"
          />
        </div>
        <span className="text-text-muted text-sm shrink-0">–</span>
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-sm text-text-muted shrink-0">RM</span>
          <input
            type="number" min={min + 1} max={PRICE_TRACK_MAX} value={max}
            onChange={(e) => setMax(+e.target.value)}
            className="input text-sm text-center"
          />
        </div>
      </div>

      <p className="text-xs text-text-muted">{label} · {tierLabel}</p>
    </div>
  );
}

interface Props {
  initial?: Restaurant;
  onSaved: (r: Restaurant) => void;
  onCancel: () => void;
}

export function RestaurantForm({ initial, onSaved, onCancel }: Props) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);

  const [priceMin, setPriceMin] = useState(initial?.price_min ?? 1);
  const [priceMax, setPriceMax] = useState(initial?.price_max ?? 20);

  const [form, setForm] = useState<InsertRestaurant>({
    name: initial?.name ?? "",
    cuisine_category: initial?.cuisine_category ?? "other",
    description: initial?.description ?? "",
    location_label: initial?.location_label ?? "",
    distance_km: initial?.distance_km ?? null,
    is_on_campus: initial?.is_on_campus ?? true,
    image_url: initial?.image_url ?? "",
    price_range: initial?.price_range ?? 1,
    price_min: initial?.price_min ?? null,
    price_max: initial?.price_max ?? null,
    opens_at: initial?.opens_at ?? null,
    closes_at: initial?.closes_at ?? null,
    is_halal: initial?.is_halal ?? false,
    is_vegetarian: initial?.is_vegetarian ?? false,
    is_vegan: initial?.is_vegan ?? false,
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to upload image");
        return;
      }

      set("image_url", data.url);
      setShowImageUrlInput(false);
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
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
      price_min: priceMin,
      price_max: priceMax,
      price_range: priceRangeFromMinMax(priceMin, priceMax),
      opens_at: form.opens_at || null,
      closes_at: form.closes_at || null,
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
          {(Object.entries(CUISINE_LABELS) as [CuisineCategory, string][]).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </Field>

      {/* Price range */}
      <Field label="Price range *">
        <PriceSlider
          min={priceMin}
          max={priceMax}
          onChange={(mn, mx) => { setPriceMin(mn); setPriceMax(mx); }}
        />
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
          <div className="space-y-2">
            <input
              value={form.location_label ?? ""}
              onChange={(e) => set("location_label", e.target.value)}
              className="input"
              placeholder="Address / area"
            />
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="distance-km" className="text-xs text-text-muted">
                Distance from XMUM
              </label>
              <div className="relative shrink-0">
                <input
                  id="distance-km"
                  type="text"
                  inputMode="decimal"
                  value={form.distance_km ?? ""}
                  onChange={(e) => {
                    const [whole, ...rest] = e.target.value.replace(/[^\d.]/g, "").split(".");
                    const value = [whole, rest.join("")].filter((part, i) => i === 0 || part !== "").join(".");
                    set("distance_km", value === "" ? null : Number(value));
                  }}
                  className="distance-input"
                  placeholder="0.0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-muted pointer-events-none select-none">
                  km
                </span>
              </div>
            </div>
          </div>
        )}
      </Field>

      <Field label="Operating Hours">
        <div className="flex gap-2 items-center">
          <input
            type="time"
            value={form.opens_at ?? ""}
            onChange={(e) => set("opens_at", e.target.value || null)}
            className="input flex-1"
            placeholder="Opens"
          />
          <span className="text-text-muted text-sm shrink-0">to</span>
          <input
            type="time"
            value={form.closes_at ?? ""}
            onChange={(e) => set("closes_at", e.target.value || null)}
            className="input flex-1"
            placeholder="Closes"
          />
        </div>
        <p className="text-xs text-text-muted mt-1">Leave blank if open all day / unknown</p>
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

      <Field label="Image">
        <div className="space-y-2">
          {form.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.image_url}
              alt=""
              className="max-h-24 rounded-xl object-cover border border-border"
            />
          )}
          <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold cursor-pointer disabled:opacity-50">
            {uploadingImage && <Loader2 size={14} className="animate-spin" />}
            {uploadingImage ? "Uploading..." : "Upload image"}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={() => setShowImageUrlInput((prev) => !prev)}
            className="block text-xs text-brand font-semibold"
          >
            or paste URL
          </button>
          {showImageUrlInput && (
            <input
              type="url"
              value={form.image_url ?? ""}
              onChange={(e) => set("image_url", e.target.value)}
              className="input"
              placeholder="https://…"
            />
          )}
        </div>
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

      <Field label="Dietary">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => set("is_halal", !form.is_halal)}
            className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-colors ${
              form.is_halal ? "bg-green-500 text-white border-green-500" : "border-border text-text-muted"
            }`}
          >
            Halal
          </button>
          <button
            type="button"
            onClick={() => set("is_vegetarian", !form.is_vegetarian)}
            className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-colors ${
              form.is_vegetarian ? "bg-green-500 text-white border-green-500" : "border-border text-text-muted"
            }`}
          >
            Vegetarian
          </button>
          <button
            type="button"
            onClick={() => set("is_vegan", !form.is_vegan)}
            className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-colors ${
              form.is_vegan ? "bg-green-500 text-white border-green-500" : "border-border text-text-muted"
            }`}
          >
            Vegan
          </button>
        </div>
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
