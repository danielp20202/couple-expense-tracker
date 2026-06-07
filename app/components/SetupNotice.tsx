import { Card } from "@/app/components/ui";

/** Shown when the two profiles haven't been seeded into the database yet. */
export function SetupNotice() {
  return (
    <Card className="bg-warning-bg border-warning-bg">
      <h2 className="font-semibold text-ink mb-1">Almost there</h2>
      <p className="text-sm text-ink">
        This app expects two linked profiles in the database. Run the seed
        section of <code className="font-mono">supabase-setup.sql</code> to add
        you and your partner, then reload.
      </p>
    </Card>
  );
}
