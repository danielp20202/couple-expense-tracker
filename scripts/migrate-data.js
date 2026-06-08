/**
 * One-off data migration: copies all rows from the OLD Supabase project to a
 * NEW one, preserving IDs and foreign-key links.
 *
 * OLD credentials are read from .env.local; NEW ones from env vars NEW_URL /
 * NEW_KEY. Run from the project root:
 *   NEW_URL=... NEW_KEY=... node scripts/migrate-data.js
 */
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const env = fs.readFileSync(".env.local", "utf8");
const OLD_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const OLD_KEY = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const { NEW_URL, NEW_KEY } = process.env;

const oldDb = createClient(OLD_URL, OLD_KEY, { auth: { persistSession: false } });
const newDb = createClient(NEW_URL, NEW_KEY, { auth: { persistSession: false } });

async function readAll(table) {
  const r = await oldDb.from(table).select("*");
  if (r.error) throw new Error(`read ${table}: ${r.error.message}`);
  return r.data;
}
async function insert(table, rows) {
  if (!rows.length) return;
  const r = await newDb.from(table).insert(rows);
  if (r.error) throw new Error(`insert ${table}: ${r.error.message}`);
}

(async () => {
  // Safety: don't double-import.
  const existing = await newDb.from("profiles").select("id");
  if (existing.error) throw new Error(`probe new: ${existing.error.message}`);
  if (existing.data.length) {
    console.log("ABORT — new project already has profiles. Nothing copied.");
    process.exit(1);
  }

  const profiles = await readAll("profiles");
  const types = await readAll("expense_types");
  const recurring = await readAll("recurring_expenses");
  const expenses = await readAll("expenses");
  const seeded = await readAll("recurring_seeded");

  // Profiles self-reference via partner_id: insert with it null, then set it.
  await insert("profiles", profiles.map((p) => ({ ...p, partner_id: null })));
  for (const p of profiles) {
    if (!p.partner_id) continue;
    const u = await newDb
      .from("profiles")
      .update({ partner_id: p.partner_id })
      .eq("id", p.id);
    if (u.error) throw new Error(`link partner ${p.id}: ${u.error.message}`);
  }

  await insert("expense_types", types);
  await insert("recurring_expenses", recurring);
  await insert("expenses", expenses);
  await insert("recurring_seeded", seeded);

  console.log("Copied:", {
    profiles: profiles.length,
    expense_types: types.length,
    recurring_expenses: recurring.length,
    expenses: expenses.length,
    recurring_seeded: seeded.length,
  });
})().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
