import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: ".env.local" })

// Only `npm run db:studio` (a browser to look at the data) uses this file.
// .env.local points at the LIVE database, so the push / generate / seed
// scripts were removed on purpose: schema changes are hand-written SQL files
// in db/migrations, run in the Neon console before the code that needs them.
export default defineConfig({
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
