import { ChatExploreLayout } from "@/components/chat/chat-explore-layout";

export const metadata = {
  title: "Conversation",
};

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChatExploreLayout conversationId={id} />;
}
