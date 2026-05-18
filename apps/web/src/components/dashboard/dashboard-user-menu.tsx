"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";

function initialsFromUser(email?: string | null, displayName?: string | null): string {
  if (displayName?.trim()) {
    const parts = displayName.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "AU";
}

export function DashboardUserMenu({
  userInitials: userInitialsOverride,
  className,
}: {
  userInitials?: string;
  className?: string;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const initials = userInitialsOverride ?? initialsFromUser(user?.email, user?.displayName ?? null);
  const displayLabel = user?.displayName?.trim() || user?.email || "Account";

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open]);

  const handleLogout = async () => {
    close();
    await logout();
    router.replace("/login");
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-brand/40 focus-visible:ring-offset-2"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <Avatar
          label={initials}
          size="lg"
          className="border-2 border-dashboard-brand bg-dashboard-brand-muted text-dashboard-brand ring-0"
        />
        <span className="sr-only">Open account menu for {displayLabel}</span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[12.5rem] overflow-hidden rounded-xl border border-border-subtle bg-surface py-1 shadow-elevated"
        >
          <div className="border-b border-border-subtle px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">{displayLabel}</p>
            {user?.email ? (
              <p className="mt-0.5 truncate text-caption text-muted-foreground">{user.email}</p>
            ) : null}
          </div>

          <Link
            href="/profile"
            role="menuitem"
            className="block px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
            onClick={close}
          >
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
            onClick={() => void handleLogout()}
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
