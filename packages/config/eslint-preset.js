import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export function createConfig({ tsconfigRootDir }) {
  return defineConfig(
    { ignores: ["**/dist/**", "**/.next/**", "**/.turbo/**", "**/node_modules/**"] },
    js.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
      languageOptions: {
        parserOptions: { projectService: true, tsconfigRootDir },
      },
    },
    { files: ["**/*.{js,mjs,cjs}"], extends: [tseslint.configs.disableTypeChecked] },
    prettier,
  );
}
