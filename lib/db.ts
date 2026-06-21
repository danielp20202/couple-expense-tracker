import { neon, types } from "@neondatabase/serverless";

/**
 * Neon (Postgres) SQL client — SERVER-SIDE ONLY.
 *
 * DATABASE_URL is a full-access connection string (a secret); it must never be
 * exposed to the browser, so this module is only imported from server
 * components and server actions.
 *
 * Use the tagged template for parameterized queries:
 *   const rows = await sql`select * from expenses where id = ${id}`;
 * For arrays (IN lists): `where id = any(${ids})`.
 *
 * The client is created LAZILY (on first query) via a proxy, so the production
 * build doesn't fail at module load when DATABASE_URL isn't present — the DB is
 * never needed at build time (all pages are force-dynamic).
 */

// Return DATE / TIMESTAMP columns as raw strings (the app expects 'YYYY-MM-DD'
// for `date` and never manipulates timestamps in JS). `numeric` already comes
// back as a string, which the math helpers wrap in Number().
types.setTypeParser(1082, (v) => v); // date
types.setTypeParser(1114, (v) => v); // timestamp
types.setTypeParser(1184, (v) => v); // timestamptz

type SqlClient = ReturnType<typeof neon>;
let client: SqlClient | null = null;
function getClient(): SqlClient {
  if (!client) client = neon(process.env.DATABASE_URL!);
  return client;
}

export const sql = new Proxy((() => {}) as unknown as SqlClient, {
  apply: (_target, _thisArg, args: unknown[]) =>
    (getClient() as unknown as (...a: unknown[]) => unknown)(...args),
  get: (_target, prop) => (getClient() as unknown as Record<PropertyKey, unknown>)[prop],
});
