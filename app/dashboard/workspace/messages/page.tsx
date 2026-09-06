import { getDashboardUser } from "@/lib/dashboard-helpers";
import {
  getMemberConversations,
  getMessagesFor,
} from "@/lib/hrd/services";
import ChatApp from "@/components/hrd/chat-app";
import PageHeader from "@/components/hrd/page-header";

export default async function EmployeeMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conv?: string }>;
}) {
  const { conv } = await searchParams;
  const dashUser = await getDashboardUser();

  const conversations = getMemberConversations(dashUser.id);
  const active = conversations.find((c) => c.id === conv) ?? conversations[0] ?? null;
  const messages = active ? getMessagesFor(active.id) : [];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Messages" subtitle="Chat with your HRD and teammates." />
      <ChatApp
        conversations={conversations}
        active={active}
        messages={messages}
        currentUserId={dashUser.id}
      />
    </div>
  );
}