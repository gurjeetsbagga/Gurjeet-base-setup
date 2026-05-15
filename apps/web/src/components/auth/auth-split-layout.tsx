import { PhysicianOsLogoIcon, StarBadgeIcon } from "@/components/auth/auth-icons";
import { cn } from "@/lib/utils";

function AuthTestimonialPanel({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "auth-panel relative flex min-h-[280px] flex-col overflow-hidden px-8 py-10 md:min-h-dvh md:px-12 md:py-12 xl:px-16",
        className,
      )}
      aria-label="Recovery testimonial"
    >
      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/60 bg-surface px-4 py-2 text-sm font-medium text-auth-brand shadow-soft">
        <StarBadgeIcon className="size-4 shrink-0" />
        Personalized Recovery
      </div>

      <div className="flex flex-1 flex-col justify-center py-10 md:py-16">
        <blockquote className="relative z-10 max-w-lg">
          <p className="text-[1.75rem] font-semibold leading-snug tracking-tight text-auth-brand md:text-h1">
            &ldquo;The most seamless way to track my ACL recovery. Auryn keeps me accountable every
            day.&rdquo;
          </p>
        </blockquote>
      </div>

      <footer className="relative z-10 flex items-center gap-3 pb-4">
        <span className="flex size-11 items-center justify-center rounded-full bg-surface text-sm font-semibold text-auth-brand shadow-soft">
          MA
        </span>
        <div>
          <p className="text-sm font-semibold text-auth-brand">Marcus A.</p>
          <p className="text-sm text-auth-brand/70">Phase 3</p>
          <p className="text-sm text-auth-brand/70">Patient</p>
        </div>
      </footer>

      <svg
        className="pointer-events-none absolute bottom-0 right-0 h-48 w-72 text-auth-brand/12 md:h-56 md:w-80"
        viewBox="0 0 280 140"
        fill="none"
        aria-hidden
      >
        <path
          d="M0 100 48 52 96 88 144 36 192 72 240 28 280 64"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </aside>
  );
}

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-surface md:flex-row">
      <div className="flex min-h-dvh w-full flex-col bg-surface md:w-1/2 lg:w-[52%]">
        <header className="flex items-center gap-2.5 px-6 py-6 md:px-10 md:py-8 lg:px-14">
          <PhysicianOsLogoIcon className="size-8 shrink-0 text-auth-brand" />
          <span className="text-lg font-semibold tracking-tight text-foreground">PhysicianOS</span>
        </header>
        <div className="flex flex-1 flex-col justify-center px-6 pb-12 md:px-10 md:pb-16 lg:px-14">
          <div className="mx-auto w-full max-w-[26rem]">{children}</div>
        </div>
      </div>
      <AuthTestimonialPanel className="w-full md:w-1/2 lg:w-[48%]" />
    </div>
  );
}
