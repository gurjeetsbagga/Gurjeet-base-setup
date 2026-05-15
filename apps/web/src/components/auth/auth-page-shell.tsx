import { AurynMarkIcon } from "@/components/auth/auth-icons";

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-canvas flex min-h-dvh flex-col items-center px-4 py-10 sm:py-14">
      <header className="mb-8 flex flex-col items-center gap-3">
        <AurynMarkIcon className="size-10" />
        <span className="text-xl font-semibold tracking-tight text-auth-brand">Hey Auryn</span>
      </header>
      <div className="w-full max-w-[420px]">{children}</div>
    </div>
  );
}
