// Applies drizzle/ migrations over Neon's HTTP driver (drizzle-kit's migrate
// needs a websocket polyfill).
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}
await migrate(drizzle({ client: neon(process.env.DATABASE_URL) }), {
  migrationsFolder: "drizzle",
  migrationsSchema: "tgos",
});
console.log("Migrations applied");
