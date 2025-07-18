import type { Metadata } from "next";
import "./globals.css";
import ClientBody from "./ClientBody";
import { SessionProvider } from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "GAIDN - Global AI Developer Network",
  description: "以GitHub身份为基础的AI开发者网络平台，致力于建立一个自由协作、公开透明的开发者生态系统。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased">
        <ThemeProvider defaultTheme="system" storageKey="gaidn-theme">
          <SessionProvider>
            <ClientBody>{children}</ClientBody>
          </SessionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
