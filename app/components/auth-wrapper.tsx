"use client"

import type React from "react"
import { useAuth } from "../contexts/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!hydrated) return;
    if (user && pathname === "/") {
      router.push("/dashboard")
    } else if (!user && pathname !== "/") {
      router.push("/")
    }
  }, [user, pathname, router, hydrated])

  // Só renderiza quando estiver hidratado
  if (!hydrated) {
    return null; // ou um loading, se preferir
  }
  if (!user && pathname !== "/") {
    return null;
  }

  return <>{children}</>
}
