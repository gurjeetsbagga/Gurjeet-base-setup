import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

const suggestions = [
  "How can I ease soreness after walking?",
  "I'd like to reflect on my energy today",
  "What gentle recovery habits might help me?",
];

export function ChatEmptyState({ onSuggestion }: { onSuggestion: (text: string) => void }) {
  return (
    <div className="flex flex-col gap-6 px-4 py-8">
      <EmptyState
        title="A calm space to talk"
        description="Share what's on your mind. Auryn listens with care and offers thoughtful wellness support."
      />
      <div className="mx-auto flex w-full max-w-lg flex-col gap-2">
        <p className="text-label text-muted-foreground">Try asking</p>
        <ul className="flex flex-col gap-2">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => onSuggestion(s)}
                className="w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-primary/30 hover:bg-primary-muted/50"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-caption text-muted-foreground">
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>{" "}
          for personalized memory and history
        </p>
      </div>
    </div>
  );
}
