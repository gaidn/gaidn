import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // 避免未使用的变量
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "ignoreRestSiblings": true,
        },
      ],

      // 严格禁止 any（除非明确标记）
      "@typescript-eslint/no-explicit-any": ["error"],

      // 避免使用 @ts-ignore，要求明确说明用途
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": "allow-with-description",
          "ts-expect-error": "allow-with-description",
        },
      ],

      // 鼓励明确返回类型
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          "allowExpressions": true,
          "allowConciseArrowFunctionExpressionsStartingWithVoid": true,
        },
      ],

      // 禁止空函数、空 catch
      "@typescript-eslint/no-empty-function": "error",
      "@typescript-eslint/no-empty": ["error", { allowEmptyCatch: false }],
    },
  },
];
