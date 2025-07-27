import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Metadata } from "next";
import ClientBody from "../ClientBody";
import { SessionProvider } from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  return {
    title: {
      template: `%s`,
      default: t("metadata.title") || "GAIDN - Global AI Developer Network",
    },
    description: t("metadata.description") || "以GitHub身份为基础的AI开发者网络平台，致力于建立一个自由协作、公开透明的开发者生态系统。",
    keywords: t("metadata.keywords") || "AI, developers, GitHub, network, collaboration",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}): Promise<JSX.Element> {
  const { locale } = await params;
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <GoogleAnalytics />
      <ThemeProvider defaultTheme="system" storageKey="gaidn-theme">
        <SessionProvider>
          <ClientBody>{children}</ClientBody>
        </SessionProvider>
        <Toaster />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}