export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { AdminClient } from "./AdminClient";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("*")
    .order("name");

  return <AdminClient restaurants={restaurants ?? []} />;
}
