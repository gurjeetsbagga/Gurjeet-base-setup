import { Text } from "@/components/ui/text";

export function BrandPanel() {
  return (
    <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(255_255_255/0.12),transparent_50%)]"
        aria-hidden
      />
      <div className="relative">
        <p className="text-sm font-medium uppercase tracking-widest opacity-90">Hey Auryn™</p>
        <Text variant="display" as="p" className="mt-4 max-w-md text-primary-foreground">
          Calm, intelligent wellness support
        </Text>
        <p className="mt-4 max-w-sm text-sm leading-relaxed opacity-90">
          A conversational companion for recovery, reflection, and gentle next steps — designed to
          feel human, not clinical.
        </p>
      </div>
      <ul className="relative space-y-3 text-sm opacity-90">
        <li>Personalized through your Private Brain</li>
        <li>Wellness guidance, not diagnosis</li>
        <li>Designed for mobile-first calm</li>
      </ul>
    </div>
  );
}
