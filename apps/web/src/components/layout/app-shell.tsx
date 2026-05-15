"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-provider";
import { ConversationList, type ConversationListItem } from "@/components/chat/conversation-list";

const navItems = [
  { href: "/chat", label: "Chat" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({
  children,
  conversations = [],
  activeConversationId,
  onNewChat,
}: {
  children: ReactNode;
  conversations?: ConversationListItem[];
  activeConversationId?: string | null;
  onNewChat?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col bg-background md:flex-row">
      <header className="flex items-center justify-between border-b border-border-subtle bg-surface px-4 py-3 md:hidden">
        <Link href="/chat" className="text-lg font-semibold text-primary">
          Auryn
        </Link>
        <button
          type="button"
          className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-expanded={sidebarOpen}
          aria-label="Toggle menu"
        >
          Menu
        </button>
      </header>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border-subtle bg-surface transition-transform md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="hidden border-b border-border-subtle px-4 py-5 md:block">
          <Link href="/chat" className="text-xl font-semibold tracking-tight text-primary">
            Auryn
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">Your wellness companion</p>
        </div>

        {onNewChat && (
          <div className="flex-1 overflow-y-auto border-b border-border-subtle md:max-h-[50%]">
            <ConversationList
              conversations={conversations}
              activeId={activeConversationId}
              onNewChat={onNewChat}
            />
          </div>
        )}

        <nav className="mt-auto flex flex-col gap-1 p-2" aria-label="Main">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-primary-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border-subtle p-4">
          <p className="truncate text-sm text-muted-foreground">{user?.email ?? "Guest"}</p>
          {user ? (
            <button
              type="button"
              onClick={() => logout()}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Sign out
            </button>
          ) : (
            <Link href="/login" className="mt-2 inline-block text-sm text-primary hover:underline">
              Sign in
            </Link>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-foreground/20 md:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
