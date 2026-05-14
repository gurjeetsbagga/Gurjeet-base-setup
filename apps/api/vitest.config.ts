import swc from "unplugin-swc";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    swc.vite({
      module: { type: "es6" },
      jsc: {
        target: "es2022",
        parser: { syntax: "typescript", decorators: true },
        transform: { decoratorMetadata: true },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    root: ".",
    include: ["src/**/*.{test,spec}.ts", "tests/**/*.{test,spec}.ts"],
    exclude: ["node_modules", "dist"],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      exclude: ["src/**/index.ts", "src/**/*.d.ts", "src/main.ts"],
    },
  },
});
