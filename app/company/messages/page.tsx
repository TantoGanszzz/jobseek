import { getDashboardUser } from "@/lib/dashboard-helpers";
import {
  getConversations,
  getMessagesFor,
} from "@/lib/hrd/services";
import { getOrCreateGeneralConversation } from "@/lib/hrd/store";
import ChatApp from "@/components/hrd/chat-app";
import PageHeader from "@/components/hrd/page-header";

export default async function CompanyMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conv?: string }>;
}) {
  const { conv } = await searchParams;
  const dashUser = await getDashboardUser();

  getOrCreateGeneralConversation(dashUser.id);
  const conversations = getConversations(dashUser.id);
  const active =
    conversations.find((c) => c.id === conv) ?? conversations[0] ?? null;
  const messages = active ? getMessagesFor(active.id) : [];

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