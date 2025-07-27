// 支持的语言列表
export const locales = ["en", "zh"] as const;

// 语言显示名称
export const localeNames: Record<string, string> = {
  en: "English",
  zh: "中文",
};

// 默认语言
export const defaultLocale = "en" as const;

// 路径前缀策略
// "as-needed": 默认语言不显示前缀，其他语言显示
// "always": 所有语言都显示前缀  
// "never": 所有语言都不显示前缀
export const localePrefix = "always";

// 是否启用自动语言检测
export const localeDetection = 
  process.env.NEXT_PUBLIC_LOCALE_DETECTION === "true";

// 类型定义
export type Locale = typeof locales[number];