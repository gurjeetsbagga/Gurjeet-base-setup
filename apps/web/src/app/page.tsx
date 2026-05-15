import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="auryn-gradient flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <span className="text-xl font-semibold text-primary">Auryn</span>
        <nav className="flex gap-3">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Sign in
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </nav>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-6 pb-20 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-secondary">
            AI wellness companion
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Calm guidance for your recovery journey
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Auryn listens with care, remembers what matters to you, and offers thoughtful wellness
            support — never diagnosis, always human-centered.
          </p>
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
      </section>

      <footer className="border-t border-border-subtle px-6 py-4 text-center text-xs text-muted-foreground">
        Auryn offers wellness guidance — not medical diagnosis. Consult a healthcare professional
        for medical decisions.
      </footer>
    </main>
  );
}
