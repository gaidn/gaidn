import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import type { Locale } from "./locale";

export default getRequestConfig(async ({ requestLocale }) => {
  // 获取请求的语言
  let locale = await requestLocale;
  
  // 验证语言是否支持
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  // 处理特殊语言映射 (如 zh-CN -> zh)
  if (["zh-CN", "zh-Hans"].includes(locale)) {
    locale = "zh";
  }

  // 二次验证
  if (!routing.locales.includes(locale as Locale)) {
    locale = "en";
  }

  try {
    // 动态导入翻译文件
    const messages = (await import(`./messages/${locale.toLowerCase()}.json`))
      .default;
    
    return {
      locale: locale,
      messages: messages,
    };
  } catch {
    // 回退到英文
    return {
      locale: "en",
      messages: (await import(`./messages/en.json`)).default,
    };
  }
});