import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"

export default async function OnboardPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")

  const clerkUser = await currentUser()
  if (!clerkUser) redirect("/sign-in")

  // Auto-create user on first visit
  const existing = await db.user.findUnique({ where: { clerkId } })
  if (!existing) {
    await db.user.create({
      data: {
        clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null,
      },
    })
  }

  redirect("/today")
}
