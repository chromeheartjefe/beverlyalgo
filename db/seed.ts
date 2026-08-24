// Run manually with: npm run db:seed
import bcrypt from "bcryptjs"
import { config } from "dotenv"

config({ path: ".env.local" })

async function main() {
  const { db } = await import("./index")
  const { users } = await import("./schema")

  const testPasswordHash = await bcrypt.hash("changeme123", 10)
  await db
    .insert(users)
    .values({
      name: "Test User",
      email: "test@entrixalgo.com",
      passwordHash: testPasswordHash,
      plan: "free",
    })
    .onConflictDoNothing({ target: users.email })

  // Permanently pro, for local dashboard testing. Never touches Stripe, so
  // it has no stripeSubscriptionId and the webhook can never downgrade it.
  const adminPasswordHash = await bcrypt.hash("adminpro123", 10)
  await db
    .insert(users)
    .values({
      name: "Admin",
      email: "admin@entrixalgo.com",
      passwordHash: adminPasswordHash,
      plan: "pro",
    })
    .onConflictDoNothing({ target: users.email })

  console.log("Seeded test user: test@entrixalgo.com / changeme123 (free)")
  console.log("Seeded admin user: admin@entrixalgo.com / adminpro123 (pro)")
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
