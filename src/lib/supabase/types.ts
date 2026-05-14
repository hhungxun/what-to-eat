export type CuisineCategory =
  | "chinese"
  | "malay"
  | "indian"
  | "western"
  | "japanese"
  | "korean"
  | "thai"
  | "fast_food"
  | "cafe"
  | "other";

// ── Flat row types ───────────────────────────────────────────────────────────

export type RestaurantRow = {
  id: string;
  name: string;
  cuisine_category: CuisineCategory;
  description: string | null;
  location_label: string | null;
  distance_km: number | null;
  is_on_campus: boolean;
  image_url: string | null;
  price_range: 1 | 2 | 3;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type RestaurantInsert = Omit<RestaurantRow, "id" | "created_at" | "updated_at">;
export type RestaurantUpdate = Partial<RestaurantInsert>;

export type SessionRow = {
  id: string;
  user_id: string | null;
  started_at: string;
  ended_at: string | null;
  total_shown: number;
  total_yes: number;
  top_cuisine: CuisineCategory | null;
  top_restaurant_id: string | null;
  t_yes_avg: number | null;
  t_yes_sd: number | null;
};

export type SessionInsert = {
  user_id?: string | null;
  ended_at?: string | null;
  total_shown: number;
  total_yes: number;
  top_cuisine?: CuisineCategory | null;
  top_restaurant_id?: string | null;
  t_yes_avg?: number | null;
  t_yes_sd?: number | null;
};
export type SessionUpdate = Partial<SessionInsert>;

export type SwipeEventRow = {
  id: string;
  session_id: string;
  user_id: string | null;
  restaurant_id: string;
  cuisine_category: CuisineCategory;
  decision: boolean;
  time_to_decide: number;
  swipe_order: number;
  session_score: number;
  time_enthusiasm: number | null;
  swiped_at: string;
};

export type SwipeEventInsert = Omit<SwipeEventRow, "id" | "swiped_at">;
export type SwipeEventUpdate = Partial<SwipeEventInsert>;

// ── Database type for Supabase client ────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: RestaurantRow;
        Insert: RestaurantInsert;
        Update: RestaurantUpdate;
        Relationships: [];
      };
      sessions: {
        Row: SessionRow;
        Insert: SessionInsert;
        Update: SessionUpdate;
        Relationships: [];
      };
      swipe_events: {
        Row: SwipeEventRow;
        Insert: SwipeEventInsert;
        Update: SwipeEventUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      cuisine_category: CuisineCategory;
    };
    CompositeTypes: Record<string, never>;
  };
};
