export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { isAdminSecret } from "@/lib/admin-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminClient } from "./AdminClient";

export default async function AdminPage() {
  const cookieStore = await cookies();
  if (!isAdminSecret(cookieStore.get("wte-admin")?.value)) {
    redirect("/admin/login");
  }

  const supabase = await createClient();

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("*")
    .order("name");

  return <AdminClient restaurants={restaurants ?? []} />;
}
