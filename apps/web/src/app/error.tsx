"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium text-error">Something went wrong</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Unexpected error</h1>
        <p className="mt-2 text-muted-foreground">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
