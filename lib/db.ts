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
 */

// Return DATE / TIMESTAMP columns as raw strings (the app expects 'YYYY-MM-DD'
// for `date` and never manipulates timestamps in JS). `numeric` already comes
// back as a string, which the math helpers wrap in Number().
types.setTypeParser(1082, (v) => v); // date
types.setTypeParser(1114, (v) => v); // timestamp
types.setTypeParser(1184, (v) => v); // timestamptz

export const sql = neon(process.env.DATABASE_URL!);
