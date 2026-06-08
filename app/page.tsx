import { redirect } from "next/navigation";
import { getSelectedProfileId } from "@/lib/profile-session";

export const dynamic = "force-dynamic";

export default function Home() {
  // Remembered profile → straight to the dashboard; otherwise pick one first.
  redirect(getSelectedProfileId() ? "/dashboard" : "/select");
}
