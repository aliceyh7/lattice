"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  Map,
  RotateCcw,
  BookOpen,
  Code2,
  BarChart3,
  Send,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/today", label: "Today", icon: Calendar },
  { href: "/roadmaps", label: "Roadmaps", icon: Map },
  { href: "/reviews", label: "Reviews", icon: RotateCcw },
  { href: "/papers", label: "Papers", icon: BookOpen },
  { href: "/leetcode", label: "Deep-ML", icon: Code2 },
  { href: "/metrics", label: "Metrics", icon: BarChart3 },
  { href: "/publish", label: "Publish", icon: Send },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-56 min-h-screen border-r bg-card px-3 py-4 shrink-0">
      <div className="mb-6 px-2">
        <span className="text-lg font-semibold tracking-tight">Lattice</span>
      </div>
      <nav className="flex-1 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
