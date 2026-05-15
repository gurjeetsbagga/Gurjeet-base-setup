"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useStreamingText(options?: { charsPerTick?: number; intervalMs?: number }) {
  const { charsPerTick = 3, intervalMs = 24 } = options ?? {};
  const [displayText, setDisplayText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const targetRef = useRef("");
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolveRef = useRef<(() => void) | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const streamFullText = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        stopTimer();
        targetRef.current = text;
        indexRef.current = 0;
        setDisplayText("");
        setIsStreaming(true);
        resolveRef.current = resolve;

        timerRef.current = setInterval(() => {
          const target = targetRef.current;
          if (indexRef.current >= target.length) {
            stopTimer();
            setIsStreaming(false);
            setDisplayText(target);
            resolveRef.current?.();
            resolveRef.current = null;
            return;
          }
          indexRef.current = Math.min(indexRef.current + charsPerTick, target.length);
          setDisplayText(target.slice(0, indexRef.current));
        }, intervalMs);
      });
    },
    [charsPerTick, intervalMs, stopTimer],
  );

  const reset = useCallback(() => {
    stopTimer();
    targetRef.current = "";
    indexRef.current = 0;
    setDisplayText("");
    setIsStreaming(false);
    resolveRef.current = null;
  }, [stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  return { displayText, isStreaming, streamFullText, reset };
}
