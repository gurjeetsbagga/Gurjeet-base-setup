"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_BYTES = 800 * 1024;
const ACCEPT = "image/jpeg,image/png,image/gif";

export function AvatarUpload({
  previewUrl,
  onFileSelect,
  className,
}: {
  previewUrl?: string | null;
  onFileSelect?: (file: File) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayUrl = localPreview ?? previewUrl ?? null;

  const handleChange = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (file.size > MAX_BYTES) {
      setError("Image must be 800K or smaller.");
      return;
    }
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Use JPG, GIF, or PNG.");
      return;
    }
    const url = URL.createObjectURL(file);
    setLocalPreview(url);
    onFileSelect?.(file);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-5", className)} data-testid="avatar-upload">
      <div
        className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border-subtle bg-muted/50"
        aria-hidden={!displayUrl}
      >
        {displayUrl ? (
          <div
            className="size-full bg-cover bg-center"
            style={{ backgroundImage: `url(${displayUrl})` }}
            role="img"
            aria-label="Profile photo preview"
          />
        ) : (
          <span className="text-caption font-medium text-muted-foreground">Photo</span>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => handleChange(e.target.files?.[0])}
          aria-label="Upload profile photo"
        />
        <Button
          type="button"
          variant="outline"
          className="w-fit rounded-xl border-border-subtle bg-dashboard-brand-muted text-dashboard-brand hover:bg-dashboard-brand-muted/80"
          onClick={() => inputRef.current?.click()}
        >
          Change Avatar
        </Button>
        <p className="text-caption text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
        {error ? (
          <p className="text-caption text-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
