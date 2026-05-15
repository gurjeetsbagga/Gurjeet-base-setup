import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

const features = [
  {
    title: "Conversational care",
    description: "A calm chat experience that listens first and guides gently — never pushy.",
  },
  {
    title: "Your Private Brain",
    description: "Context that grows with you, so guidance feels personal over time.",
  },
  {
    title: "Recovery-focused",
    description: "Wellness and recovery support aligned with your goals and care team.",
  },
];

export default function HomePage() {
  return (
    <main className="auryn-gradient flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <span className="text-xl font-semibold text-primary">Auryn</span>
        <nav className="flex gap-3">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </nav>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-8 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-caption font-medium uppercase tracking-widest text-secondary">
            AI wellness companion
          </p>
          <Text variant="display" as="h1" className="text-balance">
            Calm guidance for your recovery journey
          </Text>
          <Text variant="body-lg" className="mx-auto mt-6 max-w-2xl text-balance">
            Auryn listens with care, remembers what matters to you, and offers thoughtful wellness
            support — never diagnosis, always human-centered.
          </Text>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/chat">
              <Button size="lg">Start a conversation</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="lg">
                Create account
              </Button>
            </Link>
          </div>
        </div>

        <ul className="mx-auto mt-20 grid max-w-4xl gap-6 text-left sm:grid-cols-3">
          {features.map((f) => (
            <li
              key={f.title}
              className="rounded-2xl border border-border-subtle bg-surface/80 p-6 shadow-[var(--shadow-soft)] backdrop-blur-sm"
            >
              <h2 className="text-h3 font-semibold text-foreground">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-border-subtle px-6 py-4 text-center text-caption text-muted-foreground">
        Auryn offers wellness guidance — not medical diagnosis. Consult a healthcare professional
        for medical decisions.
      </footer>
    </main>
  );
}
