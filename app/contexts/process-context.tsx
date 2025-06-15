"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Node, Edge } from "reactflow"

export interface FormField {
  id: string
  label: string
  type: "text" | "email" | "number" | "select" | "textarea" | "date"
  required: boolean
  options?: string[]
}

export interface ProcessDefinition {
  id: string
  name: string
  description: string
  nodes: Node[]
  edges: Edge[]
  forms: Record<string, FormField[]>
  bpmnXml?: string // Added BPMN XML support
  createdBy: string
  createdAt: string
}

export interface ProcessInstance {
  id: string
  processId: string
  processName: string
  currentNodeId: string
  status: "running" | "completed" | "paused"
  data: Record<string, any>
  startedBy: string
  startedAt: string
  completedAt?: string
}

interface ProcessContextType {
  processes: ProcessDefinition[]
  instances: ProcessInstance[]
  saveProcess: (process: ProcessDefinition) => void
  deleteProcess: (id: string) => void
  startProcess: (processId: string, startedBy: string) => string
  updateInstance: (instanceId: string, updates: Partial<ProcessInstance>) => void
  completeTask: (instanceId: string, nodeId: string, formData: Record<string, any>) => void
}

const ProcessContext = createContext<ProcessContextType | undefined>(undefined)

export function ProcessProvider({ children }: { children: ReactNode }) {
  const [processes, setProcesses] = useState<ProcessDefinition[]>([])
  const [instances, setInstances] = useState<ProcessInstance[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProcesses = localStorage.getItem("processes")
      const savedInstances = localStorage.getItem("instances")

      if (savedProcesses) {
        setProcesses(JSON.parse(savedProcesses))
      }
      if (savedInstances) {
        setInstances(JSON.parse(savedInstances))
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("processes", JSON.stringify(processes))
    }
  }, [processes])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("instances", JSON.stringify(instances))
    }
  }, [instances])

  const saveProcess = (process: ProcessDefinition) => {
    setProcesses((prev) => {
      const existing = prev.findIndex((p) => p.id === process.id)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = process
        return updated
      }
      return [...prev, process]
    })
  }

  const deleteProcess = (id: string) => {
    setProcesses((prev) => prev.filter((p) => p.id !== id))
  }

  const startProcess = (processId: string, startedBy: string): string => {
    const process = processes.find((p) => p.id === processId)
    if (!process) throw new Error("Process not found")

    // For BPMN processes, we'll need to parse the XML to find start events
    // For now, we'll use a simple approach
    const instanceId = `instance-${Date.now()}`

    const newInstance: ProcessInstance = {
      id: instanceId,
      processId,
      processName: process.name,
      currentNodeId: "StartEvent_1", // Default BPMN start event ID
      status: "running",
      data: {},
      startedBy,
      startedAt: new Date().toISOString(),
    }

    setInstances((prev) => [...prev, newInstance])
    return instanceId
  }

  const updateInstance = (instanceId: string, updates: Partial<ProcessInstance>) => {
    setInstances((prev) =>
      prev.map((instance) => (instance.id === instanceId ? { ...instance, ...updates } : instance)),
    )
  }

  const completeTask = (instanceId: string, nodeId: string, formData: Record<string, any>) => {
    const instance = instances.find((i) => i.id === instanceId)
    const process = processes.find((p) => p.id === instance?.processId)

    if (!instance || !process) return

    // For BPMN processes, we would need to parse the XML to find the next task
    // This is a simplified implementation
    const updates: Partial<ProcessInstance> = {
      data: { ...instance.data, ...formData },
      status: "completed", // Simplified - in real BPMN we'd parse the flow
      completedAt: new Date().toISOString(),
    }

    updateInstance(instanceId, updates)
  }

  return (
    <ProcessContext.Provider
      value={{
        processes,
        instances,
        saveProcess,
        deleteProcess,
        startProcess,
        updateInstance,
        completeTask,
      }}
    >
      {children}
    </ProcessContext.Provider>
  )
}

export function useProcess() {
  const context = useContext(ProcessContext)
  if (context === undefined) {
    throw new Error("useProcess must be used within a ProcessProvider")
  }
  return context
}
