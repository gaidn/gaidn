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
    // 忽略文件和目录
    ignores: [
      // Markdown 文档
      "**/*.md",
      "**/*.mdx",
      "docs/**",
      "tasks/**",
      "README.md",
      "CHANGELOG.md",

      // 构建输出
      ".next/**",
      ".open-next/**",
      "out/**",
      "build/**",
      "dist/**",

      // 依赖
      "node_modules/**",

      // 环境文件
      ".env*",

      // 配置文件
      "wrangler.jsonc",
      "next.config.ts",
      "postcss.config.mjs",

      // IDE 文件
      ".vscode/**",
      ".idea/**",

      // 其他
      ".DS_Store",
      "*.log"
    ]
  },
];
