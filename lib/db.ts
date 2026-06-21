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
 * `date` / `timestamp` columns are returned as raw strings (not JS Date
 * objects) so the app's `'YYYY-MM-DD'` string handling keeps working. `numeric`
 * comes back as a string by default — the math helpers already wrap it in
 * Number().
 */
const STRING_OIDS = new Set<number>([1082, 1114, 1184]); // date, timestamp, timestamptz

export const sql = neon(process.env.DATABASE_URL!, {
  types: {
    getTypeParser: ((id: number, format?: "text" | "binary") =>
      STRING_OIDS.has(id)
        ? (val: string) => val
        : (types.getTypeParser as (i: number, f?: string) => unknown)(id, format)) as never,
  },
});
