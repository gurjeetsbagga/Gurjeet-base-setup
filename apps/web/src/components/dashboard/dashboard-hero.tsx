import type { DashboardHero } from "@/lib/dashboard/types";

export function DashboardHero({ hero }: { hero: DashboardHero }) {
  return (
    <header className="mx-auto max-w-3xl text-center">
      <h1 className="text-balance text-h1 font-semibold tracking-tight text-foreground md:text-[2rem]">
        {hero.title}
      </h1>
      <p className="mt-3 text-balance text-body-lg text-muted-foreground">{hero.subtitle}</p>
    </header>
  );
}
