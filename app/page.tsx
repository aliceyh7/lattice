import { isAuthenticated } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LandingPage() {
  const authed = await isAuthenticated()
  redirect(authed ? "/today" : "/login")
}
