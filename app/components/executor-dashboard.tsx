"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "../contexts/auth-context"
import { useProcess } from "../contexts/process-context"
import { Play, LogOut, Workflow, Clock, CheckCircle, Users, Square, Diamond } from "lucide-react"
import Link from "next/link"

export default function ExecutorDashboard() {
  const { user, logout } = useAuth()
  const { processes, instances, startProcess } = useProcess()

  const myInstances = instances.filter((i) => i.startedBy === user?.email)

  const handleStartProcess = (processId: string) => {
    if (user?.email) {
      const instanceId = startProcess(processId, user.email)
      window.location.href = `/process-execution/${instanceId}`
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getBPMNStats = (process: any) => {
    const stats = {
      tasks: 0,
      gateways: 0,
      events: 0,
    }

    process.nodes.forEach((node: any) => {
      if (node.data.bpmnType?.includes("Task") || node.data.bpmnType === "task") {
        stats.tasks++
      } else if (node.data.bpmnType?.includes("Gateway")) {
        stats.gateways++
      } else if (node.data.bpmnType?.includes("Event")) {
        stats.events++
      }
    })

    return stats
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-xl font-semibold">Executor de Processos BPMN</h1>
                <p className="text-sm text-muted-foreground">Execução de Processos de Negócio</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.email}</p>
                <Badge variant="secondary">Executor</Badge>
              </div>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Available Processes */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Processos Disponíveis</h2>
            {processes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Workflow className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum processo disponível</h3>
                  <p className="text-muted-foreground text-center">
                    Aguarde os analistas modelarem processos BPMN para execução
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {processes.map((process) => {
                  const stats = getBPMNStats(process)
                  return (
                    <Card key={process.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{process.name}</span>
                          <Badge variant="outline">BPMN</Badge>
                        </CardTitle>
                        <CardDescription>
                          {process.description || "Processo de negócio modelado em BPMN"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Square className="h-3 w-3" />
                              {stats.tasks} tarefas
                            </div>
                            <div className="flex items-center gap-1">
                              <Diamond className="h-3 w-3" />
                              {stats.gateways} decisões
                            </div>
                          </div>
                          <Button onClick={() => handleStartProcess(process.id)} className="w-full">
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar Processo
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* My Process Instances */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Minhas Execuções</h2>
            {myInstances.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma execução iniciada</h3>
                  <p className="text-muted-foreground text-center">Inicie um processo BPMN para começar a trabalhar</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myInstances.map((instance) => (
                  <Card key={instance.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{instance.processName}</span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(instance.status)}
                          <Badge className={getStatusColor(instance.status)}>
                            {instance.status === "running" ? "Em Execução" : "Concluído"}
                          </Badge>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Iniciado em {new Date(instance.startedAt).toLocaleDateString()}
                        {instance.completedAt && (
                          <span> • Concluído em {new Date(instance.completedAt).toLocaleDateString()}</span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {instance.status === "running" && (
                        <Link href={`/process-execution/${instance.id}`}>
                          <Button variant="outline" className="w-full">
                            <Play className="h-4 w-4 mr-2" />
                            Continuar Execução
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
