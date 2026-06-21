import { Card } from "@/app/components/ui";

/** Shown when the two profiles haven't been seeded into the database yet. */
export function SetupNotice() {
  return (
    <Card className="bg-warning-bg border-warning-bg">
      <h2 className="font-semibold text-ink mb-1">Almost there</h2>
      <p className="text-sm text-ink">
        This app expects two linked profiles in the database. Seed you and your
        partner into the <code className="font-mono">profiles</code> table (see
        the project README), then reload.
      </p>
    </Card>
  );
}
