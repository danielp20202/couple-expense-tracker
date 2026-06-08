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
        <div className="relative h-40 w-full flex items-end" style={{ background: "linear-gradient(135deg, #3D2314 0%, #C2674A 60%, #E8956D 100%)" }}>
          {/* fade bottom edge into page background */}
          <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-b from-transparent to-[#FAF9F7]/30 pointer-events-none" />
          <div className="mx-auto max-w-3xl w-full px-page pb-5">
            <p className="text-white/60 text-xs font-medium tracking-widest uppercase mb-1">Our Expenses</p>
            <p className="text-white text-xl font-semibold tracking-tight">Shared 50/50, settled every month</p>
          </div>
        </div>
        <main className="mx-auto max-w-3xl px-page py-6">{children}</main>
      </body>
    </html>
  );
}
