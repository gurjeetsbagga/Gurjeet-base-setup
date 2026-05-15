import { ActiveFocusPanel } from "@/components/dashboard/active-focus-panel";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { SummaryTile } from "@/components/dashboard/summary-tile";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import type { DashboardHomeData } from "@/lib/dashboard/types";

export function AurynHomeDashboard({ data }: { data: DashboardHomeData }) {
  return (
    <div className="flex flex-col gap-8 pb-28 lg:gap-10">
      <DashboardHero hero={data.hero} />

      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5"
        aria-label="Welcome and active focus"
      >
        <WelcomeCard content={data.welcome} className="lg:col-span-2" />
        <ActiveFocusPanel focus={data.activeFocus} />
      </section>

      <section
        className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5"
        aria-label="Wellness modules"
      >
        {data.tiles.map((tile) => (
          <SummaryTile key={tile.id} tile={tile} />
        ))}
      </section>
    </div>
  );
}
