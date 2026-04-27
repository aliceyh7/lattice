import { db } from "@/lib/db"

export async function getUser() {
  const user = await db.user.findFirst()
  if (!user) throw new Error("No user found — run prisma db seed")
  return user
}
