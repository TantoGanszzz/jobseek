// Apply SQL migrations to the Jobseek Supabase database.
// Usage:  node scripts/apply-db.mjs [--file path.sql ...]
// Reads connection from environment variable SUPABASE_DB_URL or .db.env (SUPABASE_DB_URL=...)
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Client } = require("pg");

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .db.env (simple KEY=VALUE lines) if present
function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = { ...loadEnvFile(resolve(__dirname, "..", ".db.env")), ...process.env };
const connectionString = env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error(
    "SUPABASE_DB_URL not found.\n" +
      "Add it to .db.env (console appends to URL)\n" +
      "Got it from: Supabase Dashboard -> Project Settings -> Database -> Connection string (Direct) -> URI\n" +
      "Format: postgresql://postgres.<project>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
  );
  process.exit(1);
}

const files =
  process.argv.includes("--file")
    ? process.argv
        .slice(process.argv.indexOf("--file") + 1)
        .filter((a) => !a.startsWith("--"))
        .map((f) => resolve(__dirname, "..", f))
    : [
        resolve(__dirname, "..", "supabase/migrations/000_base.sql"),
        resolve(__dirname, "..", "supabase/migrations/001_onboarding.sql"),
      ];

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

for (const file of files) {
  if (!existsSync(file)) {
    console.warn(`skip (missing): ${file}`);
    continue;
  }
  const sql = readFileSync(file, "utf8");
  try {
    await client.query(sql);
    console.log(`OK   ${file}`);
  } catch (err) {
    console.error(`FAIL ${file}`);
    console.error(err.message);
    await client.end();
    process.exit(1);
  }
}

console.log("Verifying schema...");
for (const table of [
  "profiles",
  "companies",
  "jobs",
  "applications",
  "saved_jobs",
  "qualification_tests",
  "qualification_test_attempts",
  "portfolio_projects",
  "experiences",
  "career_recommendations",
  "company_preferences",
  "courses",
  "learning_progress",
  "activities",
]) {
  const { rows } = await client.query(
    `SELECT to_regclass('public.${table}') AS t`
  );
  const found = rows[0]?.t ?? null;
  console.log(`${found ? "OK  " : "MISS"} public.${table}`);
}

await client.end();
console.log("Done.");
