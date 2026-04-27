import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect("/today")

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
      <div className="max-w-lg space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Lattice</h1>
          <p className="text-lg text-muted-foreground">
            Your personal study OS. Know exactly what to do today, capture what
            you learn, and track your path to Netflix RecSys.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 h-9 text-sm font-medium transition-colors hover:bg-primary/90"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-5 h-9 text-sm font-medium transition-colors hover:bg-muted"
          >
            Create account
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          14-week schedule pre-loaded · Papers · LeetCode · Notes · Spaced review
        </p>
      </div>
    </div>
  )
}
