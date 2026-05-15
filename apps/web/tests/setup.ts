import "@testing-library/jest-dom/vitest";

process.env.NODE_ENV ??= "test";
process.env.NEXT_PUBLIC_API_URL ??= "http://localhost:4000";
process.env.NEXT_PUBLIC_APP_URL ??= "http://localhost:3000";

const storage = new Map<string, string>();

Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
  },
  configurable: true,
});
