import { isAuthenticated, setSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const authed = await isAuthenticated()
  if (authed) redirect("/today")

  async function login(formData: FormData) {
    "use server"
    const password = formData.get("password") as string
    if (password === process.env.APP_SECRET) {
      await setSession()
      redirect("/today")
    }
    redirect("/login?error=1")
  }

  const hasError = false // rendered server-side, error passed via query in redirect

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Lattice</h1>
          <p className="text-sm text-muted-foreground">Enter your password to continue</p>
        </div>
        <form action={login} className="space-y-3">
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoFocus
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
