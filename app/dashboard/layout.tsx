import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard-sidebar";
import MobileSidebar from "@/components/mobile-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth guard — redirect if not logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile for sidebar
  let profile = null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single();
    profile = data;
  } catch {
    // Profile table might not exist yet
  }

  const sidebarUser = {
    id: user.id,
    email: user.email || "",
    full_name: profile?.full_name || user.user_metadata?.full_name || null,
    avatar_url: profile?.avatar_url || null,
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Desktop Sidebar */}
      <DashboardSidebar user={sidebarUser} />

      {/* Mobile Sidebar Toggle (fixed position) */}
      <div className="md:hidden fixed bottom-5 right-5 z-40">
        <MobileSidebar user={sidebarUser} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-light-bg">
        {children}
      </main>
    </div>
  );
}
