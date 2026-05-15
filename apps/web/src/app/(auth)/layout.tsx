import { BrandPanel } from "@/components/layout/brand-panel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-background">
      <BrandPanel />
      <div className="auryn-gradient flex flex-1 flex-col items-center justify-center px-4 py-12 lg:bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
