import { ChatExploreLayout } from "@/components/chat/chat-explore-layout";

export const metadata = {
  title: "Hey Auryn",
  description: "Your AI wellness companion for recovery and daily habits.",
};

/** Home — anonymous preview or authenticated chat (ChatGPT-style entry). */
export default function HomePage() {
  return <ChatExploreLayout />;
}
