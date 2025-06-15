"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "../../contexts/auth-context"
import { useProcess, type FormField } from "../../contexts/process-context"
import { ArrowLeft, CheckCircle, Clock, User, Settings, Square } from "lucide-react"
import Link from "next/link"

export default function ProcessExecution() {
  const params = useParams()
  const instanceId = params.instanceId as string
  const { user } = useAuth()
  const { instances, processes, completeTask } = useProcess()

  const [formData, setFormData] = useState<Record<string, any>>({})
  const [instance, setInstance] = useState(instances.find((i) => i.id === instanceId))
  const [process, setProcess] = useState(processes.find((p) => p.id === instance?.processId))

  useEffect(() => {
    const currentInstance = instances.find((i) => i.id === instanceId)
    const currentProcess = processes.find((p) => p.id === currentInstance?.processId)
    setInstance(currentInstance)
    setProcess(currentProcess)
  }, [instances, processes, instanceId])

  if (!instance || !process) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Instância de processo não encontrada</h2>
            <p className="text-muted-foreground mb-4">
              A instância do processo BPMN não foi encontrada ou você não tem permissão para acessá-la.
            </p>
            <Link href="/dashboard">
              <Button>Voltar ao Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentNode = process.nodes.find((n) => n.id === instance.currentNodeId)
  const currentForm = process.forms[instance.currentNodeId] || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const requiredFields = currentForm.filter((f) => f.required)
    const missingFields = requiredFields.filter((f) => !formData[f.id])

    if (missingFields.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios: ${missingFields.map((f) => f.label).join(", ")}`)
      return
    }

    completeTask(instanceId, instance.currentNodeId, formData)
    setFormData({})
  }

  const renderField = (field: FormField) => {
    const value = formData[field.id] || ""

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            id={field.id}
            value={value}
            onChange={(e) => setFormData((prev) => ({ ...prev, [field.id]: e.target.value }))}
            required={field.required}
            rows={3}
          />
        )
      case "select":
        return (
          <Select value={value} onValueChange={(val) => setFormData((prev) => ({ ...prev, [field.id]: val }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      default:
        return (
          <Input
            id={field.id}
            type={field.type}
            value={value}
            onChange={(e) => setFormData((prev) => ({ ...prev, [field.id]: e.target.value }))}
            required={field.required}
          />
        )
    }
  }

  const getTaskIcon = (bpmnType: string) => {
    switch (bpmnType) {
      case "userTask":
        return <User className="h-5 w-5 text-green-600" />
      case "serviceTask":
        return <Settings className="h-5 w-5 text-blue-600" />
      default:
        return <Square className="h-5 w-5 text-yellow-600" />
    }
  }

  const getTaskTypeLabel = (bpmnType: string) => {
    switch (bpmnType) {
      case "userTask":
        return "Tarefa do Usuário"
      case "serviceTask":
        return "Tarefa de Serviço"
      case "task":
        return "Tarefa"
      default:
        return "Elemento BPMN"
    }
  }

  if (instance.status === "completed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Processo BPMN Concluído!</h2>
            <p className="text-muted-foreground mb-6">
              O processo "{instance.processName}" foi executado com sucesso seguindo o fluxo BPMN modelado.
            </p>
            <Link href="/dashboard">
              <Button>Voltar ao Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">{instance.processName}</h1>
                <p className="text-sm text-muted-foreground">Execução de Processo BPMN</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <Badge variant="secondary">Em Execução</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getTaskIcon(currentNode?.data.bpmnType)}
              <div>
                <div>{currentNode?.data.label}</div>
                <div className="text-sm font-normal text-muted-foreground">
                  {getTaskTypeLabel(currentNode?.data.bpmnType)} • {currentNode?.data.description}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentForm.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Esta tarefa BPMN não possui formulário associado. Clique em continuar para prosseguir no fluxo.
                </p>
                <Button onClick={() => completeTask(instanceId, instance.currentNodeId, {})}>Continuar Fluxo</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">Formulário da Tarefa BPMN</h4>
                  <p className="text-sm text-blue-700">
                    Preencha os campos abaixo para completar esta etapa do processo de negócio.
                  </p>
                </div>

                {currentForm.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="submit">Concluir Tarefa</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Process Data */}
        {Object.keys(instance.data).length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Dados Coletados no Processo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {Object.entries(instance.data).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b">
                    <span className="font-medium">{key}:</span>
                    <span className="text-muted-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
