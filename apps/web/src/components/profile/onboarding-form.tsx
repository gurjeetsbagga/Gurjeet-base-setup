"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import type { UserProfile } from "@/lib/api/types";

const RECOVERY_OPTIONS = [
  { value: "", label: "Select category" },
  { value: "WELLNESS", label: "General wellness" },
  { value: "SURGICAL", label: "Surgical recovery" },
  { value: "INJURY", label: "Injury recovery" },
  { value: "CHRONIC", label: "Chronic condition" },
  { value: "MENTAL_HEALTH", label: "Mental wellness" },
  { value: "OTHER", label: "Other" },
];

export function OnboardingForm({
  initial,
  onComplete,
}: {
  initial: UserProfile;
  onComplete: (profile: UserProfile) => void;
}) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(initial);

  const update = (key: keyof UserProfile, value: string) => {
    setProfile((p) => ({ ...p, [key]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    onComplete(profile);
  };

  return (
    <Card className="w-full border-border-subtle shadow-[var(--shadow-elevated)]">
      <CardHeader>
        <p className="text-caption font-medium uppercase tracking-widest text-secondary">
          Step {step + 1} of 3
        </p>
        <CardTitle>
          {step === 0 && "Welcome to Auryn"}
          {step === 1 && "Your wellness focus"}
          {step === 2 && "A few notes for context"}
        </CardTitle>
        <Text variant="body-lg">
          {step === 0 && "Let's personalize your experience — gently, at your pace."}
          {step === 1 && "This helps Auryn tailor calm, thoughtful guidance."}
          {step === 2 && "Optional notes Auryn can remember over time."}
        </Text>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {step === 0 && (
            <>
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
            </>
          )}
          {step === 1 && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="wellnessGoal">Wellness goal</Label>
                <Textarea
                  id="wellnessGoal"
                  value={profile.wellnessGoal ?? ""}
                  onChange={(e) => update("wellnessGoal", e.target.value)}
                  placeholder="What are you working toward?"
                  rows={3}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="recoveryCategory">Recovery area</Label>
                <Select
                  id="recoveryCategory"
                  value={profile.recoveryCategory ?? ""}
                  onChange={(e) => update("recoveryCategory", e.target.value)}
                >
                  {RECOVERY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="importantNotes">Important notes</Label>
              <Textarea
                id="importantNotes"
                value={profile.importantNotes ?? ""}
                onChange={(e) => update("importantNotes", e.target.value)}
                placeholder="Preferences, context, or anything Auryn should remember"
                rows={4}
              />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            <Button type="submit" className="flex-1">
              {step < 2 ? "Continue" : "Finish setup"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
