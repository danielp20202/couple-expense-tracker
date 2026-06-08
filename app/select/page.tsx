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

  /** Map display names to profile photos. Add more entries as photos are added. */
  const profilePhotos: Record<string, string> = {
    Laura: "/images/laura_1.webp",
  };

  return (
    <div className="min-h-screen flex flex-col items-center gap-10 pt-[15vh] pb-16 px-page">

      {/* Couple photo — centred above the tiles */}
      <div className="flex flex-col items-center gap-5">
        <img
          src="/images/ld_2.JPG"
          alt="Daniel and Laura"
          className="w-28 h-28 rounded-full object-cover object-top shadow-[0_4px_20px_rgba(28,25,23,0.15)] ring-4 ring-white"
        />
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-1">
            {content.profiles.pickTitle}
          </p>
          <p className="text-xl font-semibold text-ink tracking-tight">
            {content.profiles.pickSubtitle}
          </p>
        </div>
      </div>

      {/* Profile tiles */}
      <div className="flex flex-wrap justify-center gap-6">
        {people.map((p) => {
          const name = p.display_name ?? "";
          const photo = profilePhotos[name];
          return (
            <form key={p.id} action={selectProfile.bind(null, p.id)}>
              <button
                type="submit"
                className="flex flex-col items-center gap-3 rounded-card p-6 bg-surface border border-border shadow-[0_2px_8px_rgba(28,25,23,0.06)] transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-[120px]"
              >
                <Avatar name={name} size={80} photoSrc={photo} />
                <span className="text-sm font-semibold text-ink">{name}</span>
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
