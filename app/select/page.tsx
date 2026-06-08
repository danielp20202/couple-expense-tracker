import { getCouple } from "@/lib/profiles";
import { content } from "@/content";
import { selectProfile } from "@/app/actions/profile";
import { Avatar } from "@/app/components/Avatar";
import { SectionTitle } from "@/app/components/ui";
import { SetupNotice } from "@/app/components/SetupNotice";

export const dynamic = "force-dynamic";

export default async function SelectProfilePage() {
  const couple = await getCouple();
  if (!couple) {
    return (
      <div className="space-y-4">
        <SectionTitle>{content.profiles.pickTitle}</SectionTitle>
        <SetupNotice />
      </div>
    );
  }

  const people = [couple.personA, couple.personB];

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      <div className="text-center">
        <SectionTitle>{content.profiles.pickTitle}</SectionTitle>
        <p className="text-sm text-ink-muted">{content.profiles.pickSubtitle}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {people.map((p) => {
          const name = p.display_name ?? "";
          return (
            // .bind bakes the profile id into a server action — no client JS needed.
            <form key={p.id} action={selectProfile.bind(null, p.id)}>
              <button
                type="submit"
                className="flex flex-col items-center gap-3 rounded-card p-4 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <Avatar name={name} size={96} />
                <span className="text-ink font-medium">{name}</span>
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
