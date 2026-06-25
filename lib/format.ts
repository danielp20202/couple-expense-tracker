import { content } from "@/content";

const { locale, currency } = content.config;

const money = new Intl.NumberFormat(locale, {
  style: "currency",
  currency,
});

/** Format a number as currency, e.g. 1234.5 -> "$1,234.50" (CAD). */
export function formatMoney(amount: number): string {
  return money.format(amount);
}

/** "2026-06" -> "June 2026" */
export function formatMonthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
}

/** "2026-06-07" -> "Jun 7" */
export function formatDateShort(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
  });
}

/** "Today" / "Tomorrow" / "Thu" within the next week, else "Jul 2". */
export function formatRelativeDay(dateISO: string, todayISO: string): string {
  if (dateISO === todayISO) return content.dates.today;
  const [y, m, d] = todayISO.split("-").map(Number);
  const tomorrow = new Date(y, m - 1, d + 1);
  const tISO = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(tomorrow.getDate()).padStart(2, "0")}`;
  if (dateISO === tISO) return content.dates.tomorrow;

  // Within the next 6 days → weekday name; otherwise a short date.
  const [ty, tm, td] = dateISO.split("-").map(Number);
  const target = new Date(ty, tm - 1, td);
  const diffDays = Math.round((target.getTime() - new Date(y, m - 1, d).getTime()) / 86400000);
  if (diffDays > 0 && diffDays < 7) {
    return target.toLocaleDateString(locale, { weekday: "long" });
  }
  return formatDateShort(dateISO);
}

/** Monday "2026-06-22" -> "Jun 22 – 28" (the Mon–Sun span of that week). */
export function formatWeekLabel(monday: string): string {
  const [y, m, d] = monday.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + 6);
  const startStr = start.toLocaleDateString(locale, { month: "short", day: "numeric" });
  const sameMonth = start.getMonth() === end.getMonth();
  const endStr = end.toLocaleDateString(locale, {
    month: sameMonth ? undefined : "short",
    day: "numeric",
  });
  return `${startStr} – ${endStr}`;
}
