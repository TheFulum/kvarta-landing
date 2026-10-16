// Прогоняет db/schema.sql в Neon перед сборкой. Без DATABASE_URL ничего не делает:
// локально форма работает на хранилище в памяти.
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("migrate: DATABASE_URL не задан, пропускаю");
  process.exit(0);
}

const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const statements = schema
  .replace(/--.*$/gm, "")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

const sql = neon(url);
for (const statement of statements) {
  await sql.query(statement);
}
console.log(`migrate: применено ${statements.length} выражений`);
