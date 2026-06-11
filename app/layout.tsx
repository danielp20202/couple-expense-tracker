import type { Metadata } from "next";
import "./globals.css";
import { content } from "@/content";
import { Nav } from "@/app/components/Nav";
import { HeroBanner } from "@/app/components/HeroBanner";
import { AppShell } from "@/app/components/AppShell";

export const metadata: Metadata = {
  title: content.appName,
  description: content.tagline,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: content.appName,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <HeroBanner />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
