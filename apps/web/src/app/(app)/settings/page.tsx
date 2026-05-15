"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <header className="mx-auto mb-8 max-w-2xl">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account and personalization preferences.
        </p>
      </header>
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile & memory</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/profile" className="text-sm font-medium text-primary hover:underline">
              Edit wellness profile →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Notification preferences will be available in a future update.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your conversations are used to personalize your experience. Privacy controls are
              coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
