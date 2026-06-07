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
