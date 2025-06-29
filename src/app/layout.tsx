import type { Metadata } from "next";
import "./globals.css";
import ClientBody from "./ClientBody";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "GAIDN - Global AI Developer Network",
  description: "以GitHub身份为基础的AI开发者网络平台，致力于建立一个去中心化、自由协作、公开透明的开发者生态系统。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased">
        <SessionProvider>
          <ClientBody>{children}</ClientBody>
        </SessionProvider>
      </body>
    </html>
  );
}
