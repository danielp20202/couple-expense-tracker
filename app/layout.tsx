import type { Metadata } from "next";
import "./globals.css";
import { content } from "@/content";
import { Nav } from "@/app/components/Nav";
import { HeroBanner } from "@/app/components/HeroBanner";
import { AppShell } from "@/app/components/AppShell";

export const metadata: Metadata = {
  title: content.appName,
  description: content.tagline,
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
