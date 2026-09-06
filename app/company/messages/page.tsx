import { getDashboardUser } from "@/lib/dashboard-helpers";
import { createClient } from "@/lib/supabase/server";
import ChatApp from "@/components/hrd/chat-app";
import PageHeader from "@/components/hrd/page-header";

export default async function CompanyMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conv?: string }>;
}) {
  const { conv } = await searchParams;
  const dashUser = await getDashboardUser();
  const supabase = await createClient();

  // Get company
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("created_by", dashUser.id)
    .maybeSingle();

  // Get conversations for this company
  const { data: conversationsData } = company
    ? await supabase
        .from("conversations")
        .select("*")
        .eq("company_id", company.id)
        .order("updated_at", { ascending: false })
    : { data: [] };

  const conversations = (conversationsData || []).map((c: any) => ({
    id: c.id,
    name: c.name || "General",
    channel: c.type === "channel",
    memberId: c.member_id,
    updatedAt: c.updated_at,
  }));

  const active =
    conversations.find((c: any) => c.id === conv) ?? conversations[0] ?? null;

  // Get messages for active conversation
  let messages: any[] = [];
  if (active) {
    const { data: messagesData } = await supabase
      .from("messages")
      .select("*, profiles:sender_id(full_name)")
      .eq("conversation_id", active.id)
      .order("created_at", { ascending: true });

    messages = (messagesData || []).map((m: any) => ({
      id: m.id,
      senderId: m.sender_id,
      senderName: m.profiles?.full_name || "User",
      text: m.text,
      createdAt: m.created_at,
    }));
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Messages" subtitle="Chat with your team and candidates." />
      <ChatApp
        conversations={conversations}
        active={active}
        messages={messages}
        currentUserId={dashUser.id}
      />
    </div>
  );
}