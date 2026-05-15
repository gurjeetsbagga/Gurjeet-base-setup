import { ChatView } from "@/components/chat/chat-view";

export const metadata = {
  title: "Conversation",
};

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChatView conversationId={id} />;
}
