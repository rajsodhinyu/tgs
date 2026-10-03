import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  casing: "snake_case",
  schemaFilter: ["tgos"],
  migrations: { schema: "tgos" },
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
