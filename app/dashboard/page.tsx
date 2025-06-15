"use client"

import { useAuth } from "../contexts/auth-context"
import ModelerDashboard from "../components/modeler-dashboard"
import ExecutorDashboard from "../components/executor-dashboard"
import { useState, useEffect } from "react"

export default function Dashboard() {
  const { user } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || !user) {
    return null
  }

  return user.type === "modeler" ? <ModelerDashboard /> : <ExecutorDashboard />
}
