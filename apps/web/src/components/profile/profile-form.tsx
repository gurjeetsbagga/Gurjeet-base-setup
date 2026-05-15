"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserProfile } from "@/lib/api/types";

const RECOVERY_OPTIONS = [
  { value: "", label: "Select category" },
  { value: "SURGICAL", label: "Surgical recovery" },
  { value: "INJURY", label: "Injury recovery" },
  { value: "CHRONIC", label: "Chronic condition" },
  { value: "MENTAL_HEALTH", label: "Mental wellness" },
  { value: "WELLNESS", label: "General wellness" },
  { value: "OTHER", label: "Other" },
];

export function ProfileForm({
  initial,
  onSave,
}: {
  initial: UserProfile;
  onSave: (profile: UserProfile) => void;
}) {
  const [profile, setProfile] = useState<UserProfile>(initial);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof UserProfile, value: string) => {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(profile);
    setSaved(true);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>About you</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={profile.firstName ?? ""}
                onChange={(e) => update("firstName", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={profile.lastName ?? ""}
                onChange={(e) => update("lastName", e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={profile.phone ?? ""}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wellness & recovery</CardTitle>
          <p className="text-sm text-muted-foreground">
            This helps Auryn personalize guidance — not for diagnosis.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="wellnessGoal">Wellness goal</Label>
            <Textarea
              id="wellnessGoal"
              value={profile.wellnessGoal ?? ""}
              onChange={(e) => update("wellnessGoal", e.target.value)}
              placeholder="What are you working toward?"
              rows={2}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="recoveryCategory">Recovery category</Label>
            <select
              id="recoveryCategory"
              className="flex h-11 w-full rounded-xl border border-input bg-surface px-4 text-sm"
              value={profile.recoveryCategory ?? ""}
              onChange={(e) => update("recoveryCategory", e.target.value)}
            >
              {RECOVERY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="activeProtocol">Active protocol</Label>
            <Input
              id="activeProtocol"
              value={profile.activeProtocol ?? ""}
              onChange={(e) => update("activeProtocol", e.target.value)}
              placeholder="e.g. Post-surgical week 3"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="restrictionsAllergies">Restrictions & allergies</Label>
            <Textarea
              id="restrictionsAllergies"
              value={profile.restrictionsAllergies ?? ""}
              onChange={(e) => update("restrictionsAllergies", e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="productPreferences">Product preferences</Label>
            <Textarea
              id="productPreferences"
              value={profile.productPreferences ?? ""}
              onChange={(e) => update("productPreferences", e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Memory & notes</CardTitle>
          <p className="text-sm text-muted-foreground">
            Context Auryn can use to support you thoughtfully over time.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="importantNotes">Important notes</Label>
            <Textarea
              id="importantNotes"
              value={profile.importantNotes ?? ""}
              onChange={(e) => update("importantNotes", e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit">Save profile</Button>
        {saved && <span className="text-sm text-success">Saved</span>}
      </div>
    </form>
  );
}
