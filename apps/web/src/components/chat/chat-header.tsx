import { Text } from "@/components/ui/text";

export function ChatHeader({ title = "Conversation" }: { title?: string }) {
  return (
    <header className="shrink-0 border-b border-border-subtle bg-surface/90 px-4 py-4 backdrop-blur-sm md:px-6">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <div>
          <Text variant="h3" as="h1">
            {title}
          </Text>
          <p className="mt-0.5 text-caption text-muted-foreground">
            Wellness guidance · not medical advice
          </p>
        </div>
        <span className="hidden rounded-full bg-accent-soft px-3 py-1 text-caption font-medium text-primary sm:inline">
          Private & calm
        </span>
      </div>
    </header>
  );
}
