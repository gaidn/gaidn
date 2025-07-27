import type { Metadata } from "next";
import "./globals.css";
import { getLocale } from "next-intl/server";
import { locales } from "@/i18n/locale";

export const metadata: Metadata = {
  title: "GAIDN - Global AI Developer Network",
  description: "以GitHub身份为基础的AI开发者网络平台，致力于建立一个自由协作、公开透明的开发者生态系统。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<JSX.Element> {
  const locale = await getLocale();
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "";

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* SEO: hreflang 链接 */}
        {locales.map((loc) => (
          <link
            key={loc}
            rel="alternate"
            hrefLang={loc}
            href={`${webUrl}${loc === "en" ? "" : `/${loc}`}/`}
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={webUrl} />
      </head>
      <body suppressHydrationWarning className="antialiased">
        {children}
      </body>
    </html>
  );
}
