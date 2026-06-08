"use client";

import { usePathname } from "next/navigation";

/** Wraps page content — removes max-width/padding constraint on /select */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/select") {
    return <>{children}</>;
  }
  return (
    <main className="mx-auto max-w-3xl px-page py-6">{children}</main>
  );
}
