import type { Metadata } from "next";
import "./globals.css";
import { content } from "@/content";
import { Nav } from "@/app/components/Nav";

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
        <main className="mx-auto max-w-3xl px-page py-6">{children}</main>
      </body>
    </html>
  );
}
