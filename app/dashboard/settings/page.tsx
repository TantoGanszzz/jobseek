import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SettingsClient from "@/components/dashboard-settings";

export const metadata: Metadata = {
  title: "Settings — Jobseek",
  description: "Manage your account settings.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <SettingsClient
      email={user?.email || ""}
      createdAt={user?.created_at || ""}
    />
  );
}