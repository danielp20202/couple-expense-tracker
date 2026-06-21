/**
 * One-off data migration: copies all rows from the OLD Supabase project into
 * the NEW Neon database, preserving IDs and foreign-key links.
 *
 * Reads OLD Supabase creds (NEXT_PUBLIC_SUPABASE_*) and DATABASE_URL (Neon) from
 * .env.local. Run from the project root once the Neon schema (neon-schema.sql)
 * has been created:
 *   node scripts/migrate-to-neon.js
 */
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const { neon } = require("@neondatabase/serverless");

const env = fs.readFileSync(".env.local", "utf8");
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m")) || [])[1]?.trim();

const supa = createClient(get("NEXT_PUBLIC_SUPABASE_URL"), get("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
  auth: { persistSession: false },
});
const sql = neon(get("DATABASE_URL"));

async function readAll(table) {
  const r = await supa.from(table).select("*");
  if (r.error) throw new Error(`read ${table}: ${r.error.message}`);
  return r.data;
}

(async () => {
  const guard = await sql`select count(*)::int as n from profiles`;
  if (guard[0].n > 0) {
    console.log("ABORT — Neon already has profiles. Nothing copied.");
    process.exit(1);
  }

  const profiles = await readAll("profiles");
  const types = await readAll("expense_types");
  const recurring = await readAll("recurring_expenses");
  const expenses = await readAll("expenses");
  const seeded = await readAll("recurring_seeded");
  const settlements = await readAll("settlements");

  // Profiles self-reference via partner_id: insert with it null, then set it.
  for (const p of profiles) {
    await sql`insert into profiles (id, display_name, partner_id, created_at)
              values (${p.id}, ${p.display_name}, null, ${p.created_at})`;
  }
  for (const p of profiles) {
    if (p.partner_id)
      await sql`update profiles set partner_id = ${p.partner_id} where id = ${p.id}`;
  }
  for (const t of types) {
    await sql`insert into expense_types (id, name, created_by, created_at)
              values (${t.id}, ${t.name}, ${t.created_by}, ${t.created_at})`;
  }
  for (const r of recurring) {
    await sql`insert into recurring_expenses (id, amount, expense_type_id, paid_by, paid_from, active, created_at)
              values (${r.id}, ${r.amount}, ${r.expense_type_id}, ${r.paid_by}, ${r.paid_from}, ${r.active}, ${r.created_at})`;
  }
  for (const e of expenses) {
    await sql`insert into expenses (id, amount, expense_type_id, paid_by, paid_from, date, note, recurring_id, created_at)
              values (${e.id}, ${e.amount}, ${e.expense_type_id}, ${e.paid_by}, ${e.paid_from}, ${e.date}, ${e.note}, ${e.recurring_id}, ${e.created_at})`;
  }
  for (const s of seeded) {
    await sql`insert into recurring_seeded (recurring_id, month, created_at)
              values (${s.recurring_id}, ${s.month}, ${s.created_at})`;
  }
  for (const s of settlements) {
    await sql`insert into settlements (id, profile_id, amount, date, created_at)
              values (${s.id}, ${s.profile_id}, ${s.amount}, ${s.date}, ${s.created_at})`;
  }

  console.log("Migrated to Neon:", {
    profiles: profiles.length,
    expense_types: types.length,
    recurring_expenses: recurring.length,
    expenses: expenses.length,
    recurring_seeded: seeded.length,
    settlements: settlements.length,
  });
})().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
