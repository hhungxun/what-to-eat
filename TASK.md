# WTE — Codex Implementation Task

This file describes pending features for the **What To Eat** app (Next.js + Supabase + Framer Motion swipe UI for XMUM students).

## Project conventions (read before touching any file)

- **Framework:** Next.js 16 App Router. The middleware file is `src/proxy.ts` and exports `async function proxy()` — not `middleware`. Never rename it.
- **Tailwind:** v4. Theme lives in `src/app/globals.css` inside `@theme inline {}`. There is no `tailwind.config.ts`.
- **Supabase:** `@supabase/supabase-js` 2.x + `@supabase/ssr`. Browser client: `src/lib/supabase/client.ts`. Server client (async): `src/lib/supabase/server.ts`. Types: `src/lib/supabase/types.ts`.
- **Auth:** Admin routes use a `wte-admin` cookie validated against `process.env.ADMIN_SECRETS` (comma-separated list). User auth is Supabase Auth.
- **No comments** unless the WHY is non-obvious. No docstrings.
- **No Co-Authored-By lines** in git commits.
- **No premature abstractions.** Don't create helpers unless used 3+ times.
- TypeScript strict. Run `npx tsc --noEmit` before committing — it must pass clean.
- Pages that use Supabase must have `export const dynamic = "force-dynamic"` at the top.

---

## Already done (do not redo)

- `supabase/add_hours_dietary.sql` — migration that adds `opens_at`, `closes_at`, `is_halal`, `is_vegetarian`, `is_vegan` to `restaurants`. **User still needs to run this in Supabase SQL Editor.**
- `supabase/test_restaurants.sql` — clears all data and inserts 10 test restaurants with hours + dietary flags. **User still needs to run this.**
- `src/lib/supabase/types.ts` — already updated with all new fields. `RestaurantRow` now includes: `opens_at: string | null`, `closes_at: string | null`, `is_halal: boolean`, `is_vegetarian: boolean`, `is_vegan: boolean`.
- `src/app/admin/RestaurantForm.tsx` — already has a dual-range RM price slider (replaced the 3-button layout). `price_min` and `price_max` are tracked as local state, `price_range` is derived.

---

## Tasks to implement

### 1 — Swipe feel: dynamic threshold + velocity gate
**File:** `src/components/swipe/SwipeCard.tsx`

Research finding: 80 px fixed threshold is too hair-trigger on phone. Use 25 % of screen width instead. Also accept a fast flick even if the drag distance is short (velocity gate).

Replace the `handleDragEnd` function:

```ts
// old
const SWIPE_THRESHOLD = 80;

function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
  if (!isTop) return;
  const elapsed = Date.now() - startTimeRef.current;
  if (info.offset.x > SWIPE_THRESHOLD) { ... }
  else if (info.offset.x < -SWIPE_THRESHOLD) { ... }
  else { ... }
}
```

New behaviour:
- `SWIPE_THRESHOLD` = `Math.round(window.innerWidth * 0.25)` computed once when the component mounts (use `useRef` initialised from `window.innerWidth * 0.25` inside the component body — safe because SwipeCard is `"use client"`).
- The `onDragEnd` info object from Framer Motion also exposes `info.velocity.x`. Accept the swipe if `Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > 250`.
- Keep exit animation duration at 0.25 s (do not change).
- Keep rotation factor at ±20 deg over ±200 px (do not change).
- The `dragElastic` prop can stay at 0.9.

---

### 2 — Undo swipe
**Files:** `src/components/swipe/SwipeDeck.tsx`, `src/components/swipe/SwipeButtons.tsx`

**SwipeDeck changes:**
- Add an `handleUndo` callback. When called:
  - If `swipes` is empty, do nothing.
  - Find the last-swiped restaurant: `const lastSwipe = swipes[swipes.length - 1]` → find it in the original `restaurants` prop by `id`.
  - `setSwipes(swipes.slice(0, -1))`
  - `setRemaining([lastRestaurant, ...remaining])`
  - Reset `cardStartTime.current = Date.now()`
- Pass `onUndo={handleUndo}` and `canUndo={swipes.length > 0}` down to `<SwipeButtons>`.

**SwipeButtons changes:**
- Add `onUndo: () => void` and `canUndo: boolean` props.
- Add a third button between the NO and YES buttons: a smaller (w-12 h-12) circular button with `Undo2` icon from `lucide-react`. Style: `bg-surface border-2 border-border text-text-muted`. Disable + reduce opacity when `!canUndo`.

---

### 3 — Pre-swipe dietary filter screen
**File:** `src/app/swipe/SwipeSession.tsx`

Replace the current direct render of `<SwipeDeck>` with a two-phase flow:

**Phase 1 — filter screen** (shown before any swiping):
- State: `started: boolean` (initially `false`), `filters: { halal: boolean; vegetarian: boolean; vegan: boolean }` (all initially `false`).
- Filter logic: `filteredRestaurants = restaurants.filter(r => (!filters.halal || r.is_halal) && (!filters.vegetarian || r.is_vegetarian) && (!filters.vegan || r.is_vegan))`
- UI: Full-screen centered layout matching the app's style. Show:
  - Heading: "Any preferences?"
  - Subtext: "We'll filter the deck for you."
  - Three toggle rows, one per filter (Halal, Vegetarian, Vegan). Each row has a label on the left and a toggle switch on the right. A toggle is `w-12 h-6 rounded-full` — orange (`bg-brand`) when active, grey (`bg-border`) when inactive, with a white circle that translates.
  - Below the toggles: `{filteredRestaurants.length} restaurants ready` in `text-text-muted text-sm`.
  - A "Start Swiping →" button (full-width, `bg-brand text-white`, disabled + opacity-50 when `filteredRestaurants.length === 0` with text "No matches — adjust filters").
- When button is clicked: `setStarted(true)`.

**Phase 2 — swiping** (after `started === true`):
- Render the existing `<SwipeDeck restaurants={filteredRestaurants} onComplete={handleComplete} />` layout unchanged.

---

### 4 — Operating hours on SwipeCard
**File:** `src/components/swipe/SwipeCard.tsx`

The `restaurant` object now has `opens_at: string | null` and `closes_at: string | null` (Postgres `time` type, comes back as e.g. `"08:00:00"`).

Add a helper inside the file (not exported):
```ts
function hoursLabel(opensAt: string | null, closesAt: string | null): string | null {
  if (!opensAt || !closesAt) return null;
  const fmt = (t: string) => {
    const [h, m] = t.split(':');
    return `${parseInt(h)}:${m}`;
  };
  return `${fmt(opensAt)} – ${fmt(closesAt)}`;
}
```

In the card info section, add a small hours line beneath the location/cuisine line (only if `hoursLabel` returns non-null). Style: `text-xs text-text-muted`. Use a `Clock` icon (size 11) from `lucide-react` beside it.

Also add dietary badges. If any of `is_halal`, `is_vegetarian`, `is_vegan` are true, show small pill badges in the tags row area (or just above tags):
- Halal → green-tinted pill: `bg-green-50 text-green-700 border border-green-200`
- Vegetarian → same green style, text "Veg"
- Vegan → same, text "Vegan"
- Each: `px-1.5 py-0.5 rounded-full text-xs font-medium`

---

### 5 — Results: remove "Not today", add speed insight
**File:** `src/app/results/[sessionId]/ResultsClient.tsx`

**Remove** the entire `{noEvents.length > 0 && <motion.section>...</motion.section>}` block (the "Not today" section with the pill list of rejected restaurants).

**Add** a speed insight below the hero card (before the ranked list). Only show if `yesEvents.length > 0`:

Find the YES event with the lowest `time_to_decide`:
```ts
const fastestYes = yesEvents.reduce((best, e) =>
  e.time_to_decide < best.time_to_decide ? e : best
);
```

Show a small card: `"⚡ You decided fastest on {fastestYes.restaurants?.name}"` with `time_to_decide` formatted as seconds (e.g. `1.4s`). Style it as a subtle `bg-surface rounded-xl px-4 py-3 mx-4 mt-4 shadow-sm` with `Zap` icon from lucide in `text-brand`.

---

### 6 — Admin: operating hours + dietary fields
**File:** `src/app/admin/RestaurantForm.tsx`

**Add to form state** (inside the existing `useState<InsertRestaurant>` initialiser):
```ts
opens_at: initial?.opens_at ?? null,
closes_at: initial?.closes_at ?? null,
is_halal: initial?.is_halal ?? false,
is_vegetarian: initial?.is_vegetarian ?? false,
is_vegan: initial?.is_vegan ?? false,
```

**Add a "Hours" field** (after the Location field, before Description):
Two `<input type="time">` side by side labelled "Opens" and "Closes". Both optional (no `required`). On submit, convert empty string `""` to `null`. Store as `"HH:MM"` strings.

```tsx
<Field label="Operating Hours">
  <div className="flex gap-2 items-center">
    <input type="time" value={form.opens_at ?? ""} onChange={...} className="input flex-1" placeholder="Opens" />
    <span className="text-text-muted text-sm shrink-0">to</span>
    <input type="time" value={form.closes_at ?? ""} onChange={...} className="input flex-1" placeholder="Closes" />
  </div>
  <p className="text-xs text-text-muted mt-1">Leave blank if open all day / unknown</p>
</Field>
```

**Add a "Dietary" field** (after Tags, before the "Show in app" toggle):
Three pill-style toggle buttons for Halal, Vegetarian, Vegan. Active state: `bg-green-500 text-white border-green-500`. Inactive: `border-border text-text-muted`. Each is `type="button"`, `flex-1`, `py-2 rounded-xl border-2 text-sm font-semibold`.

**In `handleSubmit`**, convert empty `opens_at`/`closes_at` strings to null:
```ts
opens_at: form.opens_at || null,
closes_at: form.closes_at || null,
```

---

### 7 — Admin: image upload via Supabase Storage
**New file:** `src/app/api/admin/upload-image/route.ts`

```ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isAdmin(req: Request) { /* same pattern as other admin routes */ }

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Create bucket if it doesn't exist yet
  await supabase.storage.createBucket("restaurant-images", { public: true }).catch(() => {});

  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from("restaurant-images")
    .upload(fileName, bytes, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage
    .from("restaurant-images")
    .getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrl });
}
```

**Update `src/app/admin/RestaurantForm.tsx` image section:**

Replace the plain URL `<input>` for image with a two-part UI:
1. If `form.image_url` is set, show a small `<img>` preview (max-h-24, rounded-xl, object-cover).
2. A `<label>` styled as a button ("Upload image") wrapping a hidden `<input type="file" accept="image/*">`. On change, POST the file to `/api/admin/upload-image` via `FormData`, get back `{ url }`, and call `set("image_url", url)`. Show a `Loader2` spinner (from lucide) while uploading.
3. A small "or paste URL" text link that reveals the existing URL input. This is the fallback.

Add `uploadingImage: boolean` to local state.

---

### 8 — Session history page for logged-in users
**New file:** `src/app/history/page.tsx`

```ts
export const dynamic = "force-dynamic";
```

Server component. Fetch the current user via `createClient()` from `src/lib/supabase/server.ts`. If not logged in, redirect to `/auth`. Query:

```ts
const { data: sessions } = await supabase
  .from("sessions")
  .select("*, restaurants!top_restaurant_id(*)")
  .eq("user_id", user.id)
  .order("started_at", { ascending: false })
  .limit(20);
```

Render a simple list page:
- Back arrow + "Your History" heading
- For each session: card showing date (`started_at` formatted), top restaurant name (or "No match"), `total_yes`/`total_shown` liked count, `top_cuisine` with emoji. Tapping a card links to `/results/{session.id}`.
- If no sessions: empty state "You haven't swiped yet — [Start now]".

**Update `src/app/page.tsx`** — for logged-in users, show a "View history" link. Add a Supabase server check: if `user` exists show a small "📋 Your history" link beneath "Start Swiping".

---

## SQL to run in Supabase SQL Editor (in order)

1. `supabase/migrate_cuisine_types.sql` (if not already run)
2. `supabase/add_price_min_max.sql` (if not already run)
3. `supabase/add_hours_dietary.sql` ← new
4. `supabase/test_restaurants.sql` ← clears data + inserts 10 test restaurants

---

## Key file map

```
src/
  app/
    page.tsx                          — home page (add history link for logged-in users)
    globals.css                       — Tailwind v4 theme + .input class + .price-thumb range CSS
    layout.tsx
    swipe/
      page.tsx                        — server component, loads restaurants, no filter logic here
      SwipeSession.tsx                — CLIENT: manages filter screen + deck phase
    results/[sessionId]/
      page.tsx                        — server component
      ResultsClient.tsx               — CLIENT: results UI (remove "not today", add speed insight)
    history/
      page.tsx                        — NEW: server component, session history for logged-in users
    admin/
      RestaurantForm.tsx              — CLIENT: add hours/dietary/image upload
      AdminClient.tsx
      RestaurantRow.tsx
    api/
      admin/
        restaurants/route.ts          — pass-through to Supabase, no changes needed
        restaurants/[id]/route.ts     — pass-through to Supabase, no changes needed
        upload-image/route.ts         — NEW: multipart upload to Supabase Storage
        resolve-maps/route.ts
        auth/route.ts
      sessions/route.ts
  components/
    swipe/
      SwipeCard.tsx                   — dynamic threshold + velocity gate + hours + dietary badges
      SwipeDeck.tsx                   — add undo state + handleUndo callback
      SwipeButtons.tsx                — add undo button (Undo2 icon, smaller, between NO/YES)
  lib/
    supabase/
      types.ts                        — ALREADY UPDATED (do not change)
      client.ts
      server.ts
    scoring.ts
  proxy.ts                            — middleware (do not touch)
```

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          ← needed for admin API routes and image upload
ADMIN_SECRETS                      ← comma-separated list of valid admin passwords
```
