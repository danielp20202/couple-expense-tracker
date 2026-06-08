"use client";

import { usePathname } from "next/navigation";
import { content } from "@/content";

export function HeroBanner() {
  const pathname = usePathname();
  if (pathname === "/select") return null;
  return (
    <div
      className="relative h-40 w-full flex items-end"
      style={{ background: "linear-gradient(135deg, #3D2314 0%, #C2674A 60%, #E8956D 100%)" }}
    >
      <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-b from-transparent to-[#FAF9F7]/30 pointer-events-none" />
      <div className="mx-auto max-w-3xl w-full px-page pb-5">
        <p className="text-white/60 text-xs font-medium tracking-widest uppercase mb-1">{content.appName}</p>
        <p className="text-white text-xl font-semibold tracking-tight">{content.tagline}</p>
      </div>
    </div>
  );
}
