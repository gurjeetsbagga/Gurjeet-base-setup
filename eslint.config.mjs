import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/.next/**",
      "**/build/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/.expo/**",
      "**/next-env.d.ts",
      "**/expo-env.d.ts",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,

  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
);
