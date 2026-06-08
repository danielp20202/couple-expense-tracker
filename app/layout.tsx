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
        <div
          className="h-32 w-full flex items-end"
          style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #38bdf8 100%)" }}
        >
          <div className="mx-auto max-w-3xl w-full px-page pb-4">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">Our Expenses</p>
            <p className="text-white text-xl font-semibold">Shared 50/50, settled every month</p>
          </div>
        </div>
        <main className="mx-auto max-w-3xl px-page py-6">{children}</main>
      </body>
    </html>
  );
}
