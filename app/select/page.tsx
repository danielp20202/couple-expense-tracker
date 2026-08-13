import { getCouple } from "@/lib/profiles";
import { content } from "@/content";
import { selectProfile } from "@/app/actions/profile";
import { Avatar } from "@/app/components/Avatar";
import { SetupNotice } from "@/app/components/SetupNotice";

export const dynamic = "force-dynamic";

export default async function SelectProfilePage() {
  const couple = await getCouple();
  if (!couple) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-page">
        <SetupNotice />
      </div>
    );
  }

  const people = [couple.personA, couple.personB];

  /** Map display names to profile photos. Add more entries as photos are added. */
  const profilePhotos: Record<string, string> = {
    Laura: "/images/laura_1.webp",
  };

  const todayLabel = new Intl.DateTimeFormat(content.config.locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-page py-16">
      <div className="w-full max-w-sm">
        {/* Couple photo + eyebrow + title */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <img
            src="/images/ld_2.JPG"
            alt="Daniel and Laura"
            className="w-20 h-20 rounded-full object-cover object-top ring-1 ring-border"
          />
          <div className="text-center">
            <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-ink-muted mb-2">
              {todayLabel}
            </p>
            <h1 className="font-serif text-[28px] font-semibold text-ink mb-1">
              {content.profiles.pickTitle}
            </h1>
            <p className="text-sm text-ink-muted">{content.profiles.pickSubtitle}</p>
          </div>
        </div>

        {/* Profile rows */}
        <div className="flex flex-col gap-3">
          {people.map((p) => {
            const name = p.display_name ?? "";
            const photo = profilePhotos[name];
            return (
              <form key={p.id} action={selectProfile.bind(null, p.id)}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-4 rounded-card border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <Avatar name={name} size={44} photoSrc={photo} />
                  <span className="flex-1 font-serif text-lg font-semibold text-ink">{name}</span>
                  <span className="text-lg text-ink-muted">&rsaquo;</span>
                </button>
              </form>
            );
          })}
        </div>

        <p className="mt-10 font-mono text-[10.5px] tracking-wide uppercase text-ink-muted text-center border-t border-border pt-5">
          {content.appName} &middot; Private
        </p>
      </div>
    </div>
  );
}
