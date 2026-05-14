const BASE_YES = 0.6;
const ENTHUSIASM_WEIGHT = 0.4;
const MAX_TIME_MS = 30_000;

export type SwipeRecord = {
  restaurantId: string;
  cuisineCategory: string;
  decision: boolean;
  timeToDecide: number; // raw ms, will be capped
};

export type ScoredSwipe = SwipeRecord & {
  sessionScore: number;     // 0.0–1.0
  timeEnthusiasm: number | null;
};

/**
 * Scores all swipes in a session.
 * YES score = BASE_YES + ENTHUSIASM_WEIGHT × time_enthusiasm
 * time_enthusiasm = z-score of time_to_decide among YES swipes,
 *   clamped ±2 then rescaled to [0,1]. Fast swipe → high enthusiasm.
 */
export function scoreSession(swipes: SwipeRecord[]): ScoredSwipe[] {
  const yesSwipes = swipes.filter((s) => s.decision);

  // Compute mean and sd of YES swipe times
  let mean = 0;
  let sd = 0;

  if (yesSwipes.length === 1) {
    mean = Math.min(yesSwipes[0].timeToDecide, MAX_TIME_MS);
    sd = 0;
  } else if (yesSwipes.length > 1) {
    const times = yesSwipes.map((s) => Math.min(s.timeToDecide, MAX_TIME_MS));
    mean = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((a, b) => a + (b - mean) ** 2, 0) / times.length;
    sd = Math.sqrt(variance);
  }

  return swipes.map((s) => {
    const cappedTime = Math.min(s.timeToDecide, MAX_TIME_MS);

    if (!s.decision) {
      return { ...s, timeToDecide: cappedTime, sessionScore: 0, timeEnthusiasm: null };
    }

    let timeEnthusiasm: number;

    if (yesSwipes.length === 1 || sd === 0) {
      timeEnthusiasm = 0.5; // single YES → neutral enthusiasm
    } else {
      const z = (cappedTime - mean) / sd;
      const zClamped = Math.max(-2, Math.min(2, z));
      // Fast (low time) → high z when inverted → rescale: enthusiasm = (2 - z) / 4
      timeEnthusiasm = (2 - zClamped) / 4;
    }

    const sessionScore = BASE_YES + ENTHUSIASM_WEIGHT * timeEnthusiasm;

    return { ...s, timeToDecide: cappedTime, sessionScore, timeEnthusiasm };
  });
}

/** Aggregate per-category for the results screen */
export function rankCategories(scored: ScoredSwipe[]) {
  const map = new Map<string, { yes: number; total: number; scoreSum: number }>();

  for (const s of scored) {
    const cur = map.get(s.cuisineCategory) ?? { yes: 0, total: 0, scoreSum: 0 };
    cur.total++;
    if (s.decision) {
      cur.yes++;
      cur.scoreSum += s.sessionScore;
    }
    map.set(s.cuisineCategory, cur);
  }

  return Array.from(map.entries())
    .map(([category, { yes, total, scoreSum }]) => {
      const yesRate = yes / total;
      const avgScore = yes > 0 ? scoreSum / yes : 0;
      const rankScore = yesRate * 0.5 + avgScore * 0.5;
      return { category, yes, total, rankScore };
    })
    .sort((a, b) => b.rankScore - a.rankScore);
}

/** Aggregate per-restaurant for results screen */
export function rankRestaurants(scored: ScoredSwipe[]) {
  const map = new Map<string, { score: number; yes: boolean }>();
  for (const s of scored) {
    if (s.decision) map.set(s.restaurantId, { score: s.sessionScore, yes: true });
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1].score - a[1].score)
    .map(([id, { score }]) => ({ id, score }));
}
