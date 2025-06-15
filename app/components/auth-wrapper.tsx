"use client"

import type React from "react"
import { useAuth } from "../contexts/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (user && pathname === "/") {
        router.push("/dashboard")
      } else if (!user && pathname !== "/") {
        router.push("/")
      }
    }
  }, [user, pathname, router])

  // Don't render anything during SSR to avoid hydration mismatch
  if (typeof window === "undefined") {
    return null
  }

  if (!user && pathname !== "/") {
    return null
  }

  return <>{children}</>
}
