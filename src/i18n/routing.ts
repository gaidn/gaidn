import {
  defaultLocale,
  localeDetection,
  localePrefix,
  locales,
} from "./locale";

import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales,                    // 支持的语言
  defaultLocale,              // 默认语言
  localePrefix,               // 前缀策略
  localeDetection,            // 自动检测
});