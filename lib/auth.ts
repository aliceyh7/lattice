import { cookies } from "next/headers"

const COOKIE = "lattice_session"
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies()
  const token = store.get(COOKIE)?.value
  return token === process.env.APP_SECRET
}

export async function setSession() {
  const store = await cookies()
  store.set(COOKIE, process.env.APP_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  })
}

export async function clearSession() {
  const store = await cookies()
  store.delete(COOKIE)
}
